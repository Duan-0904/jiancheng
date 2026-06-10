import { NextResponse } from 'next/server'
import { chatJSON } from '@/lib/deepseek'
import { JD_HIGHLIGHTS_PROMPT, RECOMMENDATION_PROMPT } from '@/lib/prompts'
import type { Resume, ApiResponse } from '@/types'

interface JDHighlightsResponse {
  highlights: string[]
}

interface RecommendationResponse {
  analysis: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { jdFull, resume } = body as {
      jdFull: string
      resume: Resume
    }

    if (!jdFull) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '缺少岗位信息' },
        { status: 400 }
      )
    }

    // 并行请求：JD提炼 + 推荐分析
    const [highlightsResult, analysisResult] = await Promise.allSettled([
      chatJSON<JDHighlightsResponse>(
        JD_HIGHLIGHTS_PROMPT,
        `请提炼以下JD的核心要求：\n${jdFull}`,
        { model: 'deepseek-v4-flash' }
      ),
      resume
        ? chatJSON<RecommendationResponse>(
            RECOMMENDATION_PROMPT,
            `JD：${jdFull}\n\n简历：${JSON.stringify(resume)}\n\n请分析为什么推荐投递这个岗位。`
          )
        : Promise.resolve(null),
    ])

    const highlights =
      highlightsResult.status === 'fulfilled'
        ? highlightsResult.value.highlights
        : ['JD核心要求解析暂时失败，请查看完整JD']

    const analysis =
      analysisResult.status === 'fulfilled' && analysisResult.value
        ? analysisResult.value.analysis
        : null

    return NextResponse.json<
      ApiResponse<{ highlights: string[]; analysis: string | null }>
    >({
      success: true,
      data: { highlights, analysis },
    })
  } catch (error) {
    console.error('岗位详情错误:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '岗位信息加载失败，请稍后重试' },
      { status: 500 }
    )
  }
}
