'use client'
import { useState, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useDocuments } from '@/hooks/useData'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = [
  { value: 'all', label: 'Tous', icon: 'folder' },
  { value: 'ordonnance', label: 'Ordonnances', icon: 'description' },
  { value: 'bilan', label: 'Bilans', icon: 'assignment' },
  { value: 'courrier', label: 'Courriers', icon: 'mail' },
  { value: 'imagerie', label: 'Imagerie', icon: 'image' },
  { value: 'administratif', label: 'Administratif', icon: 'folder_special' },
  { value: 'autre', label: 'Autre', icon: 'attach_file' },
] as const

type CategoryValue = typeof CATEGORIES[number]['value']

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  'application/pdf': { icon: 'picture_as_pdf', color: '#E53E3E' },
  'image/jpeg': { icon: 'image', color: '#4A90D9' },
  'image/png': { icon: 'image', color: '#4A90D9' },
  'image/webp': { icon: 'image', color: '#4A90D9' },
  'application/msword': { icon: 'description', color: '#2B6CB0' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'description', color: '#2B6CB0' },
}

function getFileInfo(fileType: string | null) {
  if (!fileType) return { icon: 'attach_file', color: '#718096' }
  return FILE_ICONS[fileType] || { icon: 'attach_file', color: '#718096' }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function UploadModal({
  onUpload,
  onCancel,
}: {
  onUpload: (file: File, category: string, description: string) => Promise<void>
  onCancel: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('ordonnance')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) setFile(droppedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    await onUpload(file, category, description)
    setUploading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un document</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#4A90D9] bg-[#4A90D9]/5'
                : file
                  ? 'border-[#7EC8B0] bg-[#7EC8B0]/5'
                  : 'border-gray-200 hover:border-[#4A90D9]/40 hover:bg-gray-50'
            }`}
            role="button"
            aria-label="Zone de depot de fichier"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
              onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }}
            />
            {file ? (
              <div className="flex items-center gap-3 justify-center">
                <span className="material-symbols-outlined text-[28px] text-[#7EC8B0]">check_circle</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[40px] text-gray-300 block mb-2">cloud_upload</span>
                <p className="text-sm text-gray-500 font-medium">
                  Glissez un fichier ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, images, documents Word (max 10 Mo)
                </p>
              </>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="doc-category">
              Categorie
            </label>
            <select
              id="doc-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none bg-white"
            >
              {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="doc-desc">
              Description
            </label>
            <textarea
              id="doc-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Description du document..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none resize-none"
            />
          </div>

          {/* Info box OCR */}
          <div className="p-3 bg-[#4A90D9]/5 rounded-xl border border-[#4A90D9]/10">
            <p className="text-xs text-[#4A90D9] flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
              Les images envoyees seront analysees par OCR pour faciliter la recherche dans vos documents.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={!file || uploading} className="flex-1">
              {uploading ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default function DocumentsPage() {
  const { selectedChild } = useSelectedChild()
  const { documents, loading, upload, remove } = useDocuments(selectedChild?.id)
  const [activeCategory, setActiveCategory] = useState<CategoryValue>('all')
  const [showUpload, setShowUpload] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const filteredDocs = documents.filter(d => {
    if (activeCategory !== 'all' && d.category !== activeCategory) return false
    if (search) {
      const q = search.toLowerCase()
      const matchName = d.file_name.toLowerCase().includes(q)
      const matchDesc = d.description?.toLowerCase().includes(q) || false
      if (!matchName && !matchDesc) return false
    }
    return true
  })

  const handleUpload = async (file: File, category: string, description: string) => {
    const result = await upload(file, category, description || undefined)
    if (result.error) {
      showToast('Erreur lors de l\'envoi')
    } else {
      showToast('Document ajoute avec succes')
      setShowUpload(false)
    }
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    showToast('Document supprime')
  }

  if (!selectedChild) {
    return (
      <DashboardLayout title="Documents" breadcrumb={[{ label: 'Documents', href: '/dashboard/documents' }]}>
        <Card className="rounded-2xl text-center py-12">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">child_care</span>
          <p className="text-gray-500">Selectionnez un enfant pour gerer ses documents</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Documents"
      breadcrumb={[{ label: 'Documents', href: '/dashboard/documents' }]}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-lg z-50 text-[#4A90D9] font-medium">
        Aller au contenu principal
      </a>

      <div id="main-content" className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#4A90D9]">{documents.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total documents</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#7EC8B0]">
              {documents.filter(d => d.category === 'ordonnance').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ordonnances</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#E8A87C]">
              {documents.filter(d => d.category === 'bilan').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Bilans</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-500">
              {documents.filter(d => !['ordonnance', 'bilan'].includes(d.category)).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Autres</p>
          </div>
        </div>

        {/* Search + Upload */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un document..."
              aria-label="Rechercher un document"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
            />
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            size="sm"
            icon="upload"
            aria-label="Ajouter un document"
          >
            Ajouter
          </Button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x" role="tablist" aria-label="Filtrer par categorie">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              role="tab"
              aria-selected={activeCategory === c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === c.value
                  ? 'bg-[#4A90D9] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
          </div>
        ) : filteredDocs.length === 0 ? (
          <Card className="rounded-2xl text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">folder_open</span>
            <p className="text-gray-400 font-medium">
              {search ? 'Aucun document trouve' : 'Aucun document'}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {search ? 'Essayez un autre terme de recherche' : 'Cliquez sur Ajouter pour commencer'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredDocs.map(doc => {
                const fileInfo = getFileInfo(doc.file_type)
                const catInfo = CATEGORIES.find(c => c.value === doc.category)
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all group">
                      {/* File icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${fileInfo.color}15` }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ color: fileInfo.color }}
                        >
                          {fileInfo.icon}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {catInfo && (
                            <Badge variant="primary" size="sm">
                              {catInfo.label}
                            </Badge>
                          )}
                          {doc.document_date && (
                            <span className="text-xs text-gray-400">
                              {new Date(doc.document_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Telecharger le document"
                          className="p-2 rounded-xl text-gray-400 hover:text-[#4A90D9] hover:bg-[#4A90D9]/8 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          aria-label="Supprimer le document"
                          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white rounded-2xl shadow-xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
