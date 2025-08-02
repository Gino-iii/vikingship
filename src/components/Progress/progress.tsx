import React, { FC } from 'react'
import { ThemeProps } from '../Icon/icon'

// Progress组件的属性接口定义
export interface ProgressProps {
  percent: number; // 进度百分比，必填，范围0-100
  strokeHeight?: number; // 进度条高度，可选
  showText?: boolean; // 是否显示进度文本，可选
  styles?: React.CSSProperties; // 自定义样式，可选
  theme?: ThemeProps; // 主题颜色，可选
}

/**
 * Progress进度条组件
 * 功能特点：
 * - 显示任务或操作的完成进度
 * - 支持自定义进度条高度
 * - 支持显示/隐藏进度百分比文本
 * - 支持8种主题颜色（primary、secondary、success、info、warning、danger、light、dark）
 * - 支持自定义样式
 * - 进度条宽度根据percent属性动态计算
 * 
 * ### 引用方法
 * 
 * ```javascript
 * import { Progress } from 'vikingship'
 * ```
 */
const Progress: FC<ProgressProps> = (props) => {
  // 从props中解构出需要的属性
  const {
    percent, // 进度百分比
    strokeHeight, // 进度条高度
    showText, // 是否显示文本
    styles, // 自定义样式
    theme, // 主题颜色
  } = props
  
  return (
    <div className="viking-progress-bar" style={styles}>
      {/* 进度条外层容器，设置高度 */}
      <div className="viking-progress-bar-outer" style={{ height: `${strokeHeight}px`}}>
        {/* 进度条内层，显示实际进度 */}
        <div 
          className={`viking-progress-bar-inner color-${theme}`} // 根据主题设置颜色样式
          style={{width: `${percent}%`}} // 根据百分比设置宽度
        >
          {/* 进度文本，当showText为true时显示 */}
          {showText && <span className="inner-text">{`${percent}%`}</span>}
        </div>
      </div>
    </div>
  )
}

// 设置Progress组件的默认属性
Progress.defaultProps = {
  strokeHeight: 15, // 默认高度15px
  showText: true, // 默认显示进度文本
  theme: "primary", // 默认主题颜色
}
export default Progress;
