import React, { FC, useState, DragEvent, ReactNode } from 'react'
import classNames from 'classnames'

// Dragger组件的属性接口定义
interface DraggerProps {
  onFile: (files: FileList) => void; // 文件拖拽完成时的回调函数
  children?: ReactNode // 子组件，通常是拖拽区域的显示内容
}

/**
 * Dragger拖拽上传组件
 * 功能特点：
 * - 提供文件拖拽上传功能
 * - 支持拖拽悬停状态显示
 * - 支持拖拽进入/离开事件处理
 * - 支持文件拖拽释放处理
 * - 通过回调函数将拖拽的文件传递给父组件
 * - 提供拖拽状态的视觉反馈
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Dragger } from 'vikingship'
 * ```
 */
export const Dragger: FC<DraggerProps> = (props) => {
  // 从props中解构出需要的属性
  const { onFile, children } = props
  
  // 使用useState管理拖拽悬停状态
  const [ dragOver, setDragOver ] = useState(false)
  
  // 构建拖拽容器的CSS类名
  const klass = classNames('viking-uploader-dragger', {
    'is-dragover': dragOver // 拖拽悬停状态样式
  })
  
  /**
   * 处理文件拖拽释放事件
   * @param e 拖拽事件对象
   */
  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault() // 阻止默认行为
    setDragOver(false) // 重置拖拽悬停状态
    console.log('inside drag', e.dataTransfer.files)
    onFile(e.dataTransfer.files) // 调用父组件的文件处理回调
  }
  
  /**
   * 处理拖拽进入/离开事件
   * @param e 拖拽事件对象
   * @param over 是否拖拽悬停
   */
  const handleDrag = (e: DragEvent<HTMLElement>, over: boolean) => {
    e.preventDefault() // 阻止默认行为
    setDragOver(over) // 更新拖拽悬停状态
  }
  
  return (
    <div 
      className={klass}
      onDragOver={e => { handleDrag(e, true)}} // 拖拽悬停事件
      onDragLeave={e => { handleDrag(e, false)}} // 拖拽离开事件
      onDrop={handleDrop} // 拖拽释放事件
    >
      {children} {/* 显示拖拽区域的内容 */}
    </div>
  )
}

export default Dragger;
