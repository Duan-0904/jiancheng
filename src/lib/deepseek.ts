import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
})

interface ChatOptions {
  model?: string
  maxTokens?: number
}

/**
 * 调用 DeepSeek API，强制返回 JSON
 */
export async function chatJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options: ChatOptions = {}
): Promise<T> {
  const { model = 'deepseek-v4-flash', maxTokens = 4096 } = options

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    max_tokens: maxTokens,
    temperature: 0.3, // 低温度保证输出稳定
  })

  const raw = response.choices[0]?.message?.content || '{}'

  // 预处理层：清理可能的 Markdown 标记、补全残缺 JSON
  const cleaned = cleanJSONResponse(raw)

  try {
    return JSON.parse(cleaned) as T
  } catch (e) {
    console.error('JSON parse error, raw:', raw.slice(0, 500))
    console.error('Cleaned:', cleaned.slice(0, 500))
    throw new Error('AI 返回格式异常，请重试')
  }
}

/**
 * 清洗 API 响应：去 Markdown 标记、补全残缺 JSON
 */
function cleanJSONResponse(raw: string): string {
  let s = raw.trim()

  // 去掉 ```json ... ``` 包裹
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  // 尝试找第一个 { 到最后一个 }
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1)
  }

  return s
}

export default client
