'use client'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, useAppointments, useSessions, usePractitioners, useDocuments } from '@/hooks/useData'

// Demo fallback data
const demoQuickStats = [
  { icon: 'stethoscope', value: '5', label: 'Praticiens', color: 'text-primary' },
  { icon: 'event_note', value: '12', label: 'Seances ce mois', color: 'text-secondary' },
  { icon: 'description', value: '3', label: 'Documents recents', color: 'text-tertiary' },
  { icon: 'schedule', value: '2j', label: 'Prochain RDV', color: 'text-gold' },
]

const demoProchainRDV = [
  { praticien: 'Sophie Martin', specialty: 'Orthophoniste', date: 'Lun 29 Mar — 10h00', color: 'border-primary' },
  { praticien: 'Dr. Marc Morel', specialty: 'Pedopsychiatre', date: 'Mer 31 Mar — 14h30', color: 'border-secondary' },
  { praticien: 'Jean-Luc Petit', specialty: 'Psychomotricien', date: 'Ven 2 Avr — 11h00', color: 'border-tertiary' },
]

const demoDernieresNotes = [
  {
    emoji: '😊',
    praticien: 'Sophie Martin',
    specialty: 'Orthophoniste',
    date: '25 Mar 2026',
    text: 'Progres notables sur les phonemes complexes [s] et [z]. Lucas montre une meilleure concentration pendant les exercices.',
  },
  {
    emoji: '😐',
    praticien: 'Jean-Luc Petit',
    specialty: 'Psychomotricien',
    date: '23 Mar 2026',
    text: 'Seance correcte, quelques difficultes de coordination fine. A retravailler les exercices de motricite.',
  },
]

const actionsRapides = [
  { icon: 'note_add', label: 'Ajouter une note', href: '/dashboard/journal', color: 'bg-primary-fixed text-primary' },
  { icon: 'calendar_add_on', label: 'Nouveau RDV', href: '/dashboard/agenda', color: 'bg-secondary-container text-secondary' },
  { icon: 'chat', label: 'Contacter un praticien', href: '/dashboard/echanges', color: 'bg-tertiary-fixed text-tertiary' },
  { icon: 'menu_book', label: 'Voir le journal', href: '/dashboard/journal', color: 'bg-gold-container text-amber-700' },
]

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

