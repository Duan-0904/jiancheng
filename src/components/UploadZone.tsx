'use client'

import { useRef } from 'react'

/**
 * 拖拽上传区域组件
 * 支持拖拽和点击上传 PDF
 */
export function UploadZone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`upload-zone p-12 text-center cursor-pointer mb-6 ${
        isDragging ? 'dragover' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="text-4xl mb-4">📄</div>
      <h3 className="text-[21px] font-semibold text-[#1d1d1f] mb-2">
        拖拽或点击上传简历
      </h3>
      <p className="text-[14px] text-[#86868b]">
        仅支持 PDF 格式，大小不超过 10MB
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={() => {
          // handled by parent via onClick
        }}
      />
    </div>
  )
}
