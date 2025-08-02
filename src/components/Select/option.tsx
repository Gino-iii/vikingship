import React, { FC, useContext, ReactNode } from 'react'
import classNames from 'classnames'
import Icon from '../Icon'
import { SelectContext } from './select'

// Option组件的属性接口定义
export interface SelectOptionProps {
  index?: string; // 选项索引，由Select组件自动注入
  /** 默认根据此属性值进行筛选，该值不能相同*/
  value: string; // 选项的值，必填，用于标识选项
  /** 选项的标签，若不设置则默认与 value 相同*/
  label?: string; // 选项的显示文本，可选
  /** 是否禁用该选项*/
  disabled?: boolean; // 是否禁用该选项
  children?: ReactNode; // 选项内容，可选
}

/**
 * Option选项组件
 * 功能特点：
 * - Select组件的子组件，用于定义下拉选项
 * - 支持禁用状态
 * - 支持选中状态显示
 * - 支持自定义标签文本
 * - 多选模式下显示选中图标
 * - 通过Context获取Select组件的状态
 * - 点击时触发选择事件
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Option } from 'vikingship'
 * ```
 */
export const Option: FC<SelectOptionProps> = ({value, label, disabled, children, index}) => {
  // 从SelectContext中获取选择状态和方法
  const { onSelect, selectedValues, multiple } = useContext(SelectContext)
  
  // 判断当前选项是否被选中
  const isSelected = selectedValues.includes(value)
  
  // 构建选项的CSS类名
  const classes = classNames('viking-select-item', {
    'is-disabled': disabled, // 禁用状态样式
    'is-selected': isSelected, // 选中状态样式
  })
  
  /**
   * 处理选项点击事件
   * @param e 点击事件对象
   * @param value 选项值
   * @param isSelected 是否已选中
   */
  const handleClick = (e: React.MouseEvent, value: string, isSelected: boolean) => {
    e.preventDefault() // 阻止默认行为
    
    // 只有在非禁用状态且有onSelect回调时才处理点击
    if(onSelect && !disabled) {
      onSelect(value, isSelected) // 调用父组件的选择回调
    }
  }
  
  return (
    <li key={index} className={classes} onClick={(e) => {handleClick(e, value, isSelected)}}>
      {/* 显示选项内容：优先显示children，其次显示label，最后显示value */}
      {children || (label ? label: value)}
      
      {/* 多选模式下，选中项显示勾选图标 */}
      {multiple && isSelected && <Icon icon="check"/>}
    </li>
  )
}

// 设置组件的displayName，用于Select组件识别子组件类型
Option.displayName = 'Option'

export default Option;
