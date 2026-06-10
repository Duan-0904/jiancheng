import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/deepseek'
import { REWRITE_PROMPT } from '@/lib/prompts'
import { prisma } from '@/lib/prisma'
import type { Job, Resume, RewriteResult, ApiResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resumeText, resume, job, matchId } = body as {
      resumeText: string
      resume: Resume
      job: Job
      matchId?: string
    }

    if (!resume || !job) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '缺少简历或岗位信息' },
        { status: 400 }
      )
    }

    const userMessage = `候选人简历：
${JSON.stringify(resume, null, 2)}

目标岗位：
职位：${job.title}
公司：${job.company}
城市：${job.city}
JD全文：${job.jdFull}
JD核心要求：${job.jdHighlights.join('、')}

请给出针对这个岗位的具体简历修改建议。记住：每个建议必须包含"在哪里改+改成什么+为什么"。`

    let result: RewriteResult
    try {
      result = await chatJSON<RewriteResult>(
        REWRITE_PROMPT,
        userMessage,
        { model: 'deepseek-v4-pro', maxTokens: 4096 }
      )
    } catch {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '改写建议生成失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 存入数据库
    if (matchId) {
      try {
        await prisma.rewriteRecord.create({
          data: {
            matchId,
            jobJson: JSON.stringify(job),
            resumeText: resumeText.slice(0, 10000),
            suggestions: JSON.stringify(result.suggestions),
          },
        })
      } catch {
        // 数据库记录失败不影响主流程
      }
    }

    return NextResponse.json<ApiResponse<RewriteResult>>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('简历改写错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务暂时不可用，请稍后再试' },
      { status: 500 }
    )
  }
}
