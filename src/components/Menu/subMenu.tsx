import React,{ FC, useContext, useState, FunctionComponentElement, ReactNode } from 'react'
import classNames from 'classnames'
import { MenuContext } from './menu'
import { MenuItemProps } from './menuItem'
import Icon from '../Icon/icon'
import Transition from '../Transition/transition'

// SubMenu组件的属性接口定义
export interface SubMenuProps {
  index?: string; // 子菜单的索引，由Menu组件自动注入
  /**下拉菜单选项的文字 */
  title: string;
  /**下拉菜单选型的扩展类名 */
  className?: string;
  children?: ReactNode; // 子菜单项
}

/**
 * SubMenu子菜单组件
 * 功能特点：
 * - 下拉子菜单组件，可以包含多个MenuItem
 * - 支持横向和纵向两种模式
 * - 横向模式：鼠标悬停显示/隐藏
 * - 纵向模式：点击展开/收起
 * - 支持默认打开状态设置
 * - 带有展开/收起动画效果
 * - 自动为子MenuItem注入索引
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { SubMenu } from 'vikingship'
 * ```
 */
export const SubMenu: FC<SubMenuProps> = ({ index, title, children, className}) => {
  // 从MenuContext中获取菜单状态
  const context = useContext(MenuContext)
  
  // 获取默认打开的子菜单列表
  const openedSubMenus = context.defaultOpenSubMenus as Array<string>
  
  // 判断当前子菜单是否应该默认打开
  // 只有在纵向模式下且在默认打开列表中时才默认打开
  const isOpend = (index && context.mode === 'vertical') ? openedSubMenus.includes(index) : false
  
  // 使用useState管理子菜单的打开/关闭状态
  const [ menuOpen, setOpen ] = useState(isOpend)
  
  // 构建子菜单容器的CSS类名
  const classes = classNames('menu-item submenu-item', className, {
    'is-active': context.index === index, // 激活状态样式
    'is-opened': menuOpen, // 打开状态样式
    'is-vertical': context.mode === 'vertical' // 纵向模式样式
  })
  
  /**
   * 处理子菜单标题点击事件（纵向模式）
   * @param e 点击事件对象
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // 阻止默认行为
    setOpen(!menuOpen) // 切换打开/关闭状态
  }
  
  // 用于鼠标悬停的定时器
  let timer: any
  
  /**
   * 处理鼠标悬停事件（横向模式）
   * @param e 鼠标事件对象
   * @param toggle 是否打开子菜单
   */
  const handleMouse = (e: React.MouseEvent, toggle: boolean) => {
    clearTimeout(timer) // 清除之前的定时器
    e.preventDefault()
    timer = setTimeout(() => {
      setOpen(toggle) // 延迟300ms后设置状态，避免鼠标快速移动时的闪烁
    }, 300)
  }
  
  // 根据菜单模式设置不同的事件处理
  const clickEvents = context.mode === 'vertical' ? {
    onClick: handleClick // 纵向模式使用点击事件
  } : {}
  
  const hoverEvents = context.mode !== 'vertical' ? {
    onMouseEnter: (e: React.MouseEvent) => { handleMouse(e, true)}, // 鼠标进入时打开
    onMouseLeave: (e: React.MouseEvent) => { handleMouse(e, false)} // 鼠标离开时关闭
  } : {}
  
  /**
   * 渲染子菜单项
   * @returns 渲染后的子菜单内容
   */
  const renderChildren = () => {
    // 构建子菜单容器的CSS类名
    const subMenuClasses = classNames('viking-submenu', {
      'menu-opened': menuOpen // 打开状态样式
    })
    
    // 处理子组件，为每个MenuItem注入索引
    const childrenComponent = React.Children.map(children, (child, i) => {
      const childElement = child as FunctionComponentElement<MenuItemProps>
      
      // 检查子组件是否为MenuItem
      if (childElement.type.displayName === 'MenuItem') {
        // 克隆子组件并注入索引（格式：父索引-子索引）
        return React.cloneElement(childElement, {
          index: `${index}-${i}`
        })
      } else {
        console.error("Warning: SubMenu has a child which is not a MenuItem component")
      }
    })
    
    return (
      <Transition
        in={menuOpen} // 控制动画的显示/隐藏
        timeout={300} // 动画持续时间
        animation="zoom-in-top" // 从顶部缩放的动画效果
      >
        <ul className={subMenuClasses}>
          {childrenComponent}
        </ul>
      </Transition>
    )
  }
  
  return (
    <li key={index} className={classes} {...hoverEvents}>
      {/* 子菜单标题区域 */}
      <div className="submenu-title" {...clickEvents}>
        {title}
        {/* 展开/收起箭头图标 */}
        <Icon icon="angle-down" className="arrow-icon"/>
      </div>
      {/* 子菜单内容 */}
      {renderChildren()}
    </li>
  )
}

// 设置组件的displayName，用于Menu组件识别子组件类型
SubMenu.displayName = 'SubMenu'
export default SubMenu;
