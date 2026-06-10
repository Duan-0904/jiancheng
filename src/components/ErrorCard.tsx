'use client'

/**
 * 通用错误状态卡片
 * 用于场景化提示，不暴露技术错误信息
 */
export function ErrorCard({
  title = '出了点问题',
  message,
  onRetry,
  onBack,
  backLabel = '返回首页',
  backHref = '/',
}: {
  title?: string
  message: string
  onRetry?: () => void
  onBack?: () => void
  backLabel?: string
  backHref?: string
}) {
  return (
    <div className="card p-8 text-center animate-in">
      <div className="text-4xl mb-4">😕</div>
      <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
        {title}
      </h3>
      <p className="text-[15px] text-[#86868b] mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button className="btn-primary" onClick={onRetry}>
            重试
          </button>
        )}
        {onBack ? (
          <button className="btn-secondary" onClick={onBack}>
            {backLabel}
          </button>
        ) : (
          <a href={backHref} className="btn-secondary no-underline inline-block">
            {backLabel}
          </a>
        )}
      </div>
    </div>
  )
}
