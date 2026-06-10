import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "简程 — AI 简历与岗位匹配",
  description:
    "上传简历，AI 帮你找到最匹配的岗位，并给出具体的简历改写建议。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-md border-b border-[#e5e5ea]">
          <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
            <a href="/" className="text-[17px] font-semibold text-[#1d1d1f] no-underline tracking-tight">
              简程
            </a>
            <nav className="flex items-center gap-4">
              <a href="/history" className="text-[14px] text-[#86868b] no-underline hover:text-[#0071e3] transition-colors">
                历史记录
              </a>
              <span className="text-[14px] text-[#86868b]">
                AI 简历匹配
              </span>
            </nav>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1">{children}</main>

        {/* 底部 */}
        <footer className="py-8 text-center text-[13px] text-[#86868b] border-t border-[#e5e5ea] mt-auto">
          <p>简程 · AI 驱动的简历与岗位匹配工具</p>
          <p className="mt-1">信息来源于网络，仅供参考</p>
        </footer>
      </body>
    </html>
  )
}
