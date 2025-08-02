import React, { FC, useState, createContext, CSSProperties, ReactNode } from 'react'
import classNames from 'classnames'
import { MenuItemProps } from './menuItem'

// 定义菜单模式类型，支持横向和纵向两种布局
type MenuMode = 'horizontal' | 'vertical'

// Menu组件的属性接口定义
export interface MenuProps {
  /**默认 active 的菜单项的索引值 */
  defaultIndex?: string;
  className?: string; // 自定义CSS类名
  /**菜单类型 横向或者纵向 */
  mode?: MenuMode;
  style?: CSSProperties; // 自定义样式
  /**点击菜单项触发的回掉函数 */
  onSelect?: (selectedIndex: string) => void;
  /**设置子菜单的默认打开 只在纵向模式下生效 */
  defaultOpenSubMenus?: string[];
  children?: ReactNode; // 子组件
}

// Menu上下文接口，用于在子组件间共享状态
interface IMenuContext {
  index: string; // 当前激活的菜单项索引
  onSelect?: (selectedIndex: string) => void; // 选择菜单项的回调函数
  mode?: MenuMode; // 菜单模式
  defaultOpenSubMenus?: string[]; // 默认打开的子菜单
}

// 创建Menu上下文，用于在MenuItem和SubMenu组件中访问菜单状态
export const MenuContext = createContext<IMenuContext>({ index: '0' })

/**
 * Menu菜单组件
 * 功能特点：
 * - 为网站提供导航功能的菜单
 * - 支持横向和纵向两种模式
 * - 支持下拉子菜单
 * - 支持默认激活项设置
 * - 支持默认打开的子菜单设置
 * - 使用Context API在子组件间共享状态
 * - 自动为子组件注入index属性
 * 
 * ```javascript
 * import { Menu } from 'vikingship'
 * 
 * //然后可以使用 Menu.Item 和 Menu.Submenu 访问选项和子下拉菜单组件
 * ```
 */
export const Menu: FC<MenuProps> = ({
  // 使用ES6默认参数替代defaultProps
  defaultIndex = '0', // 默认激活的菜单项索引
  className, // 自定义类名
  mode = 'horizontal', // 默认横向模式
  style, // 自定义样式
  onSelect, // 选择回调函数
  defaultOpenSubMenus = [], // 默认打开的子菜单数组
  children // 子组件
}) => {
  // 使用useState管理当前激活的菜单项
  const [currentActive, setActive] = useState(defaultIndex)
  
  // 构建菜单容器的CSS类名
  const classes = classNames('viking-menu', className, {
    'menu-vertical': mode === 'vertical', // 纵向模式样式
    'menu-horizontal': mode !== 'vertical', // 横向模式样式
  })
  
  /**
   * 处理菜单项点击事件
   * @param index 被点击的菜单项索引
   */
  const handleClick = (index: string) => {
    setActive(index) // 更新当前激活项
    if (onSelect) {
      onSelect(index) // 调用外部传入的选择回调
    }
  }
  
  // 构建传递给Context的值
  const passedContext: IMenuContext = {
    index: currentActive ? currentActive : '0', // 当前激活的索引
    onSelect: handleClick, // 选择处理函数
    mode, // 菜单模式
    defaultOpenSubMenus, // 默认打开的子菜单
  }
  
  /**
   * 渲染子组件，为每个子组件注入index属性
   * @returns 处理后的子组件数组
   */
  const renderChildren = () => {
    return React.Children.map(children, (child, index) => {
      const childElement = child as React.FunctionComponentElement<MenuItemProps>
      const { displayName } = childElement.type
      
      // 检查子组件是否为MenuItem或SubMenu
      if (displayName === 'MenuItem' || displayName === 'SubMenu') {
        // 克隆子组件并注入index属性
        return React.cloneElement(childElement, {
          index: index.toString()
        })
      } else {
        console.error("Warning: Menu has a child which is not a MenuItem component")
      }
    })
  }
  
  return (
    <ul className={classes} style={style} data-testid="test-menu">
      {/* 通过Context.Provider提供菜单状态给子组件 */}
      <MenuContext.Provider value={passedContext}>
        {renderChildren()}
      </MenuContext.Provider>
    </ul>
  )
}

export default Menu;
