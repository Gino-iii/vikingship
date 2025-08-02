import React, { ReactElement, InputHTMLAttributes, ChangeEvent, forwardRef } from 'react'
import classNames from 'classnames'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Icon from '../Icon/icon'

// 定义输入框尺寸类型，支持大号和小号
type InputSize = 'lg' | 'sm'

// Input组件的属性接口，继承HTML input的所有属性（除了size）
export interface InputProps extends Omit<InputHTMLAttributes<HTMLElement>, 'size' > {
  /**是否禁用 Input */
  disabled?: boolean;
  /**设置 input 大小，支持 lg 或者是 sm */
  size?: InputSize;
  /**添加图标，在右侧悬浮添加一个图标，用于提示 */
  icon?: IconProp;
  /**添加前缀 用于配置一些固定组合 */
  prepend?: string | ReactElement;
  /**添加后缀 用于配置一些固定组合 */
  append?: string | ReactElement;
  onChange? : (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Input输入框组件
 * 功能特点：
 * - 通过鼠标或键盘输入内容，是最基础的表单域的包装
 * - 支持HTML Input的所有基本属性
 * - 支持两种尺寸：大号(lg)和小号(sm)
 * - 支持禁用状态
 * - 支持添加图标（在右侧悬浮显示）
 * - 支持添加前缀和后缀（用于配置固定组合）
 * - 支持受控和非受控模式
 * - 使用forwardRef支持ref转发
 * 
 * ~~~js
 * // 这样引用
 * import { Input } from 'vikingship'
 * ~~~
 * 
 * 支持 HTMLInput 的所有基本属性
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  // 从props中解构出需要的属性
  const {
    disabled,
    size,
    icon,
    prepend,
    append,
    style,
    ...restProps
  } = props
  
  // 构建输入框容器的CSS类名
  const cnames = classNames('viking-input-wrapper', {
    [`input-size-${size}`]: size, // 根据size添加对应的尺寸样式类
    'is-disabled': disabled, // 禁用状态样式
    'input-group': prepend || append, // 有前缀或后缀时添加组合样式
    'input-group-append': !!append, // 有后缀时添加后缀样式
    'input-group-prepend': !!prepend // 有前缀时添加前缀样式
  })
  
  /**
   * 修复受控组件的值
   * 确保undefined或null值被转换为空字符串，避免React警告
   * @param value 输入值
   * @returns 修复后的值
   */
  const fixControlledValue = (value: any) => {
    if (typeof value === 'undefined' || value === null) {
      return ''
    }
    return value
  }
  
  // 处理受控组件的值
  if('value' in props) {
    delete restProps.defaultValue // 受控模式下删除defaultValue
    restProps.value = fixControlledValue(props.value) // 修复value值
  }
  
  return (
    <div className={cnames} style={style}>
      {/* 渲染前缀内容 */}
      {prepend && <div className="viking-input-group-prepend">{prepend}</div>}
      
      {/* 渲染图标（在输入框右侧悬浮显示） */}
      {icon && <div className="icon-wrapper"><Icon icon={icon} title={`title-${icon}`}/></div>}
      
      {/* 渲染输入框主体 */}
      <input
        ref={ref} // 转发ref到原生input元素
        className="viking-input-inner"
        disabled={disabled}
        {...restProps} // 展开其他HTML属性
      />
      
      {/* 渲染后缀内容 */}
      {append && <div className="viking-input-group-append">{append}</div>}
    </div>
  )
})

export default Input;
