'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { MatchResult, ApiResponse } from '@/types'
import { useMatchData } from '@/hooks/useMatchData'
import { JobCard } from '@/components/JobCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorCard } from '@/components/ErrorCard'
import { readFromStorage, writeToStorage } from '@/hooks/useLocalStorage'
import { KEYS } from '@/hooks/useMatchData'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('recordId')

  const { results, resume, loading, error: loadError } = useMatchData()
  const [allResults, setAllResults] = useState<MatchResult[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [poolExhausted, setPoolExhausted] = useState(false)

  useEffect(() => {
    if (results.length > 0) {
      setAllResults(results)
    }
  }, [results])

  // 换一批
  const handleRefresh = useCallback(async () => {
    if (!resume || refreshing) return

    setRefreshing(true)
    setRefreshError(null)

    // 收集已看过的岗位 ID
    const seenIds = allResults.map((r) => r.job.id)

    try {
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          resume,
          preferences: '',
          excludeJobIds: seenIds,
        }),
      })
      const json: ApiResponse<{ results: MatchResult[] }> = await res.json()

      if (!json.success || !json.data) {
        setRefreshError(json.error || '暂时无法换一批，请稍后重试')
        return
      }

      if (json.data.results.length === 0) {
        setPoolExhausted(true)
        return
      }

      // 合并结果，去重
      const merged = [...allResults, ...json.data.results]
      const unique = merged.filter(
        (r, i, arr) => arr.findIndex((x) => x.job.id === r.job.id) === i
      )
      setAllResults(unique)
      writeToStorage(KEYS.results, unique)

      // 如果新结果太少，标记可能耗尽
      if (json.data.results.length < 3) {
        setPoolExhausted(true)
      }
    } catch {
      setRefreshError('网络连接失败，请检查网络后重试')
    } finally {
      setRefreshing(false)
    }
  }, [allResults, resume, recordId, refreshing])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <LoadingSpinner text="加载匹配结果..." />
      </div>
    )
  }

  if (loadError || results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <ErrorCard
          message={loadError || '没有找到匹配结果'}
          backLabel="返回首页"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 animate-in">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#1d1d1f] mb-2">
          匹配结果
        </h1>
        <p className="text-[17px] text-[#86868b]">
          根据你的简历和偏好，为你找到 {allResults.length} 个匹配岗位
        </p>
      </div>

      {/* 结果卡片 */}
      <div className="space-y-4">
        {allResults.map((match, index) => (
          <JobCard
            key={match.job.id}
            match={match}
            index={index}
            recordId={recordId}
          />
        ))}
      </div>

      {/* 换一批 */}
      <div className="mt-8 text-center space-y-4">
        {poolExhausted ? (
          <p className="text-[15px] text-[#86868b]">
            暂无可替换的岗位，建议调整求职偏好重新匹配
          </p>
        ) : (
          <button
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '正在搜索...' : '换一批'}
          </button>
        )}

        {refreshError && (
          <p className="text-[14px] text-[#ff3b30]">{refreshError}</p>
        )}

        <div className="flex justify-center gap-3">
          <button className="btn-secondary" onClick={() => router.push('/')}>
            重新匹配
          </button>
          <Link href="/history" className="btn-secondary no-underline inline-block">
            历史记录
          </Link>
        </div>

        <p className="text-[13px] text-[#86868b]">
          匹配结果保存在本设备浏览器中，更换设备需要重新匹配
        </p>
      </div>
    </div>
  )
}
