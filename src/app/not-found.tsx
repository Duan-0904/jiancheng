import Link from 'next/link'

/**
 * 404 页面
 */
export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20 text-center animate-in">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-[32px] font-bold text-[#1d1d1f] mb-3">
        页面未找到
      </h1>
      <p className="text-[17px] text-[#86868b] mb-8">
        你访问的页面不存在，可能已被移除或链接有误
      </p>
      <Link href="/" className="btn-primary inline-block no-underline">
        返回首页
      </Link>
    </div>
  )
}
