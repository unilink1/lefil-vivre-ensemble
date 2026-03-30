'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import { getSharedData } from '@/hooks/useData'
import { supabase } from '@/lib/supabase'
import type { Child, Practitioner, Session, Document, Message } from '@/lib/supabase'

type SharedData = {
  child: Child | null
  practitioner: Practitioner | null
  sessions: Session[] | null
  documents: Document[] | null
  permissions: 'read' | 'read_write'
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

function getDocIcon(fileType: string | null, fileName: string): string {
  if (!fileType && !fileName) return 'description'
  const ft = (fileType || '').toLowerCase()
  const fn = (fileName || '').toLowerCase()
  if (ft.includes('pdf') || fn.endsWith('.pdf')) return 'picture_as_pdf'
  if (ft.includes('image') || fn.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image'
  if (ft.includes('word') || fn.match(/\.(doc|docx)$/)) return 'description'
  if (ft.includes('spreadsheet') || fn.match(/\.(xls|xlsx|csv)$/)) return 'table_chart'
  return 'attach_file'
}

const UPLOAD_CATEGORIES = [
  { value: 'compte_rendu', label: 'Compte-rendu' },
  { value: 'bilan', label: 'Bilan' },
  { value: 'ordonnance', label: 'Ordonnance' },
  { value: 'certificat', label: 'Certificat' },
  { value: 'autre', label: 'Autre' },
]

export default function PartagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin" />
      </div>
    }>
      <PartageContent />
    </Suspense>
  )
}

function PartageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [data, setData] = useState<SharedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Observation form
  const [showForm, setShowForm] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState(0)
  const [obsDate, setObsDate] = useState('')
  const [obsContent, setObsContent] = useState('')
  const [obsRecommendations, setObsRecommendations] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Document upload
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('compte_rendu')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!token) {
        setError('Aucun token fourni. Ce lien est invalide.')
        setLoading(false)
        return
      }
      try {
        const result = await getSharedData(token)
        if (!result || !result.child) {
          setError('Ce lien de partage est invalide ou a expire.')
          setLoading(false)
          return
        }
        setData(result as SharedData)
      } catch {
        setError('Erreur lors du chargement des donnees.')
      }
      setLoading(false)
    }
    load()
  }, [token])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!data?.child?.id || !data?.practitioner?.id) return
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('child_id', data.child.id)
      .eq('practitioner_id', data.practitioner.id)
      .order('created_at', { ascending: true })
    if (msgs) setMessages(msgs)
  }, [data?.child?.id, data?.practitioner?.id])

  // Initial fetch + polling every 5s
  useEffect(() => {
    if (!data?.child?.id || !data?.practitioner?.id) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [data?.child?.id, data?.practitioner?.id, fetchMessages])

  // Scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !data?.child?.id || !data?.practitioner?.id) return
    setSendingMsg(true)
    await supabase.from('messages').insert({
      child_id: data.child.id,
      practitioner_id: data.practitioner.id,
      sender_is_parent: false,
      content: chatInput.trim(),
    })
    setChatInput('')
    await fetchMessages()
    setSendingMsg(false)
  }

  const handleSubmitObservation = async () => {
    if (!data?.child || !data?.practitioner || !token) return
    setSubmitting(true)
    try {
      await supabase.from('sessions').insert({
        child_id: data.child.id,
        practitioner_id: data.practitioner.id,
        created_by_parent: false,
        session_date: obsDate || new Date().toISOString().split('T')[0],
        observations: obsContent,
        progress: `${selectedProgress}/5`,
        homework: obsRecommendations || null,
        child_mood: selectedProgress || null,
      })
      setSubmitSuccess(true)
      setShowForm(false)
      setObsContent('')
      setObsRecommendations('')
      setSelectedProgress(0)
      setObsDate('')
      // Refresh data
      const result = await getSharedData(token)
      if (result) setData(result as SharedData)
    } catch {
      // silent
    }
    setSubmitting(false)
  }

  const handleUploadDocument = async () => {
    if (!uploadFile || !data?.child || !data?.practitioner || !token) return
    setUploading(true)
    try {
      const timestamp = Date.now()
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `shared/${data.child.id}/${data.practitioner.id}/${timestamp}-${safeName}`

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile)

      if (storageError) {
        console.error('Upload error:', storageError)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)

      await supabase.from('documents').insert({
        child_id: data.child.id,
        practitioner_id: data.practitioner.id,
        uploaded_by: data.practitioner.created_by,
        file_name: uploadFile.name,
        file_url: urlData.publicUrl,
        file_type: uploadFile.type,
        category: uploadCategory,
        description: uploadDescription || null,
        document_date: new Date().toISOString().split('T')[0],
        is_private: false,
      })

      setUploadSuccess(true)
      setShowUpload(false)
      setUploadFile(null)
      setUploadDescription('')
      setUploadCategory('compte_rendu')
      if (fileInputRef.current) fileInputRef.current.value = ''

      // Refresh data
      const result = await getSharedData(token)
      if (result) setData(result as SharedData)
    } catch (err) {
      console.error('Document upload failed:', err)
    }
    setUploading(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verification du lien de partage...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-dvh bg-[#F7F8FA]">
        <div className="flex items-center justify-center min-h-dvh">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-[40px]">link_off</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900 mb-3">Lien invalide ou expire</h1>
            <p className="text-gray-500 mb-8">{error || 'Ce lien de partage n\'est plus actif. Veuillez contacter la famille pour obtenir un nouveau lien.'}</p>
            <Logo size="sm" />
          </div>
        </div>
      </div>
    )
  }

  const { child, practitioner, sessions, documents } = data
  const childAge = child?.birth_date ? calculateAge(child.birth_date) : null
  const childInitials = child ? getInitials(child.first_name, child.last_name) : '??'
  const diagnoses = child?.diagnosis_primary
    ? [child.diagnosis_primary, ...(child.diagnosis_secondary || [])]
    : []
  const allergies = child?.allergies || []
  const treatments = child?.current_treatments || []
  const canWrite = data.permissions === 'read_write'

  const practitionerLabel = practitioner
    ? `${practitioner.first_name} ${practitioner.last_name}`
    : 'Praticien'

  return (
    <div className="min-h-dvh bg-[#F7F8FA]">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#5CB89A] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Espace praticien — {practitionerLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5CB89A]/10 text-[#5CB89A] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Securise
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ========== HERO — Child Summary ========== */}
        <section className="bg-white border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#3B82D9]/5 via-[#5CB89A]/5 to-transparent p-8">
            <div className="flex flex-col sm:flex-row items-start gap-8">

              {/* Left: Child info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Dossier patient</p>
                <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                  {child?.first_name || '—'} {child?.last_name || ''}
                </h1>
                {childAge !== null && (
                  <p className="text-gray-500 text-lg mb-5">{childAge} ans</p>
                )}

                {/* Diagnoses */}
                {diagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {diagnoses.map((d, i) => (
                      <Badge key={i} variant={i === 0 ? 'primary' : 'secondary'} size="md">{d}</Badge>
                    ))}
                  </div>
                )}

                {/* Treatments */}
                {treatments.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Traitements en cours</p>
                    <div className="flex flex-wrap gap-2">
                      {treatments.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm">
                          <span className="material-symbols-outlined text-[#3B82D9] text-[16px]">medication</span>
                          <span className="text-gray-800 font-medium">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practitioner info */}
                {practitioner && (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#3B82D9]">person</span>
                      {practitioner.first_name} {practitioner.last_name} — {practitioner.specialty}
                    </span>
                    {practitioner.follow_up_frequency && (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#5CB89A]">event_repeat</span>
                        {practitioner.follow_up_frequency}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Child photo */}
              <div className="shrink-0 order-first sm:order-last">
                {child?.photo_url ? (
                  <img
                    src={child.photo_url}
                    alt={`Photo de ${child.first_name}`}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-lg border-2 border-white"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#3B82D9] to-[#5CB89A] flex items-center justify-center text-white text-4xl font-bold shadow-lg border-2 border-white">
                    {childInitials}
                  </div>
                )}
              </div>
            </div>

            {/* Allergies Alert */}
            {allergies.length > 0 && (
              <div className="mt-6 bg-red-50 border border-red-200 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-red-600 text-[22px]">warning</span>
                </div>
                <div>
                  <p className="font-bold text-red-700 text-sm mb-2">Allergies connues</p>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px]">dangerous</span>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========== SESSIONS — Observation History ========== */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold flex items-center gap-2 text-gray-900">
              <span className="material-symbols-outlined text-[#3B82D9] text-[24px]">clinical_notes</span>
              Historique des seances
            </h2>
            {canWrite && (
              <Button
                size="sm"
                icon={showForm ? 'close' : 'add'}
                onClick={() => { setShowForm(!showForm); setSubmitSuccess(false) }}
                variant={showForm ? 'ghost' : 'primary'}
              >
                {showForm ? 'Fermer' : 'Ajouter une observation'}
              </Button>
            )}
          </div>

          {submitSuccess && (
            <div className="mb-4 p-4 bg-[#5CB89A]/10 border border-[#5CB89A]/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#5CB89A]">check_circle</span>
              <p className="text-sm text-[#5CB89A] font-medium">Observation enregistree avec succes !</p>
            </div>
          )}

          {showForm && canWrite && (
            <div className="bg-white border-2 border-[#3B82D9]/20 p-6 mb-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-[#3B82D9] text-[22px]">edit_note</span>
                Nouvelle observation
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Date de la seance</label>
                    <input
                      type="date"
                      value={obsDate}
                      onChange={e => setObsDate(e.target.value)}
                      className="w-full bg-gray-50 py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/30 border border-gray-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Progression (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setSelectedProgress(n)}
                          className={`w-12 h-12 text-sm font-bold cursor-pointer transition-all ${
                            selectedProgress === n
                              ? 'bg-[#3B82D9] text-white shadow-lg shadow-[#3B82D9]/20'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Observations de la seance</label>
                  <textarea
                    value={obsContent}
                    onChange={e => setObsContent(e.target.value)}
                    className="w-full bg-gray-50 p-4 text-sm outline-none resize-none h-28 focus:ring-2 focus:ring-[#3B82D9]/30 border border-gray-200 transition-all"
                    placeholder="Decrivez le deroulement de la seance, les progres observes, les points d'attention..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Recommandations pour la famille</label>
                  <textarea
                    value={obsRecommendations}
                    onChange={e => setObsRecommendations(e.target.value)}
                    className="w-full bg-gray-50 p-4 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-[#3B82D9]/30 border border-gray-200 transition-all"
                    placeholder="Exercices a pratiquer a la maison, conseils pour les parents..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
                  <Button size="sm" iconRight="send" onClick={handleSubmitObservation} disabled={submitting || !obsContent.trim()}>
                    {submitting ? 'Envoi...' : 'Envoyer l\'observation'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Session cards */}
          <div className="space-y-4">
            {sessions && sessions.length > 0 ? (
              sessions.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{moodEmojis[s.child_mood || 3] || '😐'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {s.objectives && <Badge variant="primary" size="sm">{s.objectives}</Badge>}
                        </div>
                        {s.child_mood && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className={`w-3 h-3 rounded-full ${n <= (s.child_mood || 0) ? 'bg-[#3B82D9]' : 'bg-gray-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{s.child_mood}/5</span>
                          </div>
                        )}
                      </div>
                      {s.observations && <p className="text-sm text-gray-600 leading-relaxed">{s.observations}</p>}
                      {s.progress && <p className="text-sm text-gray-600 leading-relaxed mt-1">{s.progress}</p>}
                      {s.homework && (
                        <div className="mt-3 bg-[#5CB89A]/8 border border-[#5CB89A]/20 p-3">
                          <p className="text-xs text-[#5CB89A] font-bold uppercase tracking-wider mb-1">Recommandations</p>
                          <p className="text-sm text-[#3d8a6e]">{s.homework}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-gray-200 p-6">
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-300 text-[40px] mb-2 block">clinical_notes</span>
                  <p className="text-sm text-gray-400">Aucune note de seance pour le moment.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========== DOCUMENTS ========== */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-2 text-gray-900">
                <span className="material-symbols-outlined text-[#E09060] text-[22px]">folder_shared</span>
                Documents partages
              </h3>
              {canWrite && (
                <Button
                  size="sm"
                  icon={showUpload ? 'close' : 'upload_file'}
                  onClick={() => { setShowUpload(!showUpload); setUploadSuccess(false) }}
                  variant={showUpload ? 'ghost' : 'primary'}
                >
                  {showUpload ? 'Fermer' : 'Deposer un document'}
                </Button>
              )}
            </div>

            {uploadSuccess && (
              <div className="mb-4 p-4 bg-[#5CB89A]/10 border border-[#5CB89A]/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#5CB89A]">check_circle</span>
                <p className="text-sm text-[#5CB89A] font-medium">Document depose avec succes !</p>
              </div>
            )}

            {/* Upload form */}
            {showUpload && canWrite && (
              <div className="bg-gray-50 border border-gray-200 p-5 mb-5">
                <h4 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3B82D9] text-[18px]">cloud_upload</span>
                  Deposer un nouveau document
                </h4>
                <div className="space-y-4">
                  {/* File input */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Fichier</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full bg-white py-2.5 px-4 text-sm border border-gray-200 cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:border-0 file:text-sm file:font-semibold file:bg-[#3B82D9]/10 file:text-[#3B82D9] file:cursor-pointer"
                    />
                    {uploadFile && (
                      <p className="text-xs text-gray-400 mt-1">
                        {uploadFile.name} — {(uploadFile.size / 1024).toFixed(0)} Ko
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Categorie</label>
                      <select
                        value={uploadCategory}
                        onChange={e => setUploadCategory(e.target.value)}
                        className="w-full bg-white py-3 px-4 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-[#3B82D9]/30 transition-all"
                      >
                        {UPLOAD_CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Description (optionnelle)</label>
                      <input
                        type="text"
                        value={uploadDescription}
                        onChange={e => setUploadDescription(e.target.value)}
                        placeholder="Ex: Bilan orthophonique mars 2026"
                        className="w-full bg-white py-3 px-4 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-[#3B82D9]/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-1">
                    <Button variant="ghost" size="sm" onClick={() => { setShowUpload(false); setUploadFile(null) }}>Annuler</Button>
                    <Button size="sm" iconRight="upload" onClick={handleUploadDocument} disabled={uploading || !uploadFile}>
                      {uploading ? 'Envoi en cours...' : 'Deposer le document'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Document list */}
            <div className="space-y-3">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-[#E09060]/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#E09060] text-[22px]">{getDocIcon(doc.file_type, doc.file_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800 block truncate">{doc.file_name}</span>
                      <span className="text-xs text-gray-400">
                        {doc.document_date ? new Date(doc.document_date).toLocaleDateString('fr-FR') : ''}{doc.category ? ` — ${doc.category}` : ''}
                        {doc.description ? ` — ${doc.description}` : ''}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#3B82D9] text-[20px] opacity-50 group-hover:opacity-100 transition-opacity">download</span>
                  </a>
                ))
              ) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-gray-300 text-[32px] mb-2 block">folder_off</span>
                  <p className="text-sm text-gray-400">Aucun document partage.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========== CHAT ========== */}
        <section className="mb-8">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-full flex items-center justify-between p-5 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3B82D9]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3B82D9] text-[22px]">chat</span>
              </div>
              <div className="text-left">
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-gray-900">Discussion avec la famille</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {messages.length > 0
                    ? `${messages.length} message${messages.length > 1 ? 's' : ''}`
                    : 'Aucun message pour le moment'}
                </p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-[#3B82D9] text-[24px] transition-transform ${chatOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {chatOpen && (
            <div className="border border-t-0 border-gray-200 overflow-hidden bg-white">
              {/* Messages area */}
              <div className="max-h-80 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-300 text-[32px] mb-2 block">forum</span>
                    <p className="text-sm text-gray-400">Aucun message. Commencez la discussion.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_is_parent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 ${
                        msg.sender_is_parent
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-[#3B82D9] text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_is_parent ? 'text-gray-400' : 'text-white/60'}`}>
                        {new Date(msg.created_at).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-4 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Votre message..."
                  className="flex-1 py-3 px-4 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9] transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMsg || !chatInput.trim()}
                  className="w-11 h-11 bg-[#3B82D9] text-white flex items-center justify-center cursor-pointer hover:bg-[#2d6ab8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========== FOOTER — HDS / RGPD ========== */}
        <footer className="py-10 border-t border-gray-200">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5CB89A]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5CB89A] text-[22px]">verified_user</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Hebergement certifie HDS</p>
                <p className="text-xs text-gray-400">Donnees de sante protegees — Conformite RGPD</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Chiffrement AES-256
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">gpp_good</span>
                ISO 27001
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                HDS
              </span>
            </div>
            <Logo size="sm" />
            <p className="text-[10px] text-gray-400 mt-2">
              Politique de confidentialite &middot; Conditions d&apos;utilisation &middot; Mentions legales
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
