import { NextResponse } from 'next/server'
import { extractTextFromPDF, validatePDF } from '@/lib/pdf-parser'
import { chatJSON } from '@/lib/deepseek'
import { RESUME_PARSE_PROMPT } from '@/lib/prompts'
import { prisma } from '@/lib/prisma'
import type { Resume, ApiResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '请上传一份PDF简历' },
        { status: 400 }
      )
    }

    // 校验文件
    const validation = validatePDF(file)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: validation.error || '简历格式好像有点问题，换个PDF试试？' },
        { status: 400 }
      )
    }

    // 提取 PDF 文本
    let resumeText: string
    try {
      resumeText = await extractTextFromPDF(file)
    } catch {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '这个PDF无法读取文字，请确认是文本型PDF而非扫描图片' },
        { status: 400 }
      )
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '简历内容太短，请上传一份完整的PDF简历（至少50个字符）' },
        { status: 400 }
      )
    }

    // 用 DeepSeek 结构化解析简历
    let resume: Resume
    try {
      resume = await chatJSON<Resume>(
        RESUME_PARSE_PROMPT,
        `请解析以下简历文本：\n\n${resumeText.slice(0, 8000)}`,
        { model: 'deepseek-v4-flash' }
      )
    } catch {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '简历解析暂时失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 存入数据库
    const record = await prisma.matchRecord.create({
      data: {
        resumeText: resumeText.slice(0, 10000),
        resumeJson: JSON.stringify(resume),
        results: '[]',
      },
    })

    return NextResponse.json<ApiResponse<{ recordId: string; resume: Resume }>>({
      success: true,
      data: {
        recordId: record.id,
        resume,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('简历解析错误:', msg)
    console.error('详细堆栈:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '服务暂时不可用，请稍后再试' },
      { status: 500 }
    )
  }
}
