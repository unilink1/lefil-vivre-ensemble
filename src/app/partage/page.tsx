'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
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

export default function PartagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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
        setError('Erreur lors du chargement des données.')
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm">Verification du lien de partage...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-dvh bg-surface relative">
        <FloatingOrbs variant="subtle" />
        <div className="flex items-center justify-center min-h-dvh relative z-10">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-error-container rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-error text-[40px]">link_off</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface mb-3">Lien invalide ou expire</h1>
            <p className="text-on-surface-variant mb-8">{error || 'Ce lien de partage n\'est plus actif. Veuillez contacter la famille pour obtenir un nouveau lien.'}</p>
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

  return (
    <div className="min-h-dvh bg-surface relative">
      <FloatingOrbs variant="subtle" />

      {/* Security Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <Badge variant="secondary" icon="shield" size="md">
              Acces securise — {practitioner ? `${practitioner.first_name} ${practitioner.last_name}` : 'Praticien'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">

        {/* Child Summary Hero */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" />
            <div className="relative p-8">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Dossier patient</p>
                  <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface mb-3">
                    {child?.first_name || '—'}{childAge !== null ? `, ${childAge} ans` : ''}
                  </h1>
                  <p className="text-on-surface-variant mb-5">Suivi pluridisciplinaire coordonne</p>
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
                      <p className="text-xs text-outline uppercase tracking-wider mb-2">Traitements en cours</p>
                      <div className="flex flex-wrap gap-2">
                        {treatments.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-surface-card/80 rounded-lg text-sm">
                            <span className="material-symbols-outlined text-primary text-[16px]">medication</span>
                            <span className="text-on-surface font-medium">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practitioner info */}
                  {practitioner && (
                    <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                        {practitioner.first_name} {practitioner.last_name} — {practitioner.specialty}
                      </span>
                      {practitioner.follow_up_frequency && (
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">event_repeat</span>
                          {practitioner.follow_up_frequency}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/15">
                    {childInitials}
                  </div>
                </div>
              </div>

              {/* Allergies Alert */}
              {allergies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-error-container/80 backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 border border-error/10"
                >
                  <div className="w-10 h-10 bg-error/15 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[22px]">warning</span>
                  </div>
                  <div>
                    <p className="font-bold text-error text-sm mb-2">Allergies connues</p>
                    <div className="flex gap-2">
                      {allergies.map((a, i) => (
                        <Badge key={i} variant="error" icon="dangerous">{a}</Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Add Observation Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">clinical_notes</span>
              Historique des séances
            </h2>
            {canWrite && (
              <Button size="sm" icon={showForm ? 'close' : 'add'} onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'}>
                {showForm ? 'Fermer' : 'Ajouter une observation'}
              </Button>
            )}
          </div>

          {submitSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-secondary-container/50 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <p className="text-sm text-secondary font-medium">Observation enregistrée avec succès !</p>
            </motion.div>
          )}

          {showForm && canWrite && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card padding="lg" className="mb-6 border-2 border-primary/20 shadow-lg shadow-primary/5">
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                  Nouvelle observation
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Date de la séance</label>
                      <input
                        type="date"
                        value={obsDate}
                        onChange={e => setObsDate(e.target.value)}
                        className="w-full bg-surface-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Progression (1-5)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <motion.button
                            key={n}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedProgress(n)}
                            className={`w-12 h-12 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                              selectedProgress === n
                                ? 'gradient-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface-low hover:bg-surface-high text-on-surface-variant border border-outline-variant/20'
                            }`}
                          >{n}</motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Observations de la séance</label>
                    <textarea
                      value={obsContent}
                      onChange={e => setObsContent(e.target.value)}
                      className="w-full bg-surface-low rounded-xl p-4 text-sm outline-none resize-none h-28 focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
                      placeholder="Décrivez le déroulement de la séance, les progrès observés, les points d'attention..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Recommandations pour la famille</label>
                    <textarea
                      value={obsRecommendations}
                      onChange={e => setObsRecommendations(e.target.value)}
                      className="w-full bg-surface-low rounded-xl p-4 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
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
              </Card>
            </motion.div>
          )}
        </div>

        {/* Session Cards */}
        <div className="space-y-4 mb-8">
          {sessions && sessions.length > 0 ? (
            sessions.map((s, i) => (
              <ScrollReveal key={s.id} delay={i * 0.1}>
                <Card padding="lg">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{moodEmojis[s.child_mood || 3] || '😐'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-on-surface">
                            {new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {s.objectives && <Badge variant="primary" size="sm">{s.objectives}</Badge>}
                        </div>
                        {s.child_mood && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className={`w-3 h-3 rounded-full ${n <= (s.child_mood || 0) ? 'gradient-primary' : 'bg-surface-high'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-outline font-medium">{s.child_mood}/5</span>
                          </div>
                        )}
                      </div>
                      {s.observations && <p className="text-sm text-on-surface-variant leading-relaxed">{s.observations}</p>}
                      {s.progress && <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{s.progress}</p>}
                      {s.homework && (
                        <div className="mt-3 bg-secondary-container/30 rounded-xl p-3">
                          <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Recommandations</p>
                          <p className="text-sm text-secondary">{s.homework}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))
          ) : (
            <Card padding="lg">
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">clinical_notes</span>
                <p className="text-sm text-on-surface-variant">Aucune note de séance pour le moment.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Shared Documents */}
        <ScrollReveal>
          <Card padding="lg" className="mb-8">
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">folder_shared</span>
              Documents partages
            </h3>
            <div className="space-y-3">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <motion.a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-surface-low rounded-xl cursor-pointer hover:bg-surface-high transition-colors"
                  >
                    <div className="w-10 h-10 bg-error-container rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-error text-[22px]">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-on-surface block truncate">{doc.file_name}</span>
                      <span className="text-xs text-outline">
                        {doc.document_date ? new Date(doc.document_date).toLocaleDateString('fr-FR') : ''} — {doc.category}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[20px]">download</span>
                  </motion.a>
                ))
              ) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-outline text-[32px] mb-2 block">folder_off</span>
                  <p className="text-sm text-on-surface-variant">Aucun document partage.</p>
                </div>
              )}
            </div>
          </Card>
        </ScrollReveal>

        {/* Chat Section */}
        <ScrollReveal>
          <div className="mb-8">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full flex items-center justify-between p-5 bg-[#4A90D9]/5 border border-[#4A90D9]/15 rounded-2xl cursor-pointer hover:bg-[#4A90D9]/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A90D9]/15 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4A90D9] text-[22px]">chat</span>
                </div>
                <div className="text-left">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-on-surface">Discussion avec la famille</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {messages.length > 0
                      ? `${messages.length} message${messages.length > 1 ? 's' : ''}`
                      : 'Aucun message pour le moment'}
                  </p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-[#4A90D9] text-[24px] transition-transform ${chatOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {chatOpen && (
              <div className="mt-2 border border-[#4A90D9]/15 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                {/* Messages area */}
                <div className="max-h-80 overflow-y-auto p-5 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-outline text-[32px] mb-2 block">forum</span>
                      <p className="text-sm text-on-surface-variant">Aucun message. Commencez la discussion.</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_is_parent ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          msg.sender_is_parent
                            ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            : 'bg-[#4A90D9] text-white rounded-br-sm'
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
                <div className="border-t border-[#4A90D9]/10 p-4 flex items-center gap-3">
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
                    className="flex-1 py-3 px-4 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMsg || !chatInput.trim()}
                    className="w-11 h-11 bg-[#4A90D9] text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* HDS Certification Footer */}
        <div className="py-10 border-t border-outline-variant/15">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-on-surface">Hebergement certifie HDS</p>
                <p className="text-xs text-on-surface-variant">Données de santé protégées — Conformite RGPD</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Chiffrement AES-256
              </span>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">gpp_good</span>
                ISO 27001
              </span>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                HDS
              </span>
            </div>
            <p className="text-[10px] text-outline mt-2">
              Politique de confidentialite &middot; Conditions d&apos;utilisation &middot; Mentions legales
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
