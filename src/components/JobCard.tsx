'use client'

import Link from 'next/link'
import type { MatchResult } from '@/types'
import { ScoreBar } from './ScoreBar'

/**
 * 岗位卡片组件
 * 展示匹配结果摘要：职位/公司/评分/三维度/推荐理由
 */
export function JobCard({
  match,
  index,
  recordId,
}: {
  match: MatchResult
  index: number
  recordId: string | null
}) {
  const { job, score, skillScore, experienceScore, directionScore, reason } = match

  return (
    <Link
      href={`/job/${job.id}?recordId=${recordId}&index=${index}`}
      className="card p-5 block cursor-pointer no-underline text-inherit hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1 truncate">
            {job.title}
          </h3>
          <p className="text-[15px] text-[#86868b]">
            {job.company} · {job.city} · {job.salary}
          </p>
        </div>

        {/* 综合评分 */}
        <div className="flex-shrink-0 text-center">
          <div className="text-[28px] font-bold text-[#0071e3] leading-none">
            {score}
          </div>
          <div className="text-[12px] text-[#86868b] mt-1">综合匹配</div>
        </div>
      </div>

      {/* 三维度评分 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <ScoreBar label="技能" value={skillScore} />
        <ScoreBar label="经验" value={experienceScore} />
        <ScoreBar label="方向" value={directionScore} />
      </div>

      {/* 推荐理由 */}
      <p className="text-[14px] text-[#6e6e73] leading-relaxed line-clamp-2">
        {reason}
      </p>

      {/* 来源标注 */}
      <p className="text-[12px] text-[#86868b] mt-3">
        信息来源于公开网络，仅供参考
      </p>
    </Link>
  )
}
