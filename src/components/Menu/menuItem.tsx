import React, { FC, useContext, ReactNode } from 'react'
import classNames from 'classnames'
import { MenuContext } from './menu'

// MenuItem组件的属性接口定义
export interface MenuItemProps {
  index?: string; // 菜单项的索引，由Menu组件自动注入
  /**选项是否被禁用 */
  disabled?: boolean;
  /**选项扩展的 className */
  className?: string;
  /**选项的自定义 style */
  style?: React.CSSProperties;
  children?: ReactNode; // 菜单项内容
}

/**
 * MenuItem菜单项组件
 * 功能特点：
 * - 单个菜单项组件，用于在Menu组件中显示
 * - 支持禁用状态
 * - 支持激活状态（高亮显示）
 * - 支持自定义样式和类名
 * - 通过Context获取菜单状态
 * - 点击时触发选择事件
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { MenuItem } from 'vikingship'
 * ```
 */
export const MenuItem: FC<MenuItemProps> = (props) => {
  // 从props中解构出需要的属性
  const { index, disabled, className, style, children } = props
  
  // 从MenuContext中获取菜单状态
  const context = useContext(MenuContext)
  
  // 构建菜单项的CSS类名
  const classes = classNames('menu-item', className, {
    'is-disabled': disabled, // 禁用状态样式
    'is-active': context.index === index // 激活状态样式（当前索引匹配时）
  })
  
  /**
   * 处理菜单项点击事件
   * 只有在非禁用状态且index为字符串时才触发选择事件
   */
  const handleClick = () => {
    if (context.onSelect && !disabled && (typeof index === 'string')) {
      context.onSelect(index) // 调用父组件的选择回调
    }
  }
  
  return (
    <li className={classes} style={style} onClick={handleClick}>
      {children}
    </li>
  )
}

// 设置组件的displayName，用于Menu组件识别子组件类型
MenuItem.displayName = 'MenuItem'
export default MenuItem;
