import React, { ReactNode, createContext, forwardRef, useImperativeHandle } from 'react'
import { ValidateError } from 'async-validator'
import useStore, { FormState }from './useStore';

// 定义渲染属性类型，接收表单状态并返回React节点
export type RenderProps = (form: FormState) => ReactNode

// Form组件的属性接口定义
export interface FormProps {
  /**表单名称，会作为表单字段 id 前缀使用 */
  name?: string;
  /**表单默认值，只有初始化以及重置时生效 */
  initialValues?: Record<string, any>;
  children?: ReactNode | RenderProps; // 支持普通子节点或函数式子节点
  /**提交表单且数据验证成功后回调事件 */
  onFinish?: (values: Record<string, any>) => void;
  /**提交表单且数据验证失败后回调事件 */
  onFinishFailed?: (values: Record<string, any>, errors: Record<string, ValidateError[]>) => void;
}

// Form上下文类型定义，包含表单状态管理的方法和数据
export type IFormContext = 
  Pick<ReturnType<typeof useStore>, 'dispatch' | 'fields' | 'validateField'> // 从useStore中选取需要的属性
  & Pick<FormProps, 'initialValues'> // 合并FormProps中的initialValues

// Form引用类型定义，暴露给外部的方法（排除内部使用的fields、dispatch、form）
export type IFormRef = Omit<ReturnType<typeof useStore>, 'fields' | 'dispatch' | 'form'>

// 创建Form上下文，用于在FormItem组件中访问表单状态和方法
export const FormContext = createContext<IFormContext>({} as IFormContext)

/**
 * Form表单组件
 * 功能特点：
 * - 提供表单状态管理和验证功能
 * - 支持表单默认值设置
 * - 支持表单提交成功/失败回调
 * - 支持函数式子组件，可以访问表单状态
 * - 通过forwardRef暴露表单方法给父组件
 * - 使用Context API在子组件间共享表单状态
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Form } from 'vikingship'
 * ```
 */
export const Form = forwardRef<IFormRef, FormProps>((props, ref) => {
  // 从props中解构出需要的属性
  const { name, children, initialValues, onFinish, onFinishFailed } = props
  
  // 使用自定义hook管理表单状态
  const { form, fields, dispatch, ...restProps } = useStore(initialValues)
  const { validateField, validateAllFields } = restProps
  
  // 通过useImperativeHandle暴露表单方法给父组件
  // 只暴露验证相关的方法，不暴露内部状态管理方法
  useImperativeHandle(ref, () => {
    return {
      ...restProps
    }
  })
  
  // 构建传递给Context的值
  const passedContext: IFormContext = {
    dispatch, // 用于更新表单字段状态
    fields, // 当前表单字段状态
    initialValues, // 表单初始值
    validateField // 验证单个字段的方法
  }
  
  // 处理表单提交事件
  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // 阻止默认提交行为
    e.stopPropagation() // 阻止事件冒泡
    
    // 验证所有表单字段
    const { isValid, errors, values } = await validateAllFields()
    
    // 根据验证结果调用相应的回调函数
    if (isValid && onFinish) {
      onFinish(values) // 验证成功，调用成功回调
    } else if(!isValid && onFinishFailed) {
      onFinishFailed(values, errors) // 验证失败，调用失败回调
    }
  }
  
  // 处理子组件的渲染
  let childrenNode: ReactNode
  if (typeof children === 'function') {
    // 如果children是函数，则传入表单状态并执行
    childrenNode = children(form)
  } else {
    // 如果children是普通React节点，直接使用
    childrenNode = children
  }
  
  return (
    <form name={name} className="viking-form" onSubmit={submitForm}>
      {/* 通过Context.Provider提供表单状态和方法给子组件 */}
      <FormContext.Provider value={passedContext}>
        {childrenNode}
      </FormContext.Provider>
    </form>
  )
})

// 设置Form组件的默认属性
Form.defaultProps = {
  name: 'viking_form' // 默认表单名称
}

export default Form
