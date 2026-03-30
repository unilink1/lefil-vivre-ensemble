'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useAppointments, useSessions, usePractitioners, useDocuments } from '@/hooks/useData'
import { useSelectedChild } from '@/hooks/useSelectedChild'

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

const borderAccents = [
  'border-l-[#4A90D9]',
  'border-l-[#7EC8B0]',
  'border-l-[#E8A87C]',
  'border-l-[#4A90D9]',
]

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

const moodOptions = [
  { emoji: '😢', label: 'Triste', value: 1 },
  { emoji: '😟', label: 'Inquiet', value: 2 },
  { emoji: '😐', label: 'Neutre', value: 3 },
  { emoji: '😊', label: 'Bien', value: 4 },
  { emoji: '😄', label: 'Super', value: 5 },
]

const sleepOptions = [
  { emoji: '😴', label: 'Mauvais', value: 1 },
  { emoji: '😪', label: 'Moyen', value: 2 },
  { emoji: '😊', label: 'Correct', value: 3 },
  { emoji: '😁', label: 'Bon', value: 4 },
  { emoji: '🌟', label: 'Parfait', value: 5 },
]

const energyOptions = [
  { emoji: '🔋', label: 'Faible', value: 1 },
  { emoji: '⚡', label: 'Moyen', value: 2 },
  { emoji: '💪', label: 'Bon', value: 3 },
  { emoji: '🚀', label: 'Fort', value: 4 },
  { emoji: '✨', label: 'Max', value: 5 },
]

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const { selectedChild: firstChild, loading: childrenLoading } = useSelectedChild()
  const { appointments, loading: appointmentsLoading } = useAppointments(firstChild?.id)
  const { sessions, loading: sessionsLoading } = useSessions(firstChild?.id)
  const { practitioners } = usePractitioners(firstChild?.id)
  const { documents } = useDocuments(firstChild?.id)

  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [selectedSleep, setSelectedSleep] = useState<number | null>(null)
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null)

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const isLoading = authLoading || childrenLoading

  // Derive display name
  const displayName = profile?.full_name?.split(' ')[0] || 'vous'

  // Derive child info
  const childName = firstChild
    ? `${firstChild.first_name}${firstChild.last_name ? ' ' + firstChild.last_name : ''}`.trim()
    : null
  const childInitials = firstChild ? getInitials(firstChild.first_name, firstChild.last_name) : '?'
  const childAge = firstChild?.birth_date ? calculateAge(firstChild.birth_date) : null
  const childDiagnoses = firstChild?.diagnosis_primary
    ? [firstChild.diagnosis_primary, ...(firstChild.diagnosis_secondary || [])]
    : []

  // Derive upcoming appointments
  const now = new Date().toISOString()
  const upcomingAppointments = appointments.filter(
    (a) => a.datetime_start >= now && a.status !== 'annule'
  )

  const prochainRDV = upcomingAppointments.slice(0, 3).map((a, i) => {
    const d = new Date(a.datetime_start)
    const dateFormatted = d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    const timeFormatted = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const pract = (a as Record<string, unknown>).practitioners as
      | { first_name?: string; last_name?: string; specialty?: string }
      | undefined
    return {
      praticien: pract
        ? `${pract.first_name || ''} ${pract.last_name || ''}`.trim()
        : a.title,
      specialty: pract?.specialty || '',
      date: `${dateFormatted} — ${timeFormatted}`,
      borderColor: borderAccents[i % borderAccents.length],
    }
  })

  // Derive latest session notes
  const dernieresNotes = sessions.slice(0, 2).map((s) => ({
    emoji: moodEmojis[s.child_mood || 3] || '😐',
    praticien: '',
    specialty: '',
    date: new Date(s.session_date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    text:
      s.observations || s.progress || s.objectives || 'Aucune note pour cette seance.',
  }))

  // Derive quick stats
  const nextAppointment = upcomingAppointments[0]
  const daysUntilNext = nextAppointment
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextAppointment.datetime_start).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const sessionsThisMonth = sessions.filter((s) => {
    const d = new Date(s.session_date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const quickStats = [
    {
      icon: 'stethoscope',
      value: String(practitioners.length),
      label: 'Praticiens',
      gradient: 'from-[#4A90D9]/10 to-[#4A90D9]/5',
      iconColor: 'text-[#4A90D9]',
      valueColor: 'text-[#4A90D9]',
    },
    {
      icon: 'event_note',
      value: String(sessionsThisMonth.length),
      label: 'Seances ce mois',
      gradient: 'from-[#7EC8B0]/10 to-[#7EC8B0]/5',
      iconColor: 'text-[#7EC8B0]',
      valueColor: 'text-[#7EC8B0]',
    },
    {
      icon: 'description',
      value: String(documents.length),
      label: 'Documents',
      gradient: 'from-[#E8A87C]/10 to-[#E8A87C]/5',
      iconColor: 'text-[#E8A87C]',
      valueColor: 'text-[#E8A87C]',
    },
    {
      icon: 'schedule',
      value: daysUntilNext !== null ? `${daysUntilNext}j` : '--',
      label: 'Prochain RDV',
      gradient: 'from-[#4A90D9]/10 to-[#7EC8B0]/5',
      iconColor: 'text-[#4A90D9]',
      valueColor: 'text-[#4A90D9]',
    },
  ]

  const quickActions = [
    {
      icon: 'note_add',
      label: 'Ajouter une note',
      href: '/dashboard/journal',
      bg: 'bg-[#4A90D9]/8 hover:bg-[#4A90D9]/15',
      iconColor: 'text-[#4A90D9]',
    },
    {
      icon: 'calendar_add_on',
      label: 'Nouveau RDV',
      href: '/dashboard/agenda',
      bg: 'bg-[#7EC8B0]/8 hover:bg-[#7EC8B0]/15',
      iconColor: 'text-[#7EC8B0]',
    },
    {
      icon: 'chat',
      label: 'Contacter un praticien',
      href: '/dashboard/echanges',
      bg: 'bg-[#E8A87C]/8 hover:bg-[#E8A87C]/15',
      iconColor: 'text-[#E8A87C]',
    },
    {
      icon: 'menu_book',
      label: 'Voir le journal',
      href: '/dashboard/journal',
      bg: 'bg-[#4A90D9]/8 hover:bg-[#4A90D9]/15',
      iconColor: 'text-[#4A90D9]',
    },
  ]

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#4A90D9] animate-spin" />
            </div>
            <p className="text-gray-400 text-sm font-medium tracking-wide">
              Chargement de votre espace...
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Keyframe animations injected via style tag */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes staggerFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes meshMove1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(5%, -8%) scale(1.1); }
          66% { transform: translate(-3%, 5%) scale(0.95); }
        }
        @keyframes meshMove2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-6%, 6%) scale(1.05); }
          66% { transform: translate(4%, -4%) scale(1.1); }
        }
        @keyframes meshMove3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(3%, 4%) scale(1.08); }
        }
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74, 144, 217, 0); }
          50% { box-shadow: 0 0 20px 2px rgba(74, 144, 217, 0.08); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out both;
        }
        .animate-stagger-1 { animation: staggerFadeIn 0.5s ease-out 0.1s both; }
        .animate-stagger-2 { animation: staggerFadeIn 0.5s ease-out 0.2s both; }
        .animate-stagger-3 { animation: staggerFadeIn 0.5s ease-out 0.3s both; }
        .animate-stagger-4 { animation: staggerFadeIn 0.5s ease-out 0.4s both; }
        .animate-subtleBounce {
          animation: subtleBounce 2s ease-in-out infinite;
        }
        .mesh-blob-1 {
          animation: meshMove1 8s ease-in-out infinite;
        }
        .mesh-blob-2 {
          animation: meshMove2 10s ease-in-out infinite;
        }
        .mesh-blob-3 {
          animation: meshMove3 12s ease-in-out infinite;
        }
        .appointment-glow-blue:hover {
          box-shadow: -4px 0 16px -4px rgba(74, 144, 217, 0.25), 0 4px 12px -2px rgba(0,0,0,0.04);
        }
        .appointment-glow-green:hover {
          box-shadow: -4px 0 16px -4px rgba(126, 200, 176, 0.25), 0 4px 12px -2px rgba(0,0,0,0.04);
        }
        .appointment-glow-orange:hover {
          box-shadow: -4px 0 16px -4px rgba(232, 168, 124, 0.25), 0 4px 12px -2px rgba(0,0,0,0.04);
        }
      `}</style>

      <div className="max-w-6xl mx-auto animate-fadeInUp">
        {/* ── Welcome Hero ── */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl mb-8 bg-white border border-gray-100 shadow-sm">
            {/* Animated gradient mesh background */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="mesh-blob-1 absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(74, 144, 217, 0.12) 0%, transparent 70%)',
                }}
              />
              <div
                className="mesh-blob-2 absolute -bottom-1/4 -right-1/4 w-[55%] h-[55%] rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(126, 200, 176, 0.1) 0%, transparent 70%)',
                }}
              />
              <div
                className="mesh-blob-3 absolute top-1/3 left-1/3 w-[40%] h-[40%] rounded-full opacity-50"
                style={{
                  background: 'radial-gradient(circle, rgba(232, 168, 124, 0.08) 0%, transparent 70%)',
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/6 via-[#7EC8B0]/4 to-[#E8A87C]/3" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#4A90D9]/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#7EC8B0]/6 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="relative px-6 sm:px-10 py-8 sm:py-12">
              <p className="text-sm text-gray-400 capitalize mb-2 tracking-wide font-medium">
                {dateStr}
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Bonjour {displayName}{' '}
                <span className="inline-block animate-[float_3s_ease-in-out_infinite]">
                  &#x1F44B;
                </span>
              </h1>
              <p className="text-gray-500 mt-3 text-base sm:text-lg max-w-xl leading-relaxed">
                {firstChild
                  ? `Voici le recapitulatif du parcours de ${firstChild.first_name}.`
                  : 'Bienvenue dans votre espace de coordination.'}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Selected Child Card ── */}
        <ScrollReveal delay={0.05}>
          <div className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm rounded-2xl p-6 sm:p-8 mb-8 transition-all duration-300 hover:shadow-lg hover:shadow-[#4A90D9]/5 hover:border-[#4A90D9]/15"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.6)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-[#4A90D9]/20 shrink-0 transition-all duration-300 hover:shadow-xl hover:shadow-[#4A90D9]/30 hover:scale-105">
                  {childInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {childName || 'Aucun enfant enregistre'}
                  </h2>
                  {childAge !== null && (
                    <p className="text-sm text-gray-400 font-medium mb-3">
                      {childAge} ans
                    </p>
                  )}
                  {childDiagnoses.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {childDiagnoses.map((d, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105 ${
                            i === 0
                              ? 'bg-[#4A90D9]/10 text-[#4A90D9]'
                              : 'bg-[#7EC8B0]/10 text-[#5BA893]'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Link href="/dashboard/enfant" className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  iconRight="arrow_forward"
                  className="w-full sm:w-auto"
                >
                  Voir le profil complet
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {quickStats.map((stat, i) => (
            <ScrollReveal key={i} delay={0.06 + i * 0.05}>
              <div className={`bg-gradient-to-br ${stat.gradient} border border-gray-100/80 rounded-2xl p-5 sm:p-6 text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-stagger-${i + 1}`}
                style={{
                  background: `linear-gradient(135deg, white 0%, white 60%, var(--tw-gradient-stops))`,
                }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <span
                    className={`material-symbols-outlined ${stat.iconColor} text-[22px]`}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p
                  className={`font-[family-name:var(--font-heading)] font-extrabold text-3xl ${stat.valueColor} mb-1 transition-all duration-300 group-hover:scale-105`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Two Columns: Appointments + Session Notes ── */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Upcoming Appointments */}
          <ScrollReveal delay={0.1}>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 h-full transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4A90D9] text-[20px]">
                      calendar_month
                    </span>
                  </span>
                  Prochains rendez-vous
                </h2>
                {prochainRDV.length > 0 && (
                  <Link
                    href="/dashboard/agenda"
                    className="text-xs text-[#4A90D9] font-semibold hover:underline transition-all duration-300"
                  >
                    Tout voir
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {prochainRDV.length > 0 ? (
                  prochainRDV.map((rdv, i) => (
                    <div
                      key={i}
                      className={`border border-gray-100 rounded-xl p-4 border-l-[3px] ${rdv.borderColor} hover:bg-gray-50/50 transition-all duration-300 hover:-translate-x-0.5 ${
                        i === 0
                          ? 'appointment-glow-blue'
                          : i === 1
                          ? 'appointment-glow-green'
                          : 'appointment-glow-orange'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {rdv.praticien}
                          </p>
                          {rdv.specialty && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {rdv.specialty}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg transition-all duration-300">
                          {rdv.date}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-[32px]">
                        event_busy
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium mb-2">
                      Aucun rendez-vous a venir
                    </p>
                    <Link
                      href="/dashboard/agenda"
                      className="inline-flex items-center gap-1.5 text-xs text-[#4A90D9] font-semibold hover:underline transition-all duration-300"
                    >
                      Planifier un rendez-vous
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Latest Session Notes */}
          <ScrollReveal delay={0.15}>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 h-full transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#7EC8B0]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#7EC8B0] text-[20px]">
                      clinical_notes
                    </span>
                  </span>
                  Dernieres notes de seance
                </h2>
                {dernieresNotes.length > 0 && (
                  <Link
                    href="/dashboard/seances"
                    className="text-xs text-[#7EC8B0] font-semibold hover:underline transition-all duration-300"
                  >
                    Tout voir
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {dernieresNotes.length > 0 ? (
                  dernieresNotes.map((note, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 mt-0.5 animate-subtleBounce" style={{ animationDelay: `${i * 0.3}s` }}>{note.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {note.praticien && (
                              <p className="font-semibold text-gray-900 text-sm">
                                {note.praticien}
                              </p>
                            )}
                            {note.specialty && (
                              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                {note.specialty}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300 font-medium mb-2">
                            {note.date}
                          </p>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {note.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-gray-300 text-[32px]">
                        clinical_notes
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      Aucune note de seance
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Daily Journal / Mood Selector ── */}
        <ScrollReveal delay={0.2}>
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 mb-8 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-9 h-9 rounded-xl bg-[#E8A87C]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#E8A87C] text-[20px]">
                  self_improvement
                </span>
              </span>
              <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-gray-900">
                Journal du jour
              </h2>
            </div>
            <p className="text-sm text-gray-400 mb-6 ml-12">
              Comment se sent {firstChild?.first_name || 'votre enfant'} aujourd&apos;hui
              ?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              {/* Mood */}
              <div className="text-center">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">
                  Humeur
                </p>
                <div className="flex justify-center gap-1.5">
                  {moodOptions.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSelectedMood(item.value)}
                      className={`text-2xl cursor-pointer rounded-xl p-2 transition-all duration-300 ${
                        selectedMood === item.value
                          ? 'bg-[#4A90D9]/10 scale-125 ring-2 ring-[#4A90D9]/40 shadow-lg shadow-[#4A90D9]/15'
                          : 'hover:bg-gray-50 hover:scale-110'
                      }`}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep */}
              <div className="text-center">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">
                  Sommeil
                </p>
                <div className="flex justify-center gap-1.5">
                  {sleepOptions.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSelectedSleep(item.value)}
                      className={`text-2xl cursor-pointer rounded-xl p-2 transition-all duration-300 ${
                        selectedSleep === item.value
                          ? 'bg-[#7EC8B0]/10 scale-125 ring-2 ring-[#7EC8B0]/40 shadow-lg shadow-[#7EC8B0]/15'
                          : 'hover:bg-gray-50 hover:scale-110'
                      }`}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div className="text-center">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">
                  Energie
                </p>
                <div className="flex justify-center gap-1.5">
                  {energyOptions.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setSelectedEnergy(item.value)}
                      className={`text-2xl cursor-pointer rounded-xl p-2 transition-all duration-300 ${
                        selectedEnergy === item.value
                          ? 'bg-[#E8A87C]/10 scale-125 ring-2 ring-[#E8A87C]/40 shadow-lg shadow-[#E8A87C]/15'
                          : 'hover:bg-gray-50 hover:scale-110'
                      }`}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-gray-50">
              <Link href="/dashboard/journal">
                <Button variant="ghost" size="sm" iconRight="arrow_forward">
                  Ouvrir le journal complet
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Quick Actions ── */}
        <ScrollReveal delay={0.25}>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-gray-900 mb-5">
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-6 text-center group hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 h-full animate-stagger-${i + 1}`}>
                  <div
                    className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300`}
                  >
                    <span
                      className={`material-symbols-outlined ${action.iconColor} text-[26px] transition-all duration-300 group-hover:scale-125`}
                    >
                      {action.icon}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {action.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
