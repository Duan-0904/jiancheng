'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Resume, MatchResult, ApiResponse } from '@/types'
import { UploadZone } from '@/components/UploadZone'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ProgressSteps } from '@/components/ProgressSteps'

type Step = 'upload' | 'parsing' | 'parsed' | 'matching' | 'done'

const MATCH_STEPS = [
  { label: 'AI 简历建模', done: false },
  { label: '全网岗位对标', done: false },
  { label: '深度匹配筛选', done: false },
]

export default function HomePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [preferences, setPreferences] = useState('')
  const [recordId, setRecordId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [matchSteps, setMatchSteps] = useState(MATCH_STEPS)

  // 拖拽上传
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }, [])

  // 处理上传文件 → 调用解析 API
  const handleFile = async (selectedFile: File) => {
    setError(null)

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('请上传 PDF 格式的简历')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }

    setFile(selectedFile)
    setStep('parsing')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })
      const json: ApiResponse<{ recordId: string; resume: Resume }> = await res.json()

      if (!json.success || !json.data) {
        setError(json.error || '简历解析失败，请重试')
        setStep('upload')
        return
      }

      setResume(json.data.resume)
      setRecordId(json.data.recordId)
      setStep('parsed')
    } catch {
      setError('网络连接失败，请检查网络后重试')
      setStep('upload')
    }
  }

  // 开始匹配
  const handleMatch = async () => {
    if (!resume || !recordId) return

    setStep('matching')
    setError(null)
    setMatchSteps(MATCH_STEPS.map((s) => ({ ...s })))

    // 模拟分阶段进度
    const advanceStep = (index: number, delay: number) => {
      setTimeout(() => {
        setMatchSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, done: true } : s))
        )
      }, delay)
    }
    advanceStep(0, 600)
    advanceStep(1, 1200)

    try {
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, resume, preferences }),
      })
      const json: ApiResponse<{ results: MatchResult[] }> = await res.json()

      // 第三阶段完成
      setMatchSteps((prev) => prev.map((s) => ({ ...s, done: true })))

      if (!json.success || !json.data) {
        setError(json.error || '匹配失败，请重试')
        setStep('parsed')
        return
      }

      // 存入 localStorage
      localStorage.setItem('jiancheng_recordId', recordId)
      localStorage.setItem('jiancheng_results', JSON.stringify(json.data.results))
      localStorage.setItem('jiancheng_resume', JSON.stringify(resume))

      // 追加到历史记录
      saveToHistory(recordId, json.data.results, preferences)

      setStep('done')

      // 跳转到结果页
      setTimeout(() => {
        router.push(`/results?recordId=${recordId}`)
      }, 400)
    } catch {
      setError('正在努力匹配中，稍等一下再试试')
      setStep('parsed')
    }
  }

  const experienceCount = resume
    ? resume.experiences.length + resume.education.length
    : 0

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 md:py-20 animate-in">
      {/* 标题 */}
      <div className="text-center mb-10">
        <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] leading-tight text-[#1d1d1f] mb-4">
          让简历与岗位
          <br />
          真正对上
        </h1>
        <p className="text-[17px] text-[#86868b] leading-relaxed">
          上传简历，告诉AI你想找什么方向，得到具体的匹配分析和改写建议
        </p>
      </div>

      {/* 上传区域 */}
      {step === 'upload' && (
        <>
          <UploadZone
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="card p-5 mb-6">
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              求职偏好（可选）
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="比如：北京AI产品经理，20k+，成长性优先"
              className="w-full px-4 py-3 rounded-lg border border-[#d2d2d7] text-[17px] text-[#1d1d1f] placeholder-[#86868b] outline-none focus:border-[#0071e3] transition-colors"
            />
            <p className="text-[14px] text-[#86868b] mt-2">
              自然语言描述即可，不用填表
            </p>
          </div>

          <button
            className="btn-primary w-full opacity-50 cursor-not-allowed"
            disabled
          >
            请先上传简历
          </button>
        </>
      )}

      {/* 解析中 */}
      {step === 'parsing' && (
        <LoadingSpinner text="AI 正在提取你的技能和经历..." />
      )}

      {/* 解析完成 */}
      {step === 'parsed' && resume && (
        <div className="animate-in">
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#34c759] text-white text-sm">
                ✓
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
                  {file?.name}
                </h3>
                <p className="text-[14px] text-[#86868b]">
                  已识别 {resume.skills.length} 项技能 · {experienceCount} 段经历
                </p>
              </div>
            </div>

            {/* 技能标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {resume.skills.slice(0, 8).map((skill, i) => (
                <span
                  key={i}
                  className="inline-block px-3 py-1 rounded-full bg-[#f5f5f7] text-[14px] text-[#1d1d1f]"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 8 && (
                <span className="inline-block px-3 py-1 rounded-full text-[14px] text-[#86868b]">
                  +{resume.skills.length - 8}
                </span>
              )}
            </div>

            {/* 经历摘要 */}
            {resume.experiences.length > 0 && (
              <div className="border-t border-[#e5e5ea] pt-4">
                <p className="text-[14px] text-[#86868b] mb-2">识别到的主要经历</p>
                {resume.experiences.slice(0, 2).map((exp, i) => (
                  <div key={i} className="text-[14px] text-[#1d1d1f] mb-1">
                    {exp.company} · {exp.role}
                    {exp.duration ? ` · ${exp.duration}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 偏好输入 */}
          <div className="card p-5 mb-6">
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              求职偏好（可选）
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="比如：北京AI产品经理，20k+，成长性优先"
              className="w-full px-4 py-3 rounded-lg border border-[#d2d2d7] text-[17px] text-[#1d1d1f] placeholder-[#86868b] outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>

          <button className="btn-primary w-full" onClick={handleMatch}>
            开始匹配
          </button>
        </div>
      )}

      {/* 匹配中 */}
      {step === 'matching' && (
        <div className="card p-12 text-center animate-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f0f6ff] mb-6">
            <svg
              className="animate-spin h-8 w-8 text-[#0071e3]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-4">
            正在全网匹配岗位
          </h3>
          <ProgressSteps steps={matchSteps} />
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="card p-6 mt-6 border-[#ff3b30]/20 bg-[#fff5f5]">
          <div className="flex items-start gap-3">
            <span className="text-[#ff3b30] text-xl flex-shrink-0">⚠</span>
            <div>
              <p className="text-[15px] text-[#1d1d1f] font-medium mb-1">出了点问题</p>
              <p className="text-[14px] text-[#6e6e73]">{error}</p>
            </div>
            <button
              className="btn-secondary ml-auto flex-shrink-0 text-[14px] px-4 py-2"
              onClick={() => {
                setError(null)
                setStep(file ? 'parsed' : 'upload')
              }}
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** 将匹配结果追加到 localStorage 历史 */
function saveToHistory(
  recordId: string,
  results: MatchResult[],
  preferences: string
) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('jiancheng_history')
    const history: Array<{
      recordId: string
      createdAt: string
      topJob: string
      topScore: number
      count: number
      preferences: string
    }> = raw ? JSON.parse(raw) : []

    const top = results[0]
    history.unshift({
      recordId,
      createdAt: new Date().toISOString(),
      topJob: top ? `${top.job.title} @ ${top.job.company}` : '未知',
      topScore: top ? top.score : 0,
      count: results.length,
      preferences,
    })

    // 最多保留 20 条
    localStorage.setItem(
      'jiancheng_history',
      JSON.stringify(history.slice(0, 20))
    )
  } catch {
    // 静默失败
  }
}
