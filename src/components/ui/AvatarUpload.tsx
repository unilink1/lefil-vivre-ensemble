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
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = size === 'lg' ? 'w-28 h-28 text-3xl' : 'w-20 h-20 text-xl'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Format non supporté')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop lourde (max 5MB)')
      return
    }

    setUploading(true)
    try {
      // Read file as data URL directly (simpler, more reliable)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Erreur de lecture'))
        reader.readAsDataURL(file)
      })

      // Compress via canvas
      const compressed = await compressImage(dataUrl, 300, 0.7)
      setPreview(compressed)
      await onUpload(compressed)
    } catch {
      setError('Erreur lors du chargement')
    }
    setUploading(false)
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayUrl = preview || currentUrl

  return (
    <div className="relative inline-block">
      {/* eslint-disable @next/next/no-img-element */}
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Photo de profil"
          className={`${sizeClasses} rounded-full object-cover shadow-lg`}
        />
      ) : (
        <div className={`${sizeClasses} bg-gradient-to-br from-[#3B82D9] to-[#5CB89A] flex items-center justify-center text-white font-bold shadow-lg`}>
          {initials}
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={uploading ? 'Chargement de la photo…' : 'Modifier la photo de profil'}
        className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-[16px] text-gray-600">photo_camera</span>
        )}
      </button>

      {error && (
        <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500">{error}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}

function compressImage(dataUrl: string, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.naturalWidth
      let h = img.naturalHeight

      if (w > h) {
        if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize }
      } else {
        if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize }
      }

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl) // fallback to original if canvas fails
    img.src = dataUrl
  })
}
