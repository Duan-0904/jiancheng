'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'

/**
 * 路由级加载状态
 * Next.js 会自动在页面加载时展示此组件
 */
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <LoadingSpinner text="页面加载中..." />
    </div>
  )
}
