import React, { FC, useState } from 'react'
import classNames from 'classnames'
import Icon from '../Icon'
import Transition from '../Transition'

// 定义Alert组件的类型枚举，支持四种不同的提示类型
export type AlertType = 'success' | 'default' | 'danger' | 'warning'

// Alert组件的属性接口定义
export interface AlertProps {
  /**标题 - 必填，显示在Alert组件顶部的文本 */
  title: string;
  /**描述 - 可选，显示在标题下方的详细描述文本 */
  description?: string;
  /**类型 - 可选，四种类型对应不同的场景和样式 */
  type?: AlertType;
  /**关闭alert时触发的事件 - 可选，当用户点击关闭按钮时调用的回调函数 */
  onClose?: () => void;
  /**是否显示关闭图标 - 可选，控制是否显示右上角的关闭按钮 */
  closable?: boolean;
}

/** 
 * Alert组件 - 用于页面中展示重要的提示信息
 * 功能特点：
 * - 支持四种不同类型的提示（成功、默认、危险、警告）
 * - 可配置是否显示关闭按钮
 * - 点击右侧的叉号提示自动消失
 * - 支持标题和描述文本
 * - 带有淡入淡出动画效果
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { Alert } from 'vikingship'
 * ~~~
*/
export const Alert: FC<AlertProps> = (props) => {
  // 使用useState管理Alert的显示/隐藏状态
  const [ hide, setHide ] = useState(false)
  
  // 从props中解构出需要的属性
  const {
    title,
    description,
    type,
    onClose,
    closable
  } = props
  
  // 构建Alert组件的主容器CSS类名
  // 根据type属性动态添加对应的样式类
  const classes = classNames('viking-alert', {
    [`viking-alert-${type}`]: type,
  })
  
  // 构建标题的CSS类名
  // 当存在description时，标题会加粗显示
  const titleClass = classNames('viking-alert-title', {
    'bold-title': description
  })
  
  // 处理关闭按钮点击事件
  // 如果提供了onClose回调函数则调用，然后设置hide状态为true
  const handleClose = (e: React.MouseEvent) => {
    if (onClose) {
      onClose()
    }
    setHide(true)
  }
  
  return (
    // 使用Transition组件包装，实现淡入淡出动画效果
    <Transition
      in={!hide} // 当hide为false时显示组件
      timeout={300} // 动画持续300毫秒
      animation="zoom-in-top" // 使用从顶部缩放的动画效果
    >
      <div className={classes}>
        {/* 显示标题，根据是否有描述决定是否加粗 */}
        <span className={titleClass}>{title}</span>
        {/* 如果有描述文本则显示 */}
        {description && <p className="viking-alert-desc">{description}</p>}
        {/* 如果closable为true则显示关闭按钮 */}
        {closable && <span className="viking-alert-close" onClick={handleClose}><Icon icon="times"/></span>}
      </div>
    </Transition>
  )
}

// 设置Alert组件的默认属性
Alert.defaultProps = {
  type: 'default', // 默认为default类型
  closable: true, // 默认显示关闭按钮
}
export default Alert;
