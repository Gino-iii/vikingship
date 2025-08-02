import React, { FC } from 'react'
import { UploadFile } from './upload'
import Icon from '../Icon/icon'
import Progress from '../Progress/progress'

// UploadList组件的属性接口定义
interface UploadListProps {
  fileList: UploadFile[]; // 文件列表
  onRemove: (_file: UploadFile) => void; // 移除文件的回调函数
}

/**
 * UploadList文件列表组件
 * 功能特点：
 * - 显示上传文件的列表
 * - 显示每个文件的状态（准备中、上传中、成功、失败）
 * - 显示文件上传进度条
 * - 提供文件移除功能
 * - 根据文件状态显示不同的图标
 * - 支持文件状态的可视化反馈
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { UploadList } from 'vikingship'
 * ```
 */
export const UploadList: FC<UploadListProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    fileList, // 文件列表
    onRemove, // 移除文件回调
  } = props
  
  console.log('firelist', fileList)
  
  return (
    <ul className="viking-upload-list">
      {/* 遍历文件列表，渲染每个文件项 */}
      {fileList.map(item => {
        return (
          <li className="viking-upload-list-item" key={item.uid}>
            {/* 文件名区域 */}
            <span className={`file-name file-name-${item.status}`}>
              <Icon icon="file-alt" theme="secondary" /> {/* 文件图标 */}
              {item.name} {/* 文件名 */}
            </span>
            
            {/* 文件状态区域 */}
            <span className="file-status">
              {/* 准备中或上传中状态：显示旋转图标 */}
              {(item.status === 'uploading' || item.status === 'ready') && 
                <Icon icon="spinner" spin theme="primary" />
              }
              {/* 上传成功状态：显示成功图标 */}
              {item.status === 'success' && 
                <Icon icon="check-circle" theme="success" />
              }
              {/* 上传失败状态：显示错误图标 */}
              {item.status === 'error' && 
                <Icon icon="times-circle" theme="danger" />
              }
            </span>
            
            {/* 文件操作区域 */}
            <span className="file-actions">
              {/* 删除按钮 */}
              <Icon icon="times" onClick={() => { onRemove(item)}}/>
            </span>
            
            {/* 上传进度条：只在上传中状态显示 */}
            {item.status === 'uploading' && 
              <Progress 
                percent={item.percent || 0} // 显示上传进度
              />
            }
          </li>
        )
      })}
    </ul>
  )
}

export default UploadList;
