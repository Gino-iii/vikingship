import React, { FC, useState, createContext, useRef, FunctionComponentElement, useEffect, ReactNode } from 'react'
import classNames from 'classnames'
import Input from '../Input'
import Icon from '../Icon'
import useClickOutside from '../../hooks/useClickOutside'
import Transition from '../Transition/transition'
import { SelectOptionProps } from './option'

// Select组件的属性接口定义
export interface SelectProps {
  /**指定默认选中的条目	 可以是是字符串或者字符串数组*/
  defaultValue?: string | string[];
  /** 选择框默认文字*/
  placeholder?: string;
  /** 是否禁用*/
  disabled?: boolean;
  /** 是否支持多选*/
  multiple?: boolean;
  /** select input 的 name 属性	 */
  name?: string;
  /**选中值发生变化时触发 */
  onChange?: (selectedValue: string, selectedValues: string[]) => void;
  /**下拉框出现/隐藏时触发 */
  onVisibleChange?: (visible: boolean) => void;
  children?: ReactNode; // 子组件，通常是Option组件
}

// Select上下文接口，用于在Option组件中共享状态
export interface ISelectContext {
  onSelect?: (value: string, isSelected?: boolean) => void; // 选择选项的回调函数
  selectedValues: string[]; // 当前选中的值数组
  multiple?: boolean; // 是否支持多选
}

// 创建Select上下文，用于在Option组件中访问选择状态
export const SelectContext = createContext<ISelectContext>({ selectedValues: []})

/**
 * Select下拉选择器组件
 * 功能特点：
 * - 弹出一个下拉菜单给用户选择操作
 * - 支持单选和多选模式
 * - 支持默认值设置
 * - 支持禁用状态
 * - 支持自定义占位符文本
 * - 支持下拉框显示/隐藏回调
 * - 支持选择值变化回调
 * - 多选模式下显示已选标签
 * - 使用Context API在子组件间共享状态
 * - 支持点击外部关闭下拉框
 * - 带有展开/收起动画效果
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { Select } from 'vikingship'
 * // 然后可以使用 <Select> 和 <Select.Option>
 * ~~~
 */
export const Select:FC<SelectProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    defaultValue, // 默认选中值
    placeholder, // 占位符文本
    children, // 子组件
    multiple, // 是否多选
    name, // 输入框name属性
    disabled, // 是否禁用
    onChange, // 值变化回调
    onVisibleChange, // 显示状态变化回调
  }= props
  
  // 使用ref获取输入框和容器的引用
  const input = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLInputElement>(null)
  const containerWidth = useRef(0) // 容器宽度，用于多选标签的宽度限制
  
  // 组件状态管理
  const [ selectedValues, setSelectedValues ] = useState<string[]>(Array.isArray(defaultValue)? defaultValue :[]) // 选中的值数组
  const [ menuOpen, setOpen ] = useState(false) // 下拉菜单是否打开
  const [ value, setValue ] = useState(typeof defaultValue === 'string' ? defaultValue : '') // 输入框显示的值
  
  /**
   * 处理选项点击事件
   * @param value 选项值
   * @param isSelected 是否已选中（多选模式下用于取消选择）
   */
  const handleOptionClick = (value: string, isSelected?: boolean) => {
    // 更新输入框显示的值
    if (!multiple) {
      // 单选模式：关闭下拉框并设置值
      setOpen(false)
      setValue(value)
      if (onVisibleChange) {
        onVisibleChange(false)
      }
    } else {
      // 多选模式：清空输入框值
      setValue('')
    }
    
    let updatedValues = [value]
    
    // 多选模式下的值更新逻辑
    if (multiple) {
      // 如果已选中，则从选中数组中移除；否则添加到选中数组
      updatedValues = isSelected ? selectedValues.filter((v) => v !== value) :  [...selectedValues, value]
      setSelectedValues(updatedValues)
    } 
    
    // 调用外部传入的onChange回调
    if(onChange) {
      onChange(value, updatedValues)
    }
  }
  
  // 监听选中值变化，更新输入框焦点和占位符
  useEffect(() => {
    // 聚焦输入框
    if (input.current) {
      input.current.focus()
      if (multiple && selectedValues.length > 0) {
        // 多选且有选中值时，清空占位符
        input.current.placeholder = ''
      } else {
        // 否则显示占位符
        if (placeholder) input.current.placeholder = placeholder
      }
    }
  }, [selectedValues, multiple, placeholder])
  
  // 获取容器宽度，用于多选标签的宽度限制
  useEffect(() => {
    if (containerRef.current) {
      containerWidth.current = containerRef.current.getBoundingClientRect().width
    }
  })
  
  // 点击外部关闭下拉框
  useClickOutside(containerRef, () => { 
    setOpen(false)
    if (onVisibleChange && menuOpen) {
      onVisibleChange(false)
    }
  })
  
  // 构建传递给Context的值
  const passedContext: ISelectContext = {
    onSelect: handleOptionClick, // 选择处理函数
    selectedValues: selectedValues, // 当前选中的值
    multiple: multiple, // 是否多选
  }
  
  /**
   * 处理输入框点击事件
   * @param e 点击事件对象
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!disabled) {
      // 切换下拉框显示状态
      setOpen(!menuOpen)
      if (onVisibleChange) {
        onVisibleChange(!menuOpen)
      }
    }
  }
  
  /**
   * 生成选项组件，为每个Option注入索引
   * @returns 处理后的选项组件数组
   */
  const generateOptions = () => {
    return React.Children.map(children, (child, i) => {
      const childElement = child as FunctionComponentElement<SelectOptionProps>
      
      // 检查子组件是否为Option
      if (childElement.type.displayName === 'Option') {
        // 克隆子组件并注入索引
        return React.cloneElement(childElement, {
          index: `select-${i}`
        })
      } else {
        console.error("Warning: Select has a child which is not a Option component")
      }
    })
  }
  
  // 构建Select容器的CSS类名
  const containerClass = classNames('viking-select', {
    'menu-is-open': menuOpen, // 下拉框打开状态
    'is-disabled': disabled, // 禁用状态
    'is-multiple': multiple, // 多选状态
  })
  
  return (
    <div className={containerClass} ref={containerRef}>
      {/* 输入框区域 */}
      <div className="viking-select-input" onClick={handleClick}>
        <Input
          ref={input}
          placeholder={placeholder} 
          value={value} 
          readOnly // 只读，防止用户直接输入
          icon="angle-down" // 下拉箭头图标
          disabled={disabled}
          name={name}
        />
      </div>
      
      {/* 下拉选项区域 */}
      <SelectContext.Provider value={passedContext}>
        <Transition
            in={menuOpen} // 控制动画的显示/隐藏
            animation="zoom-in-top" // 从顶部缩放的动画效果
            timeout={300} // 动画持续时间
          >
          <ul className="viking-select-dropdown">
            {generateOptions()}
          </ul>
        </Transition>
      </SelectContext.Provider>
      
      {/* 多选模式下的已选标签区域 */}
      {multiple &&
        <div className="viking-selected-tags" style={{maxWidth: containerWidth.current - 32}}> 
          {
            selectedValues.map((value, index) => {
              return (
                <span className="viking-tag" key={`tag-${index}`}>
                  {value}
                  {/* 删除标签的图标 */}
                  <Icon icon="times" onClick={() => {handleOptionClick(value, true)}} />
                </span>
              )
            })
          }
        </div>
      }
    </div>
  )
}

// 设置Select组件的默认属性
Select.defaultProps = {
  name: 'viking-select', // 默认name属性
  placeholder: '请选择' // 默认占位符文本
}
export default Select;
