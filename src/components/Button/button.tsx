import React, { FC, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import classNames from 'classnames'

// 定义按钮尺寸类型，支持大号和小号
export type ButtonSize = 'lg' | 'sm'
// 定义按钮类型，支持主要、默认、危险、链接四种样式
export type ButtonType = 'primary' | 'default' | 'danger' | 'link'

// 基础按钮属性接口，定义所有按钮类型共有的属性
interface BaseButtonProps {
  className?: string; // 自定义CSS类名
  /**设置 Button 的禁用状态 */
  disabled?: boolean;
  /**设置 Button 的尺寸 */
  size?: ButtonSize;
  /**设置 Button 的类型 */
  btnType?: ButtonType;
  children: React.ReactNode; // 按钮内容
  href?: string; // 链接地址，用于链接类型按钮
}

// 原生button元素的属性类型，继承HTML button的所有属性
type NativeButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLElement>
// 锚点链接的属性类型，继承HTML a标签的所有属性
type AnchorButtonProps = BaseButtonProps & AnchorHTMLAttributes<HTMLElement>
// 最终的Button属性类型，使用Partial使所有属性变为可选
export type ButtonProps = Partial<NativeButtonProps & AnchorButtonProps>

/**
 * Button按钮组件
 * 功能特点：
 * - 页面中最常用的按钮元素，适合完成特定的交互
 * - 支持四种类型：主要、默认、危险、链接
 * - 支持两种尺寸：大号、小号
 * - 支持禁用状态
 * - 支持HTML button和a链接的所有原生属性
 * - 当类型为link且有href时，渲染为a标签；否则渲染为button标签
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Button } from 'vikingship'
 * ```
 */
export const Button: FC<ButtonProps> = ({
  btnType = 'default', // 默认按钮类型
  className, // 自定义类名
  disabled = false, // 默认不禁用
  size, // 按钮尺寸
  children, // 按钮内容
  href, // 链接地址
  ...restProps // 其他HTML属性
}) => {
  // 构建按钮的CSS类名
  // 基础类名：btn
  // 动态类名：根据btnType和size生成对应的样式类
  // 特殊处理：当按钮类型为link且禁用时，添加disabled类
  const classes = classNames('btn', className, {
    [`btn-${btnType}`]: btnType, // 按钮类型样式类
    [`btn-${size}`]: size, // 按钮尺寸样式类
    'disabled': (btnType === 'link') && disabled // 链接类型禁用时的特殊样式
  })
  
  // 根据按钮类型和href属性决定渲染为a标签还是button标签
  if (btnType === 'link' && href) {
    // 当按钮类型为link且有href时，渲染为a标签
    return (
      <a
        className={classes}
        href={href}
        {...restProps} // 展开其他HTML属性
      >
        {children}
      </a>
    )
  } else {
    // 其他情况渲染为button标签
    return (
      <button
        className={classes}
        disabled={disabled} // 设置禁用状态
        {...restProps} // 展开其他HTML属性
      >
        {children}
      </button>
    )
  }
}

export default Button;
