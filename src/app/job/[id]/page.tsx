'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { MatchResult, Resume, ApiResponse } from '@/types'
import { useMatchData } from '@/hooks/useMatchData'
import { ScoreBadge } from '@/components/ScoreBadge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorCard } from '@/components/ErrorCard'

interface JobDetail {
  highlights: string[]
  analysis: string | null
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = params.id as string
  const recordId = searchParams.get('recordId')
  const indexStr = searchParams.get('index')

  const { results, resume, loading, error: loadError, findMatch } = useMatchData()
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [detail, setDetail] = useState<JobDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)

  useEffect(() => {
    if (results.length > 0) {
      const found = findMatch(jobId, indexStr)
      setMatch(found || null)
      if (!found) setDetailLoading(false)
    }
  }, [results, jobId, indexStr, findMatch])

  // 加载 JD 分析和推荐
  useEffect(() => {
    if (!match || !resume) {
      if (match) setDetailLoading(false)
      return
    }

    const fetchDetail = async () => {
      setDetailLoading(true)
      try {
        const res = await fetch('/api/job-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jdFull: match.job.jdFull, resume }),
        })
        const json: ApiResponse<JobDetail> = await res.json()
        if (json.success && json.data) {
          setDetail(json.data)
        }
      } catch {
        // 非关键路径，静默失败
      } finally {
        setDetailLoading(false)
      }
    }

    fetchDetail()
  }, [match, resume])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <LoadingSpinner text="加载岗位信息..." />
      </div>
    )
  }

  if (loadError || !match) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <ErrorCard
          message={loadError || '岗位信息加载失败'}
          backLabel="返回结果页"
          backHref="/results"
        />
      </div>
    )
  }

  const { job, score, skillScore, experienceScore, directionScore, reason } = match

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 animate-in">
      {/* 返回 */}
      <button
        onClick={() => router.back()}
        className="text-[15px] text-[#0071e3] mb-6 inline-flex items-center gap-1 hover:underline"
      >
        ← 返回结果页
      </button>

      {/* 岗位头部 */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.01em] text-[#1d1d1f] mb-2">
              {job.title}
            </h1>
            <p className="text-[17px] text-[#86868b]">
              {job.company} · {job.city} · {job.salary}
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-[36px] font-bold text-[#0071e3] leading-none">
              {score}
            </div>
            <div className="text-[12px] text-[#86868b] mt-1">匹配度</div>
          </div>
        </div>

        {/* 三维度评分 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <ScoreBadge label="技能匹配" value={skillScore} />
          <ScoreBadge label="经验匹配" value={experienceScore} />
          <ScoreBadge label="方向匹配" value={directionScore} />
        </div>

        {/* 推荐理由 */}
        <div className="bg-[#f5f5f7] rounded-xl p-4">
          <p className="text-[14px] font-medium text-[#1d1d1f] mb-1">
            AI 推荐解析
          </p>
          <p className="text-[14px] text-[#6e6e73] leading-relaxed">{reason}</p>
        </div>
      </div>

      {/* JD 核心要点 */}
      <div className="card p-6 mb-6">
        <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-4">
          JD 核心要点
        </h2>
        {detailLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-[#f5f5f7] rounded animate-pulse" />
            ))}
          </div>
        ) : detail?.highlights ? (
          <ul className="space-y-3">
            {detail.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] text-[#1d1d1f]">
                <span className="text-[#0071e3] mt-1 flex-shrink-0">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-[#86868b]">JD 要点解析暂时不可用</p>
        )}

        {/* 完整 JD */}
        <details className="mt-4">
          <summary className="text-[14px] text-[#0071e3] cursor-pointer">
            查看完整 JD
          </summary>
          <p className="mt-3 text-[14px] text-[#6e6e73] leading-relaxed whitespace-pre-line">
            {job.jdFull}
          </p>
        </details>
      </div>

      {/* AI 推荐分析 */}
      {detail?.analysis && (
        <div className="card p-6 mb-6">
          <h2 className="text-[21px] font-semibold text-[#1d1d1f] mb-4">
            为什么推荐你投这个
          </h2>
          <p className="text-[15px] text-[#6e6e73] leading-relaxed">{detail.analysis}</p>
        </div>
      )}

      {/* CTA 按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link
          href={`/rewrite/${job.id}?recordId=${recordId}&index=${indexStr}`}
          className="btn-primary flex-1 text-center no-underline"
        >
          针对此岗位优化简历
        </Link>
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex-1 text-center no-underline"
        >
          前往平台投递 ↗
        </a>
      </div>

      {/* 免责声明 */}
      <p className="text-[13px] text-[#86868b] text-center">
        岗位信息来源于公开网络，仅供参考。若链接失效，建议搜索公司名查找最新职位。
      </p>
    </div>
  )
}
