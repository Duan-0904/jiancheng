'use client'

import { useState, useEffect } from 'react'
import type { MatchResult, Resume } from '@/types'

interface MatchData {
  results: MatchResult[]
  resume: Resume | null
  recordId: string | null
}

const KEYS = {
  results: 'jiancheng_results',
  resume: 'jiancheng_resume',
  recordId: 'jiancheng_recordId',
  history: 'jiancheng_history',
} as const

/**
 * 从 localStorage 加载匹配数据的 Hook
 * 封装了 results / resume / recordId 三者的读取逻辑
 */
export function useMatchData() {
  const [data, setData] = useState<MatchData>({
    results: [],
    resume: null,
    recordId: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const results = readJSON<MatchResult[]>(KEYS.results, [])
      const resume = readJSON<Resume | null>(KEYS.resume, null)
      const recordId = readJSON<string | null>(KEYS.recordId, null)

      if (results.length === 0) {
        setError('没有找到匹配结果，请返回首页重新匹配')
      }

      setData({ results, resume, recordId })
    } catch {
      setError('匹配结果读取失败')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 在匹配结果中按 index 或 jobId 查找
   */
  const findMatch = (jobId: string, indexStr: string | null): MatchResult | null => {
    if (indexStr !== null) {
      const index = parseInt(indexStr)
      if (index >= 0 && index < data.results.length) {
        return data.results[index]
      }
    }
    return data.results.find((r) => r.job.id === jobId) || null
  }

  return { ...data, loading, error, findMatch }
}

/**
 * 存储键名常量
 */
export { KEYS }

// 内部工具
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}
