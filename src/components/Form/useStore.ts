import { useState, useReducer } from 'react'
import Schema, { RuleItem, ValidateError } from 'async-validator';
import { mapValues, each } from 'lodash'

// 自定义验证规则函数类型，接收getFieldValue函数作为参数
export type CustomRuleFunc = ({ getFieldValue }) => RuleItem
// 自定义验证规则类型，可以是规则对象或规则函数
export type CustomRule = RuleItem | CustomRuleFunc

// 表单字段详情接口，包含字段的所有状态信息
export interface FieldDetail {
  name: string; // 字段名
  value: string; // 字段值
  rules: CustomRule[]; // 验证规则数组
  isValid: boolean; // 是否验证通过
  errors: ValidateError[]; // 验证错误信息
}

// 表单字段状态接口，以字段名为key的映射
export interface FieldsState {
  [key: string]: FieldDetail
}

// 验证错误类型接口，扩展Error类型
export interface ValidateErrorType extends Error {
  errors: ValidateError[]; // 错误数组
  fields: Record<string, ValidateError[]>; // 字段错误映射
}

// 表单整体状态接口
export interface FormState {
  isValid: boolean; // 表单是否全部验证通过
  isSubmitting: boolean; // 是否正在提交
  errors: Record<string, ValidateError[]> // 所有字段的错误信息
}

// 字段状态更新动作接口
export interface FieldsAction {
  type: 'addField' | 'updateValue' | 'updateValidateResult'; // 动作类型
  name: string; // 字段名
  value: any; // 动作值
}

/**
 * 字段状态管理的reducer函数
 * 处理字段的添加、值更新、验证结果更新等操作
 */
function fieldsReducer(state: FieldsState, action: FieldsAction): FieldsState {
  switch (action.type) {
    case 'addField':
      // 添加新字段到状态中
      return {
        ...state,
        [action.name]: { ...action.value }
      }
    case 'updateValue':
      // 更新字段的值
      return {
        ...state,
        [action.name]: { ...state[action.name], value: action.value }
      }
    case 'updateValidateResult':
      // 更新字段的验证结果
      const { isValid, errors } = action.value
      return {
        ...state,
        [action.name]: { ...state[action.name], isValid, errors }
      }
    default:
      return state;
  }
}

/**
 * 表单状态管理Hook
 * 提供表单的完整状态管理和验证功能
 * 
 * 功能特点：
 * - 管理表单字段的状态（值、验证规则、错误信息等）
 * - 提供字段值的获取、设置、重置功能
 * - 支持单个字段和全部字段的验证
 * - 支持自定义验证规则（包括函数式规则）
 * - 使用async-validator进行验证
 * - 提供表单提交状态管理
 * 
 * @param initialValues 表单初始值
 * @returns 表单状态管理对象
 */
function useStore(initialValues?: Record<string, any>) {
  // 表单整体状态
  const [form, setForm] = useState<FormState>({
    isValid: true,
    isSubmitting: false,
    errors: {}
  })

  // 字段状态管理，使用useReducer处理复杂的状态更新逻辑
  const [fields, dispatch] = useReducer(fieldsReducer, {})

  /**
   * 获取指定字段的值
   * @param key 字段名
   * @returns 字段值
   */
  const getFieldValue = (key: string) => {
    return fields[key] && fields[key].value
  }

  /**
   * 获取所有字段的值
   * @returns 所有字段值的映射对象
   */
  const getFieldsValue = () => {
    return mapValues(fields, item => item.value)
  }

  /**
   * 设置指定字段的值
   * @param name 字段名
   * @param value 字段值
   */
  const setFieldValue = (name: string, value: any) => {
    if (fields[name]) {
      dispatch({ type: 'updateValue', name, value })
    }
  }

  /**
   * 重置所有字段为初始值
   */
  const resetFields = () => {
    if (initialValues) {
      each(initialValues, (value, name) => {
        if (fields[name]) {
          dispatch({ type: 'updateValue', name, value })
        }
      })
    }
  }

  /**
   * 转换验证规则，处理函数式规则
   * @param rules 验证规则数组
   * @returns 转换后的规则数组
   */
  const transfromRules = (rules: CustomRule[]) => {
    return rules.map(rule => {
      if (typeof rule === 'function') {
        // 如果是函数式规则，调用函数并传入getFieldValue
        const calledRule = rule({ getFieldValue })
        return calledRule
      } else {
        // 如果是对象规则，直接返回
        return rule
      }
    })
  }

  /**
   * 验证单个字段
   * @param name 字段名
   */
  const validateField = async (name: string) => {
    const { value, rules } = fields[name] // 获取字段的值和规则
    const afterRules = transfromRules(rules) // 转换规则
    const descriptor = {
      [name]: afterRules // 构建验证描述符
    }
    const valueMap = {
      [name]: value // 构建值映射
    }
    const validator = new Schema(descriptor) // 创建验证器
    let isValid = true
    let errors: ValidateError[] = []

    try {
      await validator.validate(valueMap) // 执行验证
    } catch (e) {
      isValid = false
      const err = e as any
      console.log('e', err.errors)
      console.log('fields', err.fields)
      errors = err.errors
    } finally {
      console.log('errors', isValid)
      // 更新字段的验证结果
      dispatch({ type: 'updateValidateResult', name, value: { isValid, errors } })
    }
  }

  /**
   * 验证所有字段
   * @returns 验证结果对象
   */
  const validateAllFields = async () => {
    let isValid = true
    let errors: Record<string, ValidateError[]> = {}

    // 构建所有字段的值映射
    const valueMap = mapValues(fields, item => item.value)
    // 构建所有字段的验证规则描述符
    const descriptor = mapValues(fields, item => transfromRules(item.rules))
    const validator = new Schema(descriptor)

    // 设置提交状态
    setForm({ ...form, isSubmitting: true })

    try {
      await validator.validate(valueMap) // 验证所有字段
    } catch (e) {
      isValid = false
      const err = e as ValidateErrorType
      errors = err.fields

      // 更新每个字段的验证结果
      each(fields, (value, name) => {
        // 如果errors中有对应的key，说明该字段有错误
        if (errors[name]) {
          const itemErrors = errors[name]
          dispatch({ type: 'updateValidateResult', name, value: { isValid: false, errors: itemErrors } })
        } else if (value.rules.length > 0 && !errors[name]) {
          // 如果有验证规则但没有错误，说明验证通过
          dispatch({ type: 'updateValidateResult', name, value: { isValid: true, errors: [] } })
        }
      })
    } finally {
      // 更新表单状态
      setForm({ ...form, isSubmitting: false, isValid, errors })
      return {
        isValid,
        errors,
        values: valueMap
      }
    }
  }

  // 返回表单状态管理的所有方法和状态
  return {
    fields, // 字段状态
    dispatch, // 状态更新方法
    form, // 表单整体状态
    validateField, // 验证单个字段
    getFieldValue, // 获取字段值
    validateAllFields, // 验证所有字段
    getFieldsValue, // 获取所有字段值
    setFieldValue, // 设置字段值
    resetFields, // 重置字段
  }
}

export default useStore
