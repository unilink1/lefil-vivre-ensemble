'use client'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, useAppointments } from '@/hooks/useData'

const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const demoRdvDots: Record<number, string[]> = {
  3: ['bg-primary'], 7: ['bg-primary', 'bg-purple-500'], 10: ['bg-secondary'],
  14: ['bg-primary'], 17: ['bg-tertiary'], 21: ['bg-primary', 'bg-secondary'],
  24: ['bg-purple-500'], 28: ['bg-primary'],
}

const legend = [
  { color: 'bg-primary', label: 'Orthophoniste' },
  { color: 'bg-secondary', label: 'Psychomotricien' },
  { color: 'bg-tertiary', label: 'Ergotherapeute' },
  { color: 'bg-purple-500', label: 'Pedopsychiatre' },
  { color: 'bg-orange-500', label: 'Neuropediatre' },
]

const statusLabels: Record<string, { label: string; variant: 'primary' | 'secondary' | 'gold' | 'error' }> = {
  confirme: { label: 'Confirme', variant: 'secondary' },
  planifie: { label: 'A confirmer', variant: 'gold' },
  annule: { label: 'Annule', variant: 'error' },
  termine: { label: 'Termine', variant: 'primary' },
}

const borderColorMap: Record<string, string> = {
  'Orthophoniste': 'border-primary',
  'Psychomotricien': 'border-secondary',
  'Ergotherapeute': 'border-tertiary',
  'Pedopsychiatre': 'border-purple-500',
}

const bgColorMap: Record<string, string> = {
  'Orthophoniste': 'bg-primary-fixed/15',
  'Psychomotricien': 'bg-secondary-container/15',
  'Ergotherapeute': 'bg-tertiary-fixed/15',
  'Pedopsychiatre': 'bg-purple-50',
}

