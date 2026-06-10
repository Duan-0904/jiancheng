/**
 * 匹配进度步骤组件
 * 分阶段展示：AI简历建模 → 全网岗位对标 → 深度匹配筛选
 */
export function ProgressSteps({
  steps,
}: {
  steps: { label: string; done: boolean }[]
}) {
  return (
    <div className="space-y-3 max-w-sm mx-auto">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-500 ${
            step.done ? 'bg-[#f0f6ff]' : 'bg-[#f5f5f7]'
          }`}
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          <span
            className={`text-sm transition-all duration-300 ${
              step.done ? 'text-[#34c759] scale-100' : 'text-[#d2d2d7] scale-90'
            }`}
          >
            {step.done ? '✓' : '○'}
          </span>
          <span
            className={`text-[15px] transition-colors duration-300 ${
              step.done ? 'text-[#1d1d1f]' : 'text-[#86868b]'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