const borderColors = ['border-primary', 'border-secondary', 'border-tertiary', 'border-gold']

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { appointments, loading: appointmentsLoading } = useAppointments(firstChild?.id)
  const { sessions, loading: sessionsLoading } = useSessions(firstChild?.id)
  const { practitioners } = usePractitioners(firstChild?.id)
  const { documents } = useDocuments(firstChild?.id)

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isLoading = authLoading || childrenLoading

  // Derive display name
  const displayName = profile?.full_name?.split(' ')[0] || 'Marie'

  // Derive child info
  const childName = firstChild ? `${firstChild.first_name} ${firstChild.last_name}` : 'Lucas Dupont'
  const childInitials = firstChild ? getInitials(firstChild.first_name, firstChild.last_name) : 'LD'
  const childAge = firstChild?.birth_date ? calculateAge(firstChild.birth_date) : 7
  const childDiagnoses = firstChild?.diagnosis_primary
    ? [firstChild.diagnosis_primary, ...(firstChild.diagnosis_secondary || [])]
    : ['TDAH', 'Dyslexie']

  // Derive upcoming appointments
  const now = new Date().toISOString()
  const upcomingAppointments = appointments.filter(a => a.datetime_start >= now && a.status !== 'annule')
  const hasRealAppointments = upcomingAppointments.length > 0

  const prochainRDV = hasRealAppointments
    ? upcomingAppointments.slice(0, 3).map((a, i) => {
        const d = new Date(a.datetime_start)
        const dateFormatted = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
        const timeFormatted = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        const pract = (a as Record<string, unknown>).practitioners as { first_name?: string; last_name?: string; specialty?: string } | undefined
        return {
          praticien: pract ? `${pract.first_name || ''} ${pract.last_name || ''}`.trim() : a.title,
          specialty: pract?.specialty || '',
          date: `${dateFormatted} — ${timeFormatted}`,
          color: borderColors[i % borderColors.length],
        }
      })
    : demoProchainRDV

  // Derive latest session notes
  const hasRealSessions = sessions.length > 0
  const dernieresNotes = hasRealSessions
    ? sessions.slice(0, 2).map(s => ({
        emoji: moodEmojis[s.child_mood || 3] || '😐',
        praticien: '',
        specialty: '',
        date: new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        text: s.observations || s.progress || s.objectives || 'Aucune note pour cette seance.',
      }))
    : demoDernieresNotes

  // Derive quick stats
  const nextAppointment = upcomingAppointments[0]
  const daysUntilNext = nextAppointment
    ? Math.max(0, Math.ceil((new Date(nextAppointment.datetime_start).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.session_date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const quickStats = (firstChild && (practitioners.length > 0 || sessions.length > 0 || documents.length > 0))
    ? [
        { icon: 'stethoscope', value: String(practitioners.length), label: 'Praticiens', color: 'text-primary' },
        { icon: 'event_note', value: String(sessionsThisMonth.length), label: 'Seances ce mois', color: 'text-secondary' },
        { icon: 'description', value: String(documents.length), label: 'Documents recents', color: 'text-tertiary' },
        { icon: 'schedule', value: daysUntilNext !== null ? `${daysUntilNext}j` : '--', label: 'Prochain RDV', color: 'text-gold' },
      ]
    : demoQuickStats

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Welcome Hero */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary/5 to-tertiary/5" />
          <div className="relative px-4 sm:px-8 py-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-on-surface-variant capitalize mb-1">{dateStr}</p>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface">
                Bonjour {displayName} <span className="inline-block animate-[float_3s_ease-in-out_infinite]">&#x1F44B;</span>
              </h1>
              <p className="text-on-surface-variant mt-2 text-base">Voici le recapitulatif du parcours de {firstChild?.first_name || 'Lucas'}.</p>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* Child Card */}
      <ScrollReveal delay={0.05}>
        <Card padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg shadow-primary/15 shrink-0">
                {childInitials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-bold text-on-surface">{childName}</h2>
                <p className="text-sm text-on-surface-variant mb-2">{childAge} ans</p>
                <div className="flex flex-wrap gap-2">
                  {childDiagnoses.map((d, i) => (
                    <Badge key={i} variant={i === 0 ? 'primary' : 'secondary'}>{d}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/dashboard/enfant" className="shrink-0 block sm:inline-block">
              <Button variant="outline" size="sm" iconRight="arrow_forward" className="w-full sm:w-auto">Voir le profil complet</Button>
            </Link>
          </div>
        </Card>
      </ScrollReveal>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {quickStats.map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <Card padding="sm" className="text-center">
              <span className={`material-symbols-outlined ${stat.color} text-[24px] mb-1 block`}>{stat.icon}</span>
              <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-on-surface">{stat.value}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{stat.label}</p>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Prochains RDV */}
        <ScrollReveal delay={0.1}>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
              Prochains rendez-vous
            </h2>
            <div className="space-y-3">
              {prochainRDV.map((rdv, i) => (
                <Card key={i} padding="sm" className={`border-l-4 ${rdv.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{rdv.praticien}</p>
                      <p className="text-xs text-on-surface-variant">{rdv.specialty}</p>
                    </div>
                    <Badge variant="outline" size="sm">{rdv.date}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Dernieres Notes */}
        <ScrollReveal delay={0.15}>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">clinical_notes</span>
              Dernieres notes de seance
            </h2>
            <div className="space-y-3">
              {dernieresNotes.map((note, i) => (
                <Card key={i} padding="md">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{note.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-on-surface text-sm">{note.praticien}</p>
                        {note.specialty && <Badge variant="outline" size="sm">{note.specialty}</Badge>}
                      </div>
                      <p className="text-xs text-outline mb-2">{note.date}</p>
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{note.text}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Journal du jour */}
      <ScrollReveal delay={0.2}>
        <Card padding="lg" className="mb-8 border border-secondary/20">
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">self_improvement</span>
            Journal du jour
          </h2>
          <p className="text-sm text-on-surface-variant mb-5">Comment se sent {firstChild?.first_name || 'Lucas'} aujourd&apos;hui ?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {/* Humeur */}
            <div>
              <p className="text-xs text-outline uppercase tracking-wider mb-2 text-center">Humeur</p>
              <div className="flex justify-center gap-2">
                {['😢', '😐', '😊', '😄', '🤩'].map((emoji, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-xl cursor-pointer hover:bg-surface-low rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Sommeil */}
            <div>
              <p className="text-xs text-outline uppercase tracking-wider mb-2 text-center">Sommeil</p>
              <div className="flex justify-center gap-2">
                {['😴', '😪', '😊', '😁', '🌟'].map((emoji, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-xl cursor-pointer hover:bg-surface-low rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Energie */}
            <div>
              <p className="text-xs text-outline uppercase tracking-wider mb-2 text-center">Energie</p>
              <div className="flex justify-center gap-2">
                {['🔋', '⚡', '💪', '🚀', '✨'].map((emoji, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-xl cursor-pointer hover:bg-surface-low rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link href="/dashboard/journal">
              <Button variant="ghost" size="sm" iconRight="arrow_forward">Ouvrir le journal complet</Button>
            </Link>
          </div>
        </Card>
      </ScrollReveal>

      {/* Actions Rapides */}
      <ScrollReveal delay={0.25}>
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {actionsRapides.map((action, i) => (
            <Link key={i} href={action.href}>
              <Card padding="md" className="text-center h-full">
                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">{action.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </DashboardLayout>
  )
}
