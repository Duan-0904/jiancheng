'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryEntry {
  recordId: string
  createdAt: string
  topJob: string
  topScore: number
  count: number
  preferences: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('jiancheng_history')
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryEntry[]
        setHistory(parsed)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('jiancheng_history')
    setHistory([])
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return d.toLocaleDateString('zh-CN')
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16 animate-in">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#1d1d1f] mb-2">
          历史记录
        </h1>
        <p className="text-[17px] text-[#86868b]">
          过往匹配记录，保存在本设备浏览器中
        </p>
      </div>

      {/* 加载 */}
      {loading && (
        <div className="card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-[#0071e3] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[17px] text-[#86868b]">加载中...</p>
        </div>
      )}

      {/* 空状态 */}
      {!loading && history.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">
            暂无历史记录
          </h3>
          <p className="text-[15px] text-[#86868b] mb-6">
            完成一次简历匹配后，记录会出现在这里
          </p>
          <Link href="/" className="btn-primary inline-block no-underline">
            去上传简历
          </Link>
        </div>
      )}

      {/* 历史列表 */}
      {!loading && history.length > 0 && (
        <>
          <div className="space-y-3 mb-8">
            {history.map((entry) => (
              <Link
                key={entry.recordId}
                href={`/results?recordId=${entry.recordId}`}
                className="card p-5 block cursor-pointer no-underline text-inherit hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1 truncate">
                      {entry.topJob}
                    </h3>
                    <p className="text-[14px] text-[#86868b]">
                      {formatDate(entry.createdAt)} · 匹配 {entry.count} 个岗位
                      {entry.preferences ? ` · ${entry.preferences}` : ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div className="text-[24px] font-bold text-[#0071e3] leading-none">
                      {entry.topScore}
                    </div>
                    <div className="text-[12px] text-[#86868b] mt-0.5">最高分</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <button
              className="text-[14px] text-[#ff3b30] hover:underline"
              onClick={() => {
                if (window.confirm('确定清空所有历史记录？')) clearHistory()
              }}
            >
              清空历史记录
            </button>
          </div>
        </>
      )}

      {/* 底部提示 */}
      <p className="text-[13px] text-[#86868b] text-center mt-8">
        历史记录保存在本设备浏览器中，更换设备需要重新匹配
      </p>
    </div>
  )
}
