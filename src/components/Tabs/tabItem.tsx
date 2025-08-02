import React, { FC, ReactNode } from 'react'

// TabItem组件的属性接口定义
export interface TabItemProps {
  /** Tab选项上面的文字 */
  label: string | React.ReactElement; // 标签文本，支持字符串或React元素
  /** Tab选项是否被禁用 */
  disabled?: boolean; // 是否禁用该标签页
  children?: ReactNode; // 标签页内容
}

/**
 * TabItem标签页项组件
 * 功能特点：
 * - Tabs组件的子组件，用于定义单个标签页
 * - 支持自定义标签文本（字符串或React元素）
 * - 支持禁用状态
 * - 包含标签页的具体内容
 * - 由Tabs组件统一管理显示/隐藏
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { TabItem } from 'vikingship'
 * ```
 */
export const TabItem: FC<TabItemProps> = ({ children }) => {
  return (
    <div className="viking-tab-panel">
      {children}
    </div>
  )
}

export default TabItem;
