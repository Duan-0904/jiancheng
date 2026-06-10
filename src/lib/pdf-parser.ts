// pdf-parse 是 CJS 模块，用 require 导入避免 webpack ESM 兼容问题
const pdfParse = require('pdf-parse')

/**
 * PDF 文本提取
 * 使用 pdf-parse 在服务端解析 PDF 文件
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const data = await pdfParse(buffer)
  return data.text || ''
}

/**
 * 校验 PDF 文件
 */
export function validatePDF(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: '请选择一个文件' }
  }

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return { valid: false, error: '请上传 PDF 格式的简历' }
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 10MB' }
  }

  return { valid: true }
}
