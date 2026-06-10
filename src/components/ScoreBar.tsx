/**
 * 评分条组件
 * 分数 0-100，颜色按阈值变化：绿(≥80) / 橙(≥60) / 红(<60)
 */
export function ScoreBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return '#34c759'
    if (v >= 60) return '#ff9500'
    return '#ff3b30'
  }

  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1">
        <span className="text-[#86868b]">{label}</span>
        <span className="text-[#1d1d1f] font-medium">{value}</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{
            width: `${value}%`,
            backgroundColor: getColor(value),
          }}
        />
      </div>
    </div>
  )
}
