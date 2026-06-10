import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/deepseek'
import { JOB_MATCH_PROMPT } from '@/lib/prompts'
import { prisma } from '@/lib/prisma'
import jobs from '@/data/jobs.json'
import type { Job, MatchResult, ApiResponse, Resume } from '@/types'

interface MatchResponse {
  matches: Array<{
    jobId: string
    skillScore: number
    experienceScore: number
    directionScore: number
    reason: string
  }>
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recordId, resume, preferences, excludeJobIds } = body as {
      recordId?: string
      resume: Resume
      preferences?: string
      excludeJobIds?: string[]
    }

    if (!resume) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '请先上传简历' },
        { status: 400 }
      )
    }

    // 过滤掉已看过的岗位
    const availableJobs =
      excludeJobIds && excludeJobIds.length > 0
        ? jobs.filter((j) => !excludeJobIds.includes(j.id))
        : jobs

    if (availableJobs.length < 5) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '暂无可替换的岗位，建议调整偏好重新匹配',
        },
        { status: 404 }
      )
    }

    // 构建匹配请求的消息
    const jobListText = availableJobs
      .map(
        (j) =>
          `[${j.id}] ${j.title} @ ${j.company} | ${j.city} | ${j.salary}\nJD: ${j.jdFull}`
      )
      .join('\n\n')

    const userMessage = `候选人简历：
${JSON.stringify(resume, null, 2)}

求职偏好：${preferences || '无特殊偏好'}

岗位列表：
${jobListText}

请从以上岗位中选出匹配度最高的5个，对每个岗位进行三维度评分并给出具体推荐理由。`

    // 调用 DeepSeek 进行匹配
    let rawMatches: MatchResponse
    try {
      rawMatches = await chatJSON<MatchResponse>(JOB_MATCH_PROMPT, userMessage, {
        model: 'deepseek-v4-flash',
        maxTokens: 4096,
      })
    } catch {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '正在努力匹配中，稍等一下再试试' },
        { status: 500 }
      )
    }

    if (!rawMatches.matches || rawMatches.matches.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '暂时没有找到匹配的岗位，试试调整偏好或换一份简历',
        },
        { status: 404 }
      )
    }

    // 将匹配结果与完整岗位数据合并
    const results: MatchResult[] = rawMatches.matches
      .map((m) => {
        const job = availableJobs.find((j) => j.id === m.jobId) as Job | undefined
        if (!job) return null

        const score = Math.round(
          m.skillScore * 0.4 + m.experienceScore * 0.35 + m.directionScore * 0.25
        )

        return {
          job,
          score,
          skillScore: m.skillScore,
          experienceScore: m.experienceScore,
          directionScore: m.directionScore,
          reason: m.reason,
        }
      })
      .filter((r): r is MatchResult => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // 更新数据库记录
    if (recordId) {
      try {
        await prisma.matchRecord.update({
          where: { id: recordId },
          data: {
            results: JSON.stringify(results),
            preferences: preferences || '',
          },
        })
      } catch {
        // 数据库更新失败不影响主流程
      }
    }

    return NextResponse.json<ApiResponse<{ results: MatchResult[] }>>({
      success: true,
      data: { results },
    })
  } catch (error) {
    console.error('岗位匹配错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务暂时不可用，请稍后再试' },
      { status: 500 }
    )
  }
}
