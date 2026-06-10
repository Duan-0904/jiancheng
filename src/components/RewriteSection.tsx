import type { RewriteSuggestion } from '@/types'
import { RewriteItem } from './RewriteItem'

const sectionIcons: Record<string, string> = {
  highlight: '💎',
  quickFix: '🔧',
  reposition: '🔄',
}

const sectionColors: Record<string, string> = {
  highlight: '#0071e3',
  quickFix: '#ff9500',
  reposition: '#34c759',
}

/**
 * 改写建议区块组件
 * 左侧彩色边框 + 图标标题 + 建议列表
 */
export function RewriteSection({ section }: { section: RewriteSuggestion }) {
  const color = sectionColors[section.section] || '#0071e3'
  const icon = sectionIcons[section.section] || '📝'

  return (
    <div
      className="card p-6"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-[21px] font-semibold text-[#1d1d1f]">
          {section.title}
        </h2>
      </div>

      <div className="space-y-3">
        {section.items.map((item, i) => (
          <RewriteItem key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}
