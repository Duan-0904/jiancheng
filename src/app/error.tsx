'use client'

import { ErrorCard } from '@/components/ErrorCard'

/**
 * 路由级错误边界
 * 捕获页面渲染级别的错误
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <ErrorCard
        title="页面加载出错"
        message={error.message || '发生了意外错误，请重试'}
        onRetry={reset}
      />
    </div>
  )
}
