import React, { FC } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'

// 定义图标主题类型，支持8种不同的主题颜色
export type ThemeProps = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark'

// Icon组件的属性接口，继承FontAwesomeIcon的所有属性
export interface IconProps extends FontAwesomeIconProps {
  /** 支持框架主题 根据主题显示不同的颜色 */
  theme? : ThemeProps
}

/**
 * Icon图标组件
 * 功能特点：
 * - 提供了一套常用的图标集合，基于react-fontawesome
 * - 支持react-fontawesome的所有属性
 * - 支持fontawesome所有free-solid-icons图标
 * - 支持8种主题颜色（primary、secondary、success、info、warning、danger、light、dark）
 * - 可以根据主题显示不同的颜色样式
 * 
 * 支持 react-fontawesome的所有属性 可以在这里查询 https://github.com/FortAwesome/react-fontawesome#basic
 * 
 * 支持 fontawesome 所有 free-solid-icons，可以在这里查看所有图标 https://fontawesome.com/icons?d=gallery&s=solid&m=free
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { Icon } from 'vikingship'
 * ~~~
 */
export const Icon: FC<IconProps> = (props) => {
  // 从props中解构出className、theme和其他属性
  const { className, theme, ...restProps } = props
  
  // 构建图标的CSS类名
  // 基础类名：viking-icon
  // 动态类名：根据theme属性生成对应的主题样式类（如icon-primary）
  const classes = classNames('viking-icon', className, {
    [`icon-${theme}`]: theme // 当theme存在时，添加对应的主题样式类
  })
  
  // 渲染FontAwesome图标组件
  return (
    <FontAwesomeIcon className={classes} {...restProps} />
  )
}

export default Icon;