export default function AgendaPage() {
  const { loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { appointments, loading: apptLoading } = useAppointments(firstChild?.id)

  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [view, setView] = useState<'Mois' | 'Semaine' | 'Liste'>('Mois')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const hasAppointments = appointments.length > 0

  // Calendar generation
  const moisLabel = new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const moisCapitalized = moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1)

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday-based
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  // Map appointments to calendar dots by day
  const rdvDots = useMemo(() => {
    if (!hasAppointments) return demoRdvDots
    const dots: Record<number, string[]> = {}
    appointments.forEach(a => {
      const d = new Date(a.datetime_start)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate()
        const pract = (a as Record<string, unknown>).practitioners as { specialty?: string } | undefined
        const specialty = pract?.specialty || ''
        let color = 'bg-primary'
        if (specialty.toLowerCase().includes('psycho')) color = 'bg-secondary'
        else if (specialty.toLowerCase().includes('ergo')) color = 'bg-tertiary'
        else if (specialty.toLowerCase().includes('pedo') || specialty.toLowerCase().includes('psychiatr')) color = 'bg-purple-500'
        else if (specialty.toLowerCase().includes('neuro')) color = 'bg-orange-500'
        if (!dots[day]) dots[day] = []
        if (!dots[day].includes(color)) dots[day].push(color)
      }
    })
    return Object.keys(dots).length > 0 ? dots : demoRdvDots
  }, [appointments, hasAppointments, currentMonth, currentYear])

  // Appointments for the selected day
  const selectedDayAppointments = useMemo(() => {
    if (!hasAppointments) return null
    return appointments.filter(a => {
      const d = new Date(a.datetime_start)
      return d.getDate() === selectedDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }, [appointments, hasAppointments, selectedDay, currentMonth, currentYear])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const isLoading = authLoading || childrenLoading

  if (isLoading) {
    return (
      <DashboardLayout title="Agenda" breadcrumb={[{ label: 'Suivi de parcours', href: '/dashboard/profil' }]}>
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
    <DashboardLayout title={`Agenda de ${firstChild?.first_name || 'votre enfant'}`} breadcrumb={[{ label: 'Suivi de parcours', href: '/dashboard/profil' }]}>
      {/* View Toggles */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 bg-surface-low rounded-xl p-1">
          {(['Mois', 'Semaine', 'Liste'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === v ? 'gradient-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-high'
              }`}
            >{v}</button>
          ))}
        </div>
        <Button size="sm" icon="add">Nouveau rendez-vous</Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Calendar */}
        <ScrollReveal>
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <motion.button whileHover={{ scale: 1.1 }} onClick={prevMonth} className="p-2 hover:bg-surface-low rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
              </motion.button>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">{moisCapitalized}</h3>
              <motion.button whileHover={{ scale: 1.1 }} onClick={nextMonth} className="p-2 hover:bg-surface-low rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </motion.button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {jours.map(j => (
                <div key={j} className="text-center text-xs font-medium text-outline uppercase tracking-wider py-2">{j}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {cells.map((day, i) => (
                <motion.button
                  key={i}
                  whileHover={day ? { scale: 1.08 } : undefined}
                  whileTap={day ? { scale: 0.95 } : undefined}
                  onClick={() => day && setSelectedDay(day)}
                  disabled={!day}
                  className={`aspect-square min-h-[40px] sm:min-h-0 rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    !day ? '' :
                    selectedDay === day
                      ? 'bg-primary-fixed ring-2 ring-primary shadow-md'
                      : 'hover:bg-surface-low'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-medium ${selectedDay === day ? 'text-primary font-bold' : 'text-on-surface'}`}>{day}</span>
                      {rdvDots[day] && (
                        <div className="flex gap-0.5 mt-0.5">
                          {rdvDots[day].map((color, j) => (
                            <div key={j} className={`w-1.5 h-1.5 rounded-full ${color}`} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-outline-variant/10">
              {legend.map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-xs text-on-surface-variant">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </ScrollReveal>

        {/* Day Detail */}
        <ScrollReveal delay={0.15}>
          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-1">
                {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>

              {apptLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant">Chargement...</p>
                </div>
              ) : selectedDayAppointments && selectedDayAppointments.length > 0 ? (
                <>
                  <p className="text-sm text-on-surface-variant mb-6">{selectedDayAppointments.length} rendez-vous</p>
                  <div className="space-y-4">
                    {selectedDayAppointments.map((appt) => {
                      const pract = (appt as Record<string, unknown>).practitioners as { first_name?: string; last_name?: string; specialty?: string } | undefined
                      const specialty = pract?.specialty || ''
                      const borderColor = borderColorMap[specialty] || 'border-primary'
                      const bgColor = bgColorMap[specialty] || 'bg-primary-fixed/15'
                      const startTime = new Date(appt.datetime_start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      const endTime = appt.datetime_end ? new Date(appt.datetime_end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null
                      const status = statusLabels[appt.status] || statusLabels['planifie']

                      return (
                        <div key={appt.id} className={`border-l-4 ${borderColor} rounded-r-xl ${bgColor} p-4`}>
                          <p className="text-xs text-outline mb-1">{startTime}{endTime ? ` — ${endTime}` : ''}</p>
                          <p className="font-semibold text-on-surface">
                            {pract ? `${pract.first_name || ''} ${pract.last_name || ''}`.trim() : appt.title}
                          </p>
                          {specialty && <Badge variant="primary" size="sm">{specialty}</Badge>}
                          <div className="flex items-center gap-1 mt-2">
                            <Badge variant={status.variant} size="sm" icon={appt.status === 'confirme' ? 'check_circle' : 'schedule'}>
                              {status.label}
                            </Badge>
                          </div>
                          {appt.location && (
                            <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {appt.location}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Demo / empty state fallback */}
                  {!hasAppointments ? (
                    <>
                      <p className="text-sm text-on-surface-variant mb-6">2 rendez-vous aujourd&apos;hui</p>
                      <div className="space-y-4">
                        <div className="border-l-4 border-primary rounded-r-xl bg-primary-fixed/15 p-4">
                          <p className="text-xs text-outline mb-1">14h00 — 14h45</p>
                          <p className="font-semibold text-on-surface">Mme Valerie Dupont</p>
                          <Badge variant="primary" size="sm">Orthophoniste</Badge>
                          <div className="flex items-center gap-1 mt-2">
                            <Badge variant="secondary" size="sm" icon="check_circle">Confirme</Badge>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            12 Rue de la Paix
                          </p>
                        </div>

                        <div className="border-l-4 border-purple-500 rounded-r-xl bg-purple-50 p-4">
                          <p className="text-xs text-outline mb-1">16h30 — 17h30</p>
                          <p className="font-semibold text-on-surface">Dr. Alain Martin</p>
                          <Badge variant="primary" size="sm">Pedopsychiatre</Badge>
                          <div className="flex items-center gap-1 mt-2">
                            <Badge variant="gold" size="sm" icon="schedule">A confirmer</Badge>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            Centre Hospitalier, Batiment B
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-outline text-[40px] mb-2 block">event_busy</span>
                      <p className="text-sm text-on-surface-variant">Aucun rendez-vous ce jour</p>
                    </div>
                  )}
                </>
              )}
            </Card>

            <Card padding="sm" className="bg-tertiary-fixed/20 border-none">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">lightbulb</span>
                <p className="text-sm text-on-surface-variant">
                  Pensez a prendre le carnet de suivi de {firstChild?.first_name || 'votre enfant'}.
                </p>
              </div>
            </Card>

            <Card padding="sm">
              <p className="text-xs text-outline uppercase tracking-wider mb-2">A venir demain</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary-fixed rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">healing</span>
                </div>
                <div>
                  <p className="font-medium text-on-surface text-sm">Seance d&apos;Ergotherapie</p>
                  <p className="text-xs text-on-surface-variant">8 Avril — 10h00-11h00</p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
