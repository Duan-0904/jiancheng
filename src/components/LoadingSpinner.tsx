'use client'

/**
 * 通用加载动画组件
 * 使用苹果风格的旋转指示器
 */
export function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
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
      <p className="text-[17px] text-[#86868b]">{text}</p>
    </div>
  )
}

/**
 * 行内小加载器
 */
export function InlineSpinner() {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="animate-spin w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full" />
    </div>
  )
}
