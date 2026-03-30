'use client'
import { useState, useRef } from 'react'

interface AvatarUploadProps {
  currentUrl?: string | null
  initials: string
  onUpload: (dataUrl: string) => Promise<void>
  size?: 'md' | 'lg'
}

export default function AvatarUpload({ currentUrl, initials, onUpload, size = 'lg' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = size === 'lg'
    ? 'w-28 h-28 text-3xl'
    : 'w-20 h-20 text-xl'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return // 5MB max

    // Resize and compress
    const dataUrl = await resizeImage(file, 300)
    setPreview(dataUrl)
    setUploading(true)

    try {
      await onUpload(dataUrl)
    } catch {
      // silent
    }
    setUploading(false)
  }

  const displayUrl = preview || currentUrl

  return (
    <div className="relative inline-block">
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Avatar"
          className={`${sizeClasses} rounded-3xl object-cover shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses} rounded-3xl bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white font-bold shadow-lg`}>
          {initials}
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-[16px] text-gray-600">photo_camera</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height

        if (w > h) {
          if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize }
        } else {
          if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize }
        }

        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
