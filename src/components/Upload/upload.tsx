import React, { FC, useRef, ChangeEvent, useState } from 'react'
import axios from 'axios'
import UploadList from './uploadList'
import Dragger from './dragger'

// 定义上传文件的状态类型
export type UploadFileStatus = 'ready' | 'uploading' | 'success' | 'error'

// 上传文件对象接口定义
export interface UploadFile {
  uid: string; // 文件唯一标识
  size: number; // 文件大小
  name: string; // 文件名
  status?: UploadFileStatus; // 文件状态
  percent: number; // 上传进度百分比
  raw?: File; // 原始文件对象
  response?: any; // 服务器响应数据
  error?: any; // 错误信息
}

// Upload组件的属性接口定义
export interface UploadProps {
  /**必选参数, 上传的地址 */
  action: string;
  /**上传的文件列表,*/
  defaultFileList?: UploadFile[];
  /**上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传。 */
  beforeUpload? : (file: File) => boolean | Promise<File>;
  /**文件上传时的钩子 */
  onProgress?: (percentage: number, file: UploadFile) => void;
  /**文件上传成功时的钩子 */
  onSuccess?: (data: any, file: UploadFile) => void;
  /**文件上传失败时的钩子 */
  onError?: (err: any, file: UploadFile) => void;
  /**文件状态改变时的钩子，上传成功或者失败时都会被调用	 */
  onChange?: (file: UploadFile) => void;
  /**文件列表移除文件时的钩子 */
  onRemove?: (file: UploadFile) => void;
  /**设置上传的请求头部 */
  headers?: {[key: string]: any };
  /**上传的文件字段名 */
  name?: string;
  /**上传时附带的额外参数 */
  data?: {[key: string]: any };
  /**支持发送 cookie 凭证信息 */
  withCredentials?: boolean;
  /**可选参数, 接受上传的文件类型 */
  accept?: string;
  /**是否支持多选文件 */
  multiple?: boolean;
  /**是否支持拖拽上传 */
  drag?: boolean;
  children?: React.ReactNode // 触发上传的组件
}

/**
 * Upload文件上传组件
 * 功能特点：
 * - 通过点击或者拖拽上传文件
 * - 支持文件上传前的验证和处理
 * - 支持上传进度显示
 * - 支持上传成功/失败回调
 * - 支持文件列表管理
 * - 支持拖拽上传
 * - 支持多文件选择
 * - 支持自定义请求头和额外参数
 * - 支持文件类型限制
 * - 使用axios进行HTTP请求
 * 
 * ### 引用方法
 * 
 * ~~~js
 * import { Upload } from 'vikingship'
 * ~~~
 */
