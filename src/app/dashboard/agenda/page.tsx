'use client'
import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { useAppointments } from '@/hooks/useData'
import { useSelectedChild } from '@/hooks/useSelectedChild'

const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const legend = [
  { color: 'bg-[#4A90D9]', label: 'Orthophoniste' },
  { color: 'bg-[#7EC8B0]', label: 'Psychomotricien' },
  { color: 'bg-[#E8A87C]', label: 'Ergotherapeute' },
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
  'Orthophoniste': 'border-[#4A90D9]',
  'Psychomotricien': 'border-[#7EC8B0]',
  'Ergotherapeute': 'border-[#E8A87C]',
  'Pedopsychiatre': 'border-purple-500',
}

const bgColorMap: Record<string, string> = {
  'Orthophoniste': 'bg-[#4A90D9]/10',
  'Psychomotricien': 'bg-[#7EC8B0]/10',
  'Ergotherapeute': 'bg-[#E8A87C]/10',
  'Pedopsychiatre': 'bg-purple-50',
}

const dotColorMap: Record<string, string> = {
  ortho: 'bg-[#4A90D9]',
  psycho: 'bg-[#7EC8B0]',
  ergo: 'bg-[#E8A87C]',
  pedo: 'bg-purple-500',
  neuro: 'bg-orange-500',
}

function getSpecialtyColor(specialty: string): string {
  const s = specialty.toLowerCase()
  if (s.includes('psycho')) return dotColorMap.psycho
  if (s.includes('ergo')) return dotColorMap.ergo
  if (s.includes('pedo') || s.includes('psychiatr')) return dotColorMap.pedo
  if (s.includes('neuro')) return dotColorMap.neuro
  return dotColorMap.ortho
}

