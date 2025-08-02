import React, { FC, useState, ChangeEvent, KeyboardEvent, ReactElement, useEffect, useRef } from 'react'
import classNames from 'classnames'
import Input, { InputProps } from '../Input/input'
import Icon from '../Icon/icon'
import Transition from '../Transition/transition'
import useDebounce from '../../hooks/useDebounce'
import useClickOutside from '../../hooks/useClickOutside'

// 定义数据源对象的基础接口，必须包含value属性
interface DataSourceObject {
  value: string;
}

// 定义数据源类型，支持泛型扩展，但必须包含DataSourceObject的所有属性
export type DataSourceType<T = {}> = T & DataSourceObject

// AutoComplete组件的属性接口，继承Input组件的属性（除了onSelect和onChange）
export interface AutoCompleteProps extends Omit<InputProps, 'onSelect' | 'onChange'> {
  /**
   * 获取建议数据的方法 - 核心功能函数
   * 接收当前输入字符串，返回同步数组或异步Promise
   * 支持同步和异步两种数据获取方式
   */
  fetchSuggestions: (str: string) => DataSourceType[] | Promise<DataSourceType[]>;
  /** 点击选中建议项时触发的回调函数 */
  onSelect?: (item: DataSourceType) => void;
  /** 文本框内容发生改变时触发的事件回调 */
  onChange?: (value: string) => void;
  /** 支持自定义渲染下拉项，返回ReactElement */
  renderOption?: (item: DataSourceType) => ReactElement;
}

/**
 * AutoComplete自动完成组件
 * 功能特点：
 * - 输入框自动完成功能，支持同步和异步数据获取
 * - 继承Input组件的所有属性
 * - 支持键盘事件选择（上下箭头、回车、ESC）
 * - 支持自定义渲染下拉选项
 * - 带有防抖和点击外部关闭功能
 * - 支持加载状态显示
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { AutoComplete } from 'vikingship'
 * ~~~
 */
export const AutoComplete: FC<AutoCompleteProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    fetchSuggestions,
    onSelect,
    onChange,
    value,
    renderOption,
    ...restProps
  } = props

  // 组件内部状态管理
  const [ inputValue, setInputValue ] = useState(value as string) // 输入框的值
  const [ suggestions, setSugestions ] = useState<DataSourceType[]>([]) // 建议列表数据
  const [ loading, setLoading ] = useState(false) // 加载状态
  const [ showDropdown, setShowDropdown] = useState(false) // 是否显示下拉框
  const [ highlightIndex, setHighlightIndex] = useState(-1) // 当前高亮的选项索引
  
  // 使用ref来控制是否触发搜索，避免初始化时触发
  const triggerSearch = useRef(false)
  // 组件容器的ref，用于点击外部关闭功能
  const componentRef = useRef<HTMLDivElement>(null)
  // 使用防抖hook，延迟300ms执行搜索
  const debouncedValue = useDebounce(inputValue, 300)
  
  // 点击组件外部时清空建议列表
  useClickOutside(componentRef, () => { setSugestions([])})
  
  // 监听防抖后的输入值变化，执行搜索逻辑
  useEffect(() => {
    if (debouncedValue && triggerSearch.current) {
      setSugestions([]) // 清空之前的建议
      const results = fetchSuggestions(debouncedValue) // 获取新的建议
      
      // 处理异步Promise结果
      if (results instanceof Promise) {
        setLoading(true) // 显示加载状态
        results.then(data => {
          setLoading(false) // 隐藏加载状态
          setSugestions(data) // 设置建议数据
          if (data.length > 0) {
            setShowDropdown(true) // 显示下拉框
          }
        })
      } else {
        // 处理同步结果
        setSugestions(results)
        setShowDropdown(true)
        if (results.length > 0) {
          setShowDropdown(true)
        } 
      }
    } else {
      setShowDropdown(false) // 没有输入值时隐藏下拉框
    }
    setHighlightIndex(-1) // 重置高亮索引
  }, [debouncedValue, fetchSuggestions])
  
  // 处理高亮索引的边界情况
  const highlight = (index: number) => {
    if (index < 0) index = 0 // 不能小于0
    if (index >= suggestions.length) {
      index = suggestions.length - 1 // 不能超过最大索引
    }
    setHighlightIndex(index)
  }
  
  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch(e.keyCode) {
      case 13: // 回车键 - 选择当前高亮的选项
        if (suggestions[highlightIndex]) {
          handleSelect(suggestions[highlightIndex])
        }
        break
      case 38: // 上箭头键 - 向上选择
        highlight(highlightIndex - 1)
        break
      case 40: // 下箭头键 - 向下选择
        highlight(highlightIndex + 1)
        break
      case 27: // ESC键 - 关闭下拉框
        setShowDropdown(false)
        break
      default:
        break
    }
  }
  
  // 处理输入框内容变化
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim() // 去除首尾空格
    console.log('triggered the value', value)
    setInputValue(value) // 更新输入值
    if (onChange) {
      onChange(value) // 调用外部onChange回调
    }
    triggerSearch.current = true // 标记需要触发搜索
  }
  
  // 处理选择建议项
  const handleSelect = (item: DataSourceType) => {
    setInputValue(item.value) // 设置输入框值为选中项的值
    setShowDropdown(false) // 隐藏下拉框
    if (onSelect) {
      onSelect(item) // 调用外部onSelect回调
    }
    triggerSearch.current = false // 标记不需要触发搜索
  }
  
  // 渲染建议项模板，支持自定义渲染
  const renderTemplate = (item: DataSourceType) => {
    return renderOption ? renderOption(item) : item.value
  }
  
  // 生成下拉框内容
  const generateDropdown = () => {
    return (
      <Transition
        in={showDropdown || loading} // 显示下拉框或加载状态时显示
        animation="zoom-in-top" // 从顶部缩放的动画效果
        timeout={300} // 动画持续时间
        onExited={() => {setSugestions([])}} // 动画结束后清空建议列表
      >
        <ul className="viking-suggestion-list">
          {/* 加载状态显示旋转图标 */}
          { loading &&
            <div className="suggstions-loading-icon">
              <Icon icon="spinner" spin/>
            </div>
          }
          {/* 渲染建议列表项 */}
          {suggestions.map((item, index) => {
            const cnames = classNames('suggestion-item', {
              'is-active': index === highlightIndex // 当前高亮项添加active样式
            })
            return (
              <li key={index} className={cnames} onClick={() => handleSelect(item)}>
                {renderTemplate(item)}
              </li>
            )
          })}
        </ul>
      </Transition>
    )
  }
  
  return (
    <div className="viking-auto-complete" ref={componentRef}>
      {/* 输入框组件 */}
      <Input
        {...restProps}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {/* 下拉建议框 */}
      {generateDropdown()}
    </div>
  )
}

export default AutoComplete;

