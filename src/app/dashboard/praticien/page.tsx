'use client'
import { motion } from 'framer-motion'
import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, usePractitioners, useSessions, useDocuments, useAppointments, useShareLinks } from '@/hooks/useData'

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function PraticienDetailPage() {
  return (
    <Suspense fallback={
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <PraticienDetailContent />
    </Suspense>
  )
}

function PraticienDetailContent() {
  const searchParams = useSearchParams()
  const practitionerIdParam = searchParams.get('id')

  const { loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { practitioners, loading: practLoading } = usePractitioners(firstChild?.id)
  const { sessions, loading: sessionsLoading } = useSessions(firstChild?.id, practitionerIdParam || undefined)
  const { documents: allDocuments, loading: docsLoading } = useDocuments(firstChild?.id)
  const { appointments } = useAppointments(firstChild?.id)
  const { shareLinks, create: createShareLink } = useShareLinks(firstChild?.id)

  const [filter, setFilter] = useState('6')
  const [linkGenerated, setLinkGenerated] = useState(false)

  // Find the selected practitioner
  const practitioner = useMemo(() => {
    if (practitionerIdParam) return practitioners.find(p => p.id === practitionerIdParam)
    return practitioners[0] || null
  }, [practitioners, practitionerIdParam])

  const practName = practitioner ? `${practitioner.first_name} ${practitioner.last_name}` : '—'
  const practInitials = practitioner ? getInitials(practitioner.first_name, practitioner.last_name) : '??'

  // Filter sessions by time
  const filteredSessions = useMemo(() => {
    if (!sessions.length) return []
    const now = new Date()
    const months = parseInt(filter)
    if (isNaN(months)) return sessions
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    return sessions.filter(s => new Date(s.session_date) >= cutoff)
  }, [sessions, filter])

  // Practitioner appointments
  const practAppointments = useMemo(() => {
    if (!practitioner) return []
    return appointments.filter(a => a.practitioner_id === practitioner.id)
  }, [appointments, practitioner])

  // Documents (no practitioner_id filter if not set on docs)
  const practDocuments = useMemo(() => {
    if (!practitioner) return []
    return allDocuments.filter(d => d.practitioner_id === practitioner.id || !d.practitioner_id)
  }, [allDocuments, practitioner])

  // Stats
  const totalSessions = sessions.length
  const now = new Date()
  const lastSession = sessions[0]
  const lastSessionDate = lastSession ? new Date(lastSession.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '--'
  const nextAppt = practAppointments.find(a => a.datetime_start >= now.toISOString() && a.status !== 'annule')
  const nextApptDate = nextAppt ? new Date(nextAppt.datetime_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '--'

  // Frequency calc
  let frequency = '--'
  if (sessions.length >= 2) {
    const dates = sessions.map(s => new Date(s.session_date).getTime()).sort((a, b) => b - a)
    const diffs = dates.slice(0, -1).map((d, i) => d - dates[i + 1])
    const avgDays = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length / (1000 * 60 * 60 * 24))
    if (avgDays <= 10) frequency = '1x/sem'
    else if (avgDays <= 18) frequency = '2x/mois'
    else if (avgDays <= 40) frequency = '1x/mois'
    else frequency = `~${avgDays}j`
  } else if (practitioner?.follow_up_frequency) {
    frequency = practitioner.follow_up_frequency
  }

  // Evolution data (monthly averages from sessions)
  const evolutionData = useMemo(() => {
    if (!sessions.length) return []
    const months: Record<string, { total: number; count: number }> = {}
    sessions.forEach(s => {
      const d = new Date(s.session_date)
      const key = d.toLocaleDateString('fr-FR', { month: 'short' })
      if (!months[key]) months[key] = { total: 0, count: 0 }
      months[key].total += s.child_mood || 3
      months[key].count++
    })
    return Object.entries(months).reverse().slice(-7).map(([month, v]) => ({
      month,
      value: Math.round((v.total / v.count) * 10) / 10,
      label: `${(v.total / v.count).toFixed(1)}/5`,
    }))
  }, [sessions])

  const stats = [
    { icon: 'event_repeat', label: 'Seances totales', value: String(totalSessions), color: 'text-primary' },
    { icon: 'timer', label: 'Frequence', value: frequency, color: 'text-secondary' },
    { icon: 'history', label: 'Derniere seance', value: lastSessionDate, color: 'text-tertiary' },
    { icon: 'event_upcoming', label: 'Prochaine', value: nextApptDate, color: 'text-gold' },
  ]

  const handleGenerateLink = async () => {
    if (!practitioner || !createShareLink) return
    await createShareLink(practitioner.id)
    setLinkGenerated(true)
    setTimeout(() => setLinkGenerated(false), 3000)
  }

  const isLoading = authLoading || childrenLoading || practLoading

  if (isLoading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!practitioner) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-3 block">person_off</span>
            <p className="text-on-surface-variant">Aucun praticien trouve.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: 'Praticiens', href: '/dashboard/enfant' }, { label: practName, href: '#' }]}>

      {/* Practitioner Hero */}
      <ScrollReveal>
        <Card padding="lg" className="mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/8 to-transparent rounded-bl-full" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-secondary-container rounded-2xl flex items-center justify-center text-3xl font-bold text-secondary shadow-lg shadow-secondary/10">
                {practInitials}
              </div>
              {practitioner.status === 'actif' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full border-3 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[12px]">check</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-extrabold text-on-surface">{practName}</h1>
              </div>
              <Badge variant="secondary" size="md" icon="record_voice_over">{practitioner.specialty}</Badge>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-on-surface-variant">
                {practitioner.phone && (
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">call</span>
                    {practitioner.phone}
                  </p>
                )}
                {practitioner.email && (
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                    {practitioner.email}
                  </p>
                )}
                {practitioner.address && (
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                    {practitioner.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end shrink-0">
              {practitioner.follow_up_frequency && (
                <Badge variant="primary" icon="event_repeat">Suivi {practitioner.follow_up_frequency}</Badge>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" icon="link" onClick={handleGenerateLink}>
                  {linkGenerated ? 'Lien cree !' : 'Generer un lien'}
                </Button>
                <Button variant="outline" size="sm" icon="edit">Modifier</Button>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <Card className="text-center" padding="md">
              <span className={`material-symbols-outlined ${s.color} text-[22px] mb-1 block`}>{s.icon}</span>
              <p className="font-[family-name:var(--font-heading)] font-bold text-xl text-on-surface">{s.value}</p>
              <p className="text-[10px] text-outline uppercase tracking-wider mt-0.5">{s.label}</p>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Evolution Chart */}
      {evolutionData.length > 0 && (
        <ScrollReveal>
          <Card padding="lg" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg">Evolution</h3>
                <p className="text-sm text-on-surface-variant">Progression des seances sur {evolutionData.length} mois</p>
              </div>
            </div>
            <div className="h-48 flex items-end gap-3 px-2">
              {evolutionData.map((d, i) => (
                <div key={i} className="flex-1 relative group">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(d.value / 5) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="gradient-primary rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      {d.label}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[11px] text-outline font-medium">
              {evolutionData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* Session Notes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">clinical_notes</span>
            Notes de seances
          </h3>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm bg-surface-low rounded-xl px-4 py-2.5 outline-none cursor-pointer border border-outline-variant/20"
          >
            <option value="6">6 derniers mois</option>
            <option value="3">3 derniers mois</option>
            <option value="all">Toutes</option>
          </select>
        </div>
        <div className="space-y-4">
          {sessionsLoading ? (
            <Card padding="lg">
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant">Chargement...</p>
              </div>
            </Card>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((s, i) => (
              <ScrollReveal key={s.id} delay={i * 0.1}>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{moodEmojis[s.child_mood || 3] || '😐'}</span>
                      <div>
                        <p className="font-semibold text-on-surface">
                          {new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <Badge variant={s.created_by_parent ? 'tertiary' : 'primary'} size="sm">
                          {s.created_by_parent ? 'Note parent' : 'Note praticien'}
                        </Badge>
                      </div>
                    </div>
                    {s.child_mood && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-outline">Progression</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className={`w-3 h-3 rounded-full transition-colors ${n <= (s.child_mood || 0) ? 'gradient-primary' : 'bg-surface-high'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {s.observations && <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{s.observations}</p>}
                  {s.objectives && (
                    <div className="bg-primary-fixed/20 rounded-xl p-4 mb-3">
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Objectifs travailles</p>
                      <p className="text-sm text-primary">{s.objectives}</p>
                    </div>
                  )}
                  {s.homework && (
                    <div className="bg-secondary-container/30 rounded-xl p-4">
                      <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Recommandations</p>
                      <p className="text-sm text-secondary">{s.homework}</p>
                    </div>
                  )}
                </Card>
              </ScrollReveal>
            ))
          ) : (
            <Card padding="lg">
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">clinical_notes</span>
                <p className="text-sm text-on-surface-variant">Aucune note de seance pour cette periode.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Documents */}
      <ScrollReveal>
        <Card padding="lg">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">folder_open</span>
            Documents partages
          </h3>
          <div className="space-y-3">
            {docsLoading ? (
              <div className="text-center py-6">
                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              </div>
            ) : practDocuments.length > 0 ? (
              practDocuments.map((doc) => (
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
                    <p className="text-sm font-medium text-on-surface truncate">{doc.file_name}</p>
                    <p className="text-xs text-outline">
                      {doc.document_date ? new Date(doc.document_date).toLocaleDateString('fr-FR') : ''} — {doc.category}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[20px]">download</span>
                </motion.a>
              ))
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-outline text-[32px] mb-2 block">folder_off</span>
                <p className="text-sm text-on-surface-variant">Aucun document pour ce praticien.</p>
              </div>
            )}
          </div>
        </Card>
      </ScrollReveal>
    </DashboardLayout>
  )
}
