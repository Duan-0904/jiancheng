/**
 * 评分徽章组件
 * 带颜色背景的圆角卡片，展示分数 + 标签 + 进度条
 */
export function ScoreBadge({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return { bg: '#e8f8ed', text: '#34c759', bar: '#34c759' }
    if (v >= 60) return { bg: '#fff8ed', text: '#ff9500', bar: '#ff9500' }
    return { bg: '#fff0ef', text: '#ff3b30', bar: '#ff3b30' }
  }

  const colors = getColor(value)

  return (
    <div className="text-center p-3 rounded-xl" style={{ backgroundColor: colors.bg }}>
      <div className="text-[20px] font-bold" style={{ color: colors.text }}>
        {value}
      </div>
      <div className="text-[12px] text-[#86868b] mt-0.5">{label}</div>
      <div className="score-bar mt-2">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, backgroundColor: colors.bar }}
        />
      </div>
    </div>
  )
}
