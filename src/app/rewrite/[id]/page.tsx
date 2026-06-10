'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { MatchResult, Resume, RewriteResult, ApiResponse } from '@/types'
import { useMatchData } from '@/hooks/useMatchData'
import { RewriteSection } from '@/components/RewriteSection'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorCard } from '@/components/ErrorCard'

export default function RewritePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = params.id as string
  const recordId = searchParams.get('recordId')
  const indexStr = searchParams.get('index')

  const { results, resume, loading, error: loadError, findMatch } = useMatchData()
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  useEffect(() => {
    if (results.length > 0) {
      const found = findMatch(jobId, indexStr)
      setMatch(found || null)
    }
  }, [results, jobId, indexStr, findMatch])

  // 生成改写建议
  useEffect(() => {
    if (!match || !resume) return

    const generateRewrite = async () => {
      setGenerating(true)
      setGenError(null)
      try {
        const res = await fetch('/api/rewrite-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: JSON.stringify(resume),
            resume,
            job: match.job,
            matchId: recordId,
          }),
        })
        const json: ApiResponse<RewriteResult> = await res.json()
        if (json.success && json.data) {
          setRewrite(json.data)
        } else {
          setGenError(json.error || '改写建议生成失败')
        }
      } catch {
        setGenError('改写建议生成失败，请稍后重试')
      } finally {
        setGenerating(false)
      }
    }

    generateRewrite()
  }, [match, resume])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <LoadingSpinner text="加载中..." />
      </div>
    )
  }

  if (loadError || !match) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <ErrorCard
          message={loadError || '信息加载失败'}
          backLabel="返回结果页"
          backHref="/results"
        />
      </div>
    )
  }

  const { job } = match

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 animate-in">
      {/* 返回 */}
      <button
        onClick={() => router.back()}
        className="text-[15px] text-[#0071e3] mb-6 inline-flex items-center gap-1 hover:underline"
      >
        ← 返回岗位详情
      </button>

      {/* 匹配度对比 */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-[14px] text-[#86868b]">目标岗位</span>
          <span className="text-[17px] font-semibold text-[#1d1d1f]">
            {job.title} @ {job.company}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#86868b]">当前匹配度</span>
          <span className="text-[32px] font-bold text-[#0071e3]">
            {rewrite?.matchScore ?? match.score}%
          </span>
        </div>
        <p className="text-[13px] text-[#86868b] mt-1">
          按照下方建议修改后，预期匹配度可提升
        </p>
      </div>

      {/* 生成中 */}
      {generating && <LoadingSpinner text="AI 正在分析你的简历和岗位要求..." />}

      {/* 生成错误 */}
      {genError && (
        <ErrorCard message={genError} onRetry={() => window.location.reload()} />
      )}

      {/* 改写建议 - 三区块 */}
      {!generating && rewrite && (
        <div className="space-y-6">
          {rewrite.suggestions.map((section) => (
            <RewriteSection key={section.section} section={section} />
          ))}
        </div>
      )}

      {/* 底部操作 */}
      {!generating && rewrite && (
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center no-underline"
            >
              前往平台投递 ↗
            </a>
            <button className="btn-secondary" onClick={() => router.back()}>
              返回查看原始JD
            </button>
          </div>
          <p className="text-[13px] text-[#86868b]">
            改写建议由 AI 生成，仅供参考。建议结合自身情况调整后使用。
          </p>
        </div>
      )}
    </div>
  )
}
