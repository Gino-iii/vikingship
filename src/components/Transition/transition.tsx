import React, { ReactNode } from 'react'
import { CSSTransition } from 'react-transition-group'
import { CSSTransitionProps } from 'react-transition-group/CSSTransition'

// 定义支持的动画名称类型
type AnimationName = 'zoom-in-top' | 'zoom-in-left' | 'zoom-in-bottom' | 'zoom-in-right'

// Transition组件的属性接口，继承CSSTransition的所有属性
type TransitionProps = CSSTransitionProps & {
  animation?: AnimationName, // 动画名称，可选
  wrapper?: boolean, // 是否包装在div中，可选
  children?: ReactNode // 子组件
}

/**
 * Transition过渡动画组件
 * 功能特点：
 * - 基于react-transition-group的CSSTransition组件
 * - 提供统一的动画接口
 * - 支持四种缩放动画：从顶部、左侧、底部、右侧缩放进入
 * - 支持自定义CSS类名
 * - 支持包装模式（将子组件包装在div中）
 * - 继承CSSTransition的所有属性和功能
 * - 默认在退出时卸载组件，默认显示进入动画
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Transition } from 'vikingship'
 * ```
 */
const Transition: React.FC<TransitionProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    children, // 子组件
    classNames, // 自定义CSS类名
    animation, // 动画名称
    wrapper, // 是否包装
    ...restProps // 其他CSSTransition属性
  } = props
  
  return (
    <CSSTransition
      classNames = { classNames ? classNames : animation} // 优先使用自定义类名，否则使用动画名称
      {...restProps} // 展开其他CSSTransition属性
    >
      {/* 根据wrapper属性决定是否包装子组件 */}
      {wrapper ? <div>{children}</div> : children}
    </CSSTransition>
  )
}

// 设置Transition组件的默认属性
Transition.defaultProps = {
  unmountOnExit: true, // 退出时卸载组件
  appear: true, // 显示进入动画
}

export default Transition