export const Upload: FC<UploadProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    action, // 上传地址
    defaultFileList, // 默认文件列表
    beforeUpload, // 上传前钩子
    onProgress, // 进度回调
    onSuccess, // 成功回调
    onError, // 失败回调
    onChange, // 状态变化回调
    onRemove, // 移除文件回调
    name, // 文件字段名
    headers, // 请求头
    data, // 额外参数
    withCredentials, // 是否发送cookie
    accept, // 接受的文件类型
    multiple, // 是否多选
    children, // 触发组件
    drag, // 是否支持拖拽
  } = props
  
  // 使用ref获取文件输入框的引用
  const fileInput = useRef<HTMLInputElement>(null)
  
  // 使用useState管理文件列表
  const [ fileList, setFileList ] = useState<UploadFile[]>(defaultFileList || [])
  
  /**
   * 更新文件列表中指定文件的信息
   * @param updateFile 要更新的文件
   * @param updateObj 更新的属性对象
   */
  const updateFileList = (updateFile: UploadFile, updateObj: Partial<UploadFile>) => {
    setFileList(prevList => {
      return prevList.map(file => {
        if (file.uid === updateFile.uid) {
          return { ...file, ...updateObj } // 合并更新属性
        } else {
          return file
        }
      })
    })
  }
  
  /**
   * 处理点击事件，触发文件选择
   */
  const handleClick = () => {
    if (fileInput.current) {
      fileInput.current.click() // 模拟点击文件输入框
    }
  }
  
  /**
   * 处理文件选择变化事件
   * @param e 文件选择事件
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if(!files) {
      return
    }
    uploadFiles(files) // 上传选中的文件
    if (fileInput.current) {
      fileInput.current.value = '' // 清空输入框值，允许重复选择同一文件
    }
  }
  
  /**
   * 处理文件移除事件
   * @param file 要移除的文件
   */
  const handleRemove = (file: UploadFile) => {
    setFileList((prevList) => {
      return prevList.filter(item => item.uid !== file.uid) // 从列表中移除文件
    })
    if (onRemove) {
      onRemove(file) // 调用外部移除回调
    }
  }
  
  /**
   * 上传文件列表
   * @param files 文件列表
   * @param test 是否为拖拽测试
   */
  const uploadFiles = (files: FileList, test?: boolean) => {
    let postFiles = Array.from(files) // 转换为数组
    if (test) {
      console.log('drag', postFiles[0])
    }
    
    // 遍历文件列表，逐个上传
    postFiles.forEach(file => {
      if (!beforeUpload) {
        // 没有beforeUpload钩子，直接上传
        post(file)
      } else {
        // 有beforeUpload钩子，先执行验证
        const result = beforeUpload(file)
        if (result && result instanceof Promise) {
          // 返回Promise，等待处理完成后再上传
          result.then(processedFile => {
            post(processedFile)
          })
        } else if (result !== false) {
          // 返回true或非false值，继续上传
          post(file)
        }
        // 返回false，停止上传
      }
    })
  }
  
  /**
   * 执行文件上传
   * @param file 要上传的文件
   */
  const post = (file: File) => {
    // 创建上传文件对象
    let _file: UploadFile = {
      uid: Date.now() + 'upload-file', // 生成唯一ID
      status: 'ready', // 初始状态为准备中
      name: file.name,
      size: file.size,
      percent: 0, // 初始进度为0
      raw: file // 保存原始文件对象
    }
    
    // 将文件添加到文件列表开头
    setFileList(prevList => {
      return [_file, ...prevList]
    })
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append(name || 'file', file) // 添加文件
    
    // 添加额外参数
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    } 
    
    // 发送HTTP请求
    axios.post(action, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data' // 设置内容类型
      },
      withCredentials, // 是否发送cookie
      onUploadProgress: (e) => {
        // 计算上传进度
        let percentage = Math.round((e.loaded * 100) / e.total) || 0;
        if (percentage < 100) {
          // 更新文件状态为上传中
          updateFileList(_file, { percent: percentage, status: 'uploading'})
          _file.status = 'uploading'
          _file.percent = percentage
          if (onProgress) {
            onProgress(percentage, _file) // 调用进度回调
          }
        }
      }
    }).then(resp => {
      // 上传成功
      updateFileList(_file, {status: 'success', response: resp.data})
      _file.status = 'success'
      _file.response = resp.data
      if (onSuccess) {
        onSuccess(resp.data, _file) // 调用成功回调
      }
      if (onChange) {
        onChange(_file) // 调用状态变化回调
      }
    }).catch(err => {
      // 上传失败
      updateFileList(_file, { status: 'error', error: err})
      _file.status = 'error'
      _file.error = err
      if (onError) {
        onError(err, _file) // 调用失败回调
      }
      if (onChange) {
        onChange(_file) // 调用状态变化回调
      }
    })
  }

  return (
    <div className="viking-upload-component">
      {/* 上传触发区域 */}
      <div className="viking-upload-input"
        style={{display: 'inline-block'}}
        onClick={handleClick}>
          {drag ? 
            // 拖拽上传模式
            <Dragger onFile={(files) => {uploadFiles(files, true)}}>
              {children}
            </Dragger>:
            // 点击上传模式
            children
          }
        {/* 隐藏的文件输入框 */}
        <input
          className="viking-file-input"
          style={{display: 'none'}}
          ref={fileInput}
          onChange={handleFileChange}
          type="file"
          accept={accept}
          multiple={multiple}
        />
      </div>

      {/* 文件列表显示区域 */}
      <UploadList 
        fileList={fileList}
        onRemove={handleRemove}
      />
    </div>
  )
}

// 设置Upload组件的默认属性
Upload.defaultProps = {
  name: 'file' // 默认文件字段名为'file'
}
export default Upload;
