import React, { FC, ReactNode, useContext, useEffect } from 'react'
import classNames from 'classnames'
import { FormContext } from './form'
import { CustomRule } from './useStore'

// 工具类型：使指定的属性变为必填，其他属性保持原样
export type SomeRequired<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>

// FormItem组件的属性接口定义
export interface FormItemProps {
  /**字段名 - 必填，用于标识表单字段 */
  name: string;
  /**label 标签的文本 - 可选，显示在表单控件前的标签 */
  label?: string;
  children?: ReactNode; // 子组件，通常是表单控件
  /**子节点的值的属性，如 checkbox 的是 'checked' */
  valuePropName?: string;
  /**设置收集字段值变更的时机，如 'onChange' */
  trigger?: string;
  /**设置如何将 event 的值转换成字段值 */
  getValueFromEvent?: (event: any) => any;
  /**校验规则，设置字段的校验逻辑。请看 async validator 了解更多规则 */
  rules?: CustomRule[];
  /**设置字段校验的时机，如 'onBlur' */
  validateTrigger?: string;
}

/**
 * FormItem表单项组件
 * 功能特点：
 * - 包装单个表单控件，提供标签、验证、错误提示等功能
 * - 自动管理表单字段的状态和验证
 * - 支持自定义验证规则
 * - 自动为子组件注入value和onChange等属性
 * - 显示验证错误信息
 * - 支持必填字段标识
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { FormItem } from 'vikingship'
 * ```
 */
export const FormItem: FC<FormItemProps> = (props) => {
  // 从props中解构出需要的属性，使用SomeRequired确保某些属性有默认值
  const {     
    label,
    children,
    name,
    valuePropName,
    trigger,
    getValueFromEvent,
    rules,
    validateTrigger
  } = props as SomeRequired<FormItemProps, 'getValueFromEvent' | 'trigger' | 'valuePropName' | 'validateTrigger'>
  
  // 从FormContext中获取表单状态管理的方法和数据
  const { dispatch, fields, initialValues, validateField } = useContext(FormContext)
  
  // 构建行容器的CSS类名
  const rowClass = classNames('viking-row', {
    'viking-row-no-label': !label // 没有标签时添加特殊样式
  })
  
  // 组件挂载时初始化字段状态
  useEffect(() => {
    const value = (initialValues && initialValues[name]) || '' // 获取初始值
    // 向表单状态中添加新字段
    dispatch({ 
      type: 'addField', 
      name, 
      value: { 
        label, 
        name, 
        value, 
        rules: rules || [], 
        errors: [], 
        isValid: true 
      }
    })
  }, [])
  
  // 从表单状态中获取当前字段的信息
  const fieldState = fields[name]
  const value = fieldState && fieldState.value // 字段当前值
  const errors = fieldState && fieldState.errors // 字段验证错误
  const isRequired = rules?.some(rule => (typeof rule !== 'function') && rule.required) // 是否为必填字段
  const hasError = errors && errors.length > 0 // 是否有验证错误
  
  // 构建标签的CSS类名
  const labelClass = classNames({
    'viking-form-item-required': isRequired // 必填字段添加必填标识样式
  })
  
  // 构建控件容器的CSS类名
  const itemClass = classNames('viking-form-item-control', {
    'viking-form-item-has-error': hasError // 有错误时添加错误样式
  })
  
  // 处理字段值更新
  const onValueUpdate = (e:any) => {
    const value = getValueFromEvent(e) // 从事件中提取值
    console.log('new value', value)
    dispatch({ type: 'updateValue', name, value }) // 更新字段值
  }
  
  // 处理字段验证
  const onValueValidate = async () => {
    await validateField(name) // 验证当前字段
  }
  
  // 构建要注入给子组件的属性
  const controlProps: Record<string, any> = {}
  controlProps[valuePropName] = value // 设置值属性
  controlProps[trigger] = onValueUpdate // 设置值更新事件
  if (rules) {
    controlProps[validateTrigger] = onValueValidate // 设置验证事件
  }
  
  // 处理子组件
  const childList = React.Children.toArray(children) // 将children转换为数组
  
  // 检查子组件数量
  if (childList.length === 0) {
    console.error('No child element found in Form.Item, please provide one form component')
  }
  if (childList.length > 1) {
    console.warn('Only support one child element in Form.Item, others will be omitted')
  }
  if (!React.isValidElement(childList[0])) {
    console.error('Child component is not a valid React Element')
  }
  
  // 获取第一个子组件
  const child = childList[0] as React.ReactElement
  
  // 克隆子组件并注入表单属性
  const returnChildNode = React.cloneElement(
    child,
    { ...child.props, ...controlProps } // 合并原有属性和表单属性
  )
  
  return (
    <div className={rowClass}>
      {/* 渲染标签 */}
      { label &&
        <div className='viking-form-item-label'>
          <label title={label} className={labelClass}>
            {label}
          </label>
        </div>
      }
      {/* 渲染表单控件和错误信息 */}
      <div className='viking-form-item'>
        <div className={itemClass}>
          {returnChildNode}
        </div>
        {/* 显示验证错误信息 */}
        { hasError && 
          <div className='viking-form-item-explain'>
            <span>{errors[0].message}</span>
          </div>
        }
      </div>
    </div>
  )
}

// 设置FormItem组件的默认属性
FormItem.defaultProps = {
  valuePropName: 'value', // 默认值属性名
  trigger: 'onChange', // 默认值更新时机
  validateTrigger: 'onBlur', // 默认验证时机
  getValueFromEvent: (e) => e.target.value // 默认值提取方法
}
export default FormItem
