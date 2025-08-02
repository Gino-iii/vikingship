import React, { FC, useState, FunctionComponentElement, ReactNode } from 'react'
import classNames from 'classnames'
import { TabItemProps } from './tabItem'

// Tabs组件的属性接口定义
export interface TabsProps {
  /**当前激活 tab 面板的 index，默认为0 */
  defaultIndex?: number;
  /**可以扩展的 className */
  className?: string;
  /**点击 Tab 触发的回调函数 */
  onSelect?: (selectedIndex: number) => void;
  /**Tabs的样式，两种可选，默认为 line */
  type?: 'line' | 'card'; // 标签页样式类型：线条样式或卡片样式
  children?: ReactNode; // 子组件，通常是TabItem组件
}

/**
 * Tabs选项卡切换组件
 * 功能特点：
 * - 提供平级的区域将大块内容进行收纳和展现，保持界面整洁
 * - 支持两种样式：线条样式(line)和卡片样式(card)
 * - 支持默认激活标签页设置
 * - 支持标签页点击回调
 * - 支持禁用标签页
 * - 自动为子组件注入索引
 * - 只显示当前激活标签页的内容
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { Tabs } from 'vikingship'
 * ~~~
 */
export const Tabs: FC<TabsProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    defaultIndex, // 默认激活的标签页索引
    className, // 自定义类名
    onSelect, // 选择回调函数
    children, // 子组件
    type // 标签页样式类型
  } = props
  
  // 使用useState管理当前激活的标签页索引
  const [ activeIndex, setActiveIndex ] = useState(defaultIndex)
  
  /**
   * 处理标签页点击事件
   * @param e 点击事件对象
   * @param index 被点击的标签页索引
   * @param disabled 是否禁用
   */
  const handleClick = (e: React.MouseEvent, index: number, disabled: boolean | undefined) => {
    if (!disabled) {
      setActiveIndex(index) // 更新激活的标签页
      if (onSelect) {
        onSelect(index) // 调用外部传入的选择回调
      }
    }
  }
  
  // 构建导航栏的CSS类名
  const navClass = classNames('viking-tabs-nav', {
    'nav-line': type === 'line', // 线条样式
    'nav-card': type === 'card', // 卡片样式
  })
  
  /**
   * 渲染导航链接
   * @returns 渲染后的导航链接数组
   */
  const renderNavLinks = () => {
    return React.Children.map(children, (child, index) => {
      const childElement = child as FunctionComponentElement<TabItemProps>
      const { label, disabled } = childElement.props // 从子组件props中获取标签文本和禁用状态
      
      // 构建导航项的CSS类名
      const classes = classNames('viking-tabs-nav-item', {
        'is-active': activeIndex === index, // 激活状态样式
        'disabled': disabled, // 禁用状态样式
      })
      
      return (
        <li 
          className={classes} 
          key={`nav-item-${index}`}
          onClick={(e) => {handleClick(e, index, disabled)}} // 绑定点击事件
        >
          {label} {/* 显示标签文本 */}
        </li>
      )
    })
  }
  
  /**
   * 渲染标签页内容
   * @returns 渲染后的标签页内容
   */
  const renderContent = () => {
    return React.Children.map(children, (child, index) => {
      // 只渲染当前激活的标签页内容
      if (index === activeIndex) {
        return child
      }
    })
  }
  
  return (
    <div className={`viking-tabs ${className}`}>
      {/* 标签页导航栏 */}
      <ul className={navClass}>
        {renderNavLinks()}
      </ul>
      {/* 标签页内容区域 */}
      <div className="viking-tabs-content">
        {renderContent()}
      </div>
    </div>
  )
}

// 设置Tabs组件的默认属性
Tabs.defaultProps = {
  defaultIndex: 0, // 默认激活第一个标签页
  type: 'line' // 默认使用线条样式
}
export default Tabs;
