import type { RewriteItem as TRewriteItem } from '@/types'

/**
 * 单条改写建议组件
 * 三段式展示：在哪里改 / 改成什么 / 为什么
 */
export function RewriteItem({
  item,
  index,
}: {
  item: TRewriteItem
  index: number
}) {
  return (
    <div className="bg-[#f9f9fb] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e8e8ed] text-[13px] font-medium text-[#86868b] flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="space-y-2 min-w-0">
          {/* 位置 */}
          <Field label="在哪里改" value={item.location} />
          {/* 内容 */}
          <Field label="改成什么" value={item.change} />
          {/* 理由 */}
          <Field label="为什么" value={item.reason} muted />
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div>
      <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide">
        {label}
      </span>
      <p className={`text-[15px] ${muted ? 'text-[#6e6e73]' : 'text-[#1d1d1f]'}`}>
        {value}
      </p>
    </div>
  )
}