export default function AgendaPage() {
  const { loading: authLoading } = useAuth()
  const { selectedChild, loading: childrenLoading } = useSelectedChild()
  const { appointments, loading: apptLoading } = useAppointments(selectedChild?.id)

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

  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = today.getDate()

  // Map appointments to calendar dots by day
  const rdvDots = useMemo(() => {
    const dots: Record<number, string[]> = {}
    appointments.forEach(a => {
      const d = new Date(a.datetime_start)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate()
        const pract = (a as Record<string, unknown>).practitioners as { specialty?: string } | undefined
        const specialty = pract?.specialty || ''
        const color = getSpecialtyColor(specialty)
        if (!dots[day]) dots[day] = []
        if (!dots[day].includes(color)) dots[day].push(color)
      }
    })
    return dots
  }, [appointments, currentMonth, currentYear])

  // Appointments for the selected day
  const selectedDayAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = new Date(a.datetime_start)
      return d.getDate() === selectedDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
  }, [appointments, selectedDay, currentMonth, currentYear])

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
            <div className="w-12 h-12 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Chargement de l&apos;agenda...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const childName = selectedChild?.first_name

  const selectedDateLabel = new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const selectedDateCapitalized = selectedDateLabel.charAt(0).toUpperCase() + selectedDateLabel.slice(1)

  return (
    <DashboardLayout
      title={childName ? `Agenda de ${childName}` : 'Agenda'}
      breadcrumb={[{ label: 'Suivi de parcours', href: '/dashboard/profil' }]}
    >
      {/* Header bar: view toggles + action */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex gap-1 bg-gray-50 rounded-2xl p-1.5">
          {(['Mois', 'Semaine', 'Liste'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                view === v
                  ? 'bg-[#4A90D9] text-white shadow-md shadow-[#4A90D9]/20'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Button size="sm" icon="add">Nouveau rendez-vous</Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* ===================== CALENDAR CARD ===================== */}
        <ScrollReveal>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={prevMonth}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.05] cursor-pointer"
              >
                <span className="material-symbols-outlined text-gray-400">chevron_left</span>
              </button>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-gray-900 tracking-tight">
                {moisCapitalized}
              </h3>
              <button
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.05] cursor-pointer"
              >
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {jours.map(j => (
                <div key={j} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest py-2">
                  {j}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                const isSelected = day !== null && selectedDay === day
                const isToday = day !== null && isCurrentMonth && todayDate === day
                const hasDots = day !== null && rdvDots[day]

                return (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`
                      aspect-square min-h-[44px] sm:min-h-0 rounded-xl flex flex-col items-center justify-center relative
                      transition-all duration-200 cursor-pointer
                      ${!day ? 'cursor-default' : ''}
                      ${isSelected
                        ? 'bg-[#4A90D9] shadow-lg shadow-[#4A90D9]/25 scale-[1.02]'
                        : isToday
                          ? 'bg-[#4A90D9]/8 ring-1 ring-[#4A90D9]/30'
                          : 'hover:bg-gray-50 hover:scale-[1.04]'
                      }
                    `}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-sm font-medium leading-none ${
                            isSelected
                              ? 'text-white font-bold'
                              : isToday
                                ? 'text-[#4A90D9] font-bold'
                                : 'text-gray-900'
                          }`}
                        >
                          {day}
                        </span>
                        {hasDots && (
                          <div className="flex gap-0.5 mt-1">
                            {rdvDots[day].map((color, j) => (
                              <div
                                key={j}
                                className={`w-1.5 h-1.5 rounded-full ${color} ${isSelected ? 'opacity-80' : ''}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-100">
              {legend.map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-xs text-gray-500 font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ===================== DAY DETAIL PANEL ===================== */}
        <ScrollReveal delay={0.15}>
          <div className="space-y-6">
            {/* Selected day card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg text-gray-900 mb-1">
                {selectedDateCapitalized}
              </h3>

              {apptLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Chargement...</p>
                </div>
              ) : selectedDayAppointments.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    {selectedDayAppointments.length} rendez-vous
                  </p>
                  <div className="space-y-4">
                    {selectedDayAppointments.map((appt) => {
                      const pract = (appt as Record<string, unknown>).practitioners as {
                        first_name?: string
                        last_name?: string
                        specialty?: string
                      } | undefined
                      const specialty = pract?.specialty || ''
                      const borderColor = borderColorMap[specialty] || 'border-[#4A90D9]'
                      const bgColor = bgColorMap[specialty] || 'bg-[#4A90D9]/8'
                      const startTime = new Date(appt.datetime_start).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      const endTime = appt.datetime_end
                        ? new Date(appt.datetime_end).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : null
                      const status = statusLabels[appt.status] || statusLabels['planifie']

                      return (
                        <div
                          key={appt.id}
                          className={`border-l-4 ${borderColor} rounded-r-2xl ${bgColor} p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm`}
                        >
                          <p className="text-xs text-gray-400 font-medium mb-1.5 tracking-wide">
                            {startTime}
                            {endTime ? ` — ${endTime}` : ''}
                          </p>
                          <p className="font-semibold text-gray-900 text-[15px]">
                            {pract
                              ? `${pract.first_name || ''} ${pract.last_name || ''}`.trim()
                              : appt.title}
                          </p>
                          {specialty && (
                            <div className="mt-2">
                              <Badge variant="primary" size="sm">{specialty}</Badge>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-3">
                            <Badge
                              variant={status.variant}
                              size="sm"
                              icon={appt.status === 'confirme' ? 'check_circle' : 'schedule'}
                            >
                              {status.label}
                            </Badge>
                          </div>
                          {appt.location && (
                            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px] text-gray-400">location_on</span>
                              {appt.location}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* Empty state - no appointments this day */
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gray-300 text-[32px]">event_busy</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Aucun rendez-vous ce jour</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Selectionnez un autre jour ou ajoutez un rendez-vous
                  </p>
                </div>
              )}
            </div>

            {/* Tip card */}
            {childName && (
              <div className="bg-[#E8A87C]/10 rounded-2xl border border-[#E8A87C]/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#E8A87C]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#E8A87C] text-[18px]">lightbulb</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pensez a prendre le carnet de suivi de {childName}.
                  </p>
                </div>
              </div>
            )}

            {/* Upcoming - show only if there are appointments */}
            {hasAppointments && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">A venir</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#7EC8B0]/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#7EC8B0] text-[22px]">healing</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Prochain rendez-vous</p>
                    <p className="text-xs text-gray-400 mt-0.5">Consultez votre agenda pour les details</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}
