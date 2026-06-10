'use client'

import { useState, useCallback } from 'react'

/**
 * 封装 localStorage 读写的 Hook
 * - 自动 JSON 序列化/反序列化
 * - 解析失败时自动降级（清除损坏数据）
 * - SSR 安全（无 window 时返回默认值）
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      // 数据损坏时清除并返回默认值
      localStorage.removeItem(key)
      return defaultValue
    }
  })

  const setAndPersist = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // quota 超限等极端情况，静默失败
        }
        return resolved
      })
    },
    [key]
  )

  const remove = useCallback(() => {
    localStorage.removeItem(key)
    setValue(defaultValue)
  }, [key, defaultValue])

  return { value, setValue: setAndPersist, remove }
}

/**
 * 直接读取 localStorage（非 Hook，用于需要同步读取的场景）
 */
export function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

/**
 * 写入 localStorage（非 Hook）
 */
export function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota 超限，静默失败
  }
}
