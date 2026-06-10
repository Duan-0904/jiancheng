'use client'

import { useState, useCallback } from 'react'
import type { ApiResponse } from '@/types'

interface UseApiRequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * 封装 API 请求的 Hook
 * - 统一处理 loading / error / data 三态
 * - 自动解析 ApiResponse<T> 格式
 * - 支持错误降级文案
 */
export function useApiRequest<T>() {
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const request = useCallback(
    async (
      url: string,
      options: RequestInit & { fallbackError?: string } = {}
    ) => {
      const { fallbackError = '请求失败，请稍后重试', ...fetchOptions } = options

      setState({ data: null, loading: true, error: null })

      try {
        const res = await fetch(url, fetchOptions)
        const json: ApiResponse<T> = await res.json()

        if (!json.success || !json.data) {
          setState({
            data: null,
            loading: false,
            error: json.error || fallbackError,
          })
          return null
        }

        setState({ data: json.data, loading: false, error: null })
        return json.data
      } catch {
        const networkError = '网络连接失败，请检查网络后重试'
        setState({ data: null, loading: false, error: networkError })
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, request, reset }
}
