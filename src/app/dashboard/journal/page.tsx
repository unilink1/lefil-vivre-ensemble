'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { supabase } from '@/lib/supabase'

// ── Types ──

interface DailyLog {
  id?: string
  child_id: string
  parent_id: string
  log_date: string
  mood: number
  sleep_quality: 'bonne' | 'moyenne' | 'mauvaise'
  appetite: 'bon' | 'moyen' | 'faible'
  energy_level: number
  crises_count: number
  crises_details: string | null
  treatment_taken: boolean
  positive_moments: string | null
  concerns: string | null
  notes: string | null
}

interface WeeklySummary {
  avgMood: number
  totalCrises: number
  sleepPattern: { bonne: number; moyenne: number; mauvaise: number }
  energyTrend: number[]
  daysLogged: number
}

// ── Constants ──

const moods = [
  { emoji: '😢', label: 'Dur', value: 1 },
  { emoji: '😟', label: 'Difficile', value: 2 },
  { emoji: '😐', label: 'Neutre', value: 3 },
  { emoji: '🙂', label: 'Ok', value: 4 },
  { emoji: '😊', label: 'Bien', value: 5 },
]

const sleepOptions: { label: string; value: DailyLog['sleep_quality'] }[] = [
  { label: 'Bonne', value: 'bonne' },
  { label: 'Moyenne', value: 'moyenne' },
  { label: 'Mauvaise', value: 'mauvaise' },
]

const appetiteOptions: { label: string; value: DailyLog['appetite'] }[] = [
  { label: 'Bon', value: 'bon' },
  { label: 'Moyen', value: 'moyen' },
  { label: 'Faible', value: 'faible' },
]

// ── Helpers ──

function getWeekDays() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      day: dayNames[i],
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      date: d,
      dateStr: d.toISOString().split('T')[0],
    })
  }
  return days
}

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function moodEmoji(val: number): string {
  return moods.find(m => m.value === val)?.emoji || '😐'
}

function defaultFormState(): Omit<DailyLog, 'id' | 'child_id' | 'parent_id' | 'log_date'> {
  return {
    mood: 3,
    sleep_quality: 'bonne',
    appetite: 'bon',
    energy_level: 3,
    crises_count: 0,
    crises_details: null,
    treatment_taken: true,
    positive_moments: null,
    concerns: null,
    notes: null,
  }
}

// ── Component ──

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const { selectedChild, loading: childrenLoading } = useSelectedChild()

  const days = useMemo(() => getWeekDays(), [])
  const todayIdx = days.findIndex(d => d.isToday)
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx >= 0 ? todayIdx : 0)
  const selectedDate = days[selectedDayIdx]

  // Form state
  const [form, setForm] = useState(defaultFormState())
  const [loadingDay, setLoadingDay] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasExistingData, setHasExistingData] = useState(false)

  // History modal
  const [showHistory, setShowHistory] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // ── Load day data from Supabase ──
  const loadDayData = useCallback(async (dateStr: string) => {
    if (!selectedChild?.id) return
    setLoadingDay(true)
    setSaveSuccess(false)
    setSaveError(null)
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('child_id', selectedChild.id)
        .eq('log_date', dateStr)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setForm({
          mood: data.mood ?? 3,
          sleep_quality: data.sleep_quality ?? 'bonne',
          appetite: data.appetite ?? 'bon',
          energy_level: data.energy_level ?? 3,
          crises_count: data.crises_count ?? 0,
          crises_details: data.crises_details ?? null,
          treatment_taken: data.treatment_taken ?? true,
          positive_moments: data.positive_moments ?? null,
          concerns: data.concerns ?? null,
          notes: data.notes ?? null,
        })
        setHasExistingData(true)
      } else {
        setForm(defaultFormState())
        setHasExistingData(false)
      }
    } catch {
      setForm(defaultFormState())
      setHasExistingData(false)
    } finally {
      setLoadingDay(false)
    }
  }, [selectedChild?.id])

  // Load data when day or child changes
  useEffect(() => {
    if (selectedDate && selectedChild?.id) {
      loadDayData(selectedDate.dateStr)
    }
  }, [selectedDate, selectedChild?.id, loadDayData])

  // ── Save / Upsert ──
  const handleSave = useCallback(async () => {
    if (!selectedChild?.id || !user?.id) return
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    try {
      const payload = {
        child_id: selectedChild.id,
        parent_id: user.id,
        log_date: selectedDate.dateStr,
        mood: form.mood,
        sleep_quality: form.sleep_quality,
        appetite: form.appetite,
        energy_level: form.energy_level,
        crises_count: form.crises_count,
        crises_details: form.crises_details || null,
        treatment_taken: form.treatment_taken,
        positive_moments: form.positive_moments || null,
        concerns: form.concerns || null,
        notes: form.notes || null,
      }

      const { error } = await supabase
        .from('daily_logs')
        .upsert(payload, { onConflict: 'child_id,log_date' })

      if (error) throw error

      setSaveSuccess(true)
      setHasExistingData(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setSaveError(message)
      setTimeout(() => setSaveError(null), 5000)
    } finally {
      setSaving(false)
    }
  }, [selectedChild?.id, user?.id, selectedDate, form])

  // ── Load weekly summary ──
  const loadWeeklySummary = useCallback(async () => {
    if (!selectedChild?.id) return
    setLoadingSummary(true)
    try {
      const mondayStr = days[0].dateStr
      const sundayStr = days[6].dateStr

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('child_id', selectedChild.id)
        .gte('log_date', mondayStr)
        .lte('log_date', sundayStr)
        .order('log_date', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const avgMood = data.reduce((s, d) => s + (d.mood || 0), 0) / data.length
        const totalCrises = data.reduce((s, d) => s + (d.crises_count || 0), 0)
        const sleepPattern = { bonne: 0, moyenne: 0, mauvaise: 0 }
        data.forEach(d => {
          const sq = d.sleep_quality as keyof typeof sleepPattern
          if (sq in sleepPattern) sleepPattern[sq]++
        })
        const energyTrend = data.map(d => d.energy_level || 0)

        setWeeklySummary({
          avgMood: Math.round(avgMood * 10) / 10,
          totalCrises,
          sleepPattern,
          energyTrend,
          daysLogged: data.length,
        })
      } else {
        setWeeklySummary(null)
      }
    } catch {
      setWeeklySummary(null)
    } finally {
      setLoadingSummary(false)
    }
  }, [selectedChild?.id, days])

  const openHistory = useCallback(() => {
    setShowHistory(true)
    loadWeeklySummary()
  }, [loadWeeklySummary])

  // ── Form updaters ──
  const updateField = <K extends keyof ReturnType<typeof defaultFormState>>(
    key: K,
    value: ReturnType<typeof defaultFormState>[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ── Loading / guard states ──
  const isLoading = authLoading || childrenLoading

  if (isLoading) {
    return (
      <DashboardLayout title="Journal" breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!selectedChild) {
    return (
      <DashboardLayout title="Journal" breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white border border-gray-100 shadow-sm p-12 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[#4A90D9]/10 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[#4A90D9] text-3xl">child_care</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun enfant enregistre</h3>
            <p className="text-gray-400 text-sm">
              Ajoutez un profil enfant pour commencer le journal de suivi quotidien.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ── Pill button helpers for sleep / appetite ──
  const pillColors = ['#7EC8B0', '#E8A87C', '#E87C7C']

  return (
    <DashboardLayout
      title={`Journal de ${selectedChild.first_name || 'votre enfant'}`}
      breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}
    >
      <div className="max-w-3xl mx-auto space-y-8 pb-12">

        {/* ── Week day selector + Historique button ── */}
        <div className="flex items-center gap-4">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 flex-1">
            {days.map((d, idx) => (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDayIdx(idx)}
                className={`shrink-0 flex flex-col items-center py-3 px-5 rounded-2xl cursor-pointer
                  ${selectedDayIdx === idx
                    ? 'bg-[#4A90D9] text-white shadow-lg shadow-[#4A90D9]/25 scale-105'
                    : 'bg-white border border-gray-100 text-gray-500 hover:border-[#4A90D9]/30 hover:text-[#4A90D9]'
                  }`}
                style={{ transition: 'all 0.2s ease' }}
              >
                <span className="text-[10px] uppercase tracking-widest opacity-70 font-medium">{d.day}</span>
                <span className="text-lg font-bold mt-0.5">{d.num}</span>
                {d.isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDayIdx === idx ? 'bg-white' : 'bg-[#4A90D9]'}`}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={openHistory}
            className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl text-sm font-semibold text-[#4A90D9] hover:border-[#4A90D9]/40 cursor-pointer"
            style={{ transition: 'all 0.2s ease' }}
          >
            <span className="material-symbols-outlined text-lg">bar_chart</span>
            Historique
          </button>
        </div>

        {/* ── Day status indicator ── */}
        {hasExistingData && !loadingDay && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#7EC8B0]/10 border border-[#7EC8B0]/20 rounded-lg">
            <span className="material-symbols-outlined text-[#7EC8B0] text-lg">check_circle</span>
            <span className="text-sm text-[#5ea892] font-medium">
              Donnees enregistrees pour le {selectedDate.num} {selectedDate.day.toLowerCase()}
            </span>
          </div>
        )}

        {/* ── Loading overlay for day switch ── */}
        {loadingDay && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin" />
          </div>
        )}

        {!loadingDay && (
          <>
            {/* ── Main Form Card ── */}
            <div className="bg-white border border-gray-100 shadow-sm p-8 space-y-10 rounded-sm">

              {/* Mood */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
                  Humeur generale
                </label>
                <div className="flex justify-between gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => updateField('mood', m.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer flex-1
                        ${form.mood === m.value
                          ? 'bg-[#4A90D9]/10 ring-2 ring-[#4A90D9] shadow-md shadow-[#4A90D9]/10'
                          : 'hover:bg-gray-50'
                        }`}
                      style={{
                        transform: form.mood === m.value ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className={`text-[11px] font-medium ${form.mood === m.value ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Sommeil */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
                  Qualite du sommeil
                </label>
                <div className="flex gap-3">
                  {sleepOptions.map((s, i) => {
                    const isActive = form.sleep_quality === s.value
                    return (
                      <button
                        key={s.value}
                        onClick={() => updateField('sleep_quality', s.value)}
                        className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: isActive ? pillColors[i] : '#f8f9fa',
                          color: isActive ? '#fff' : '#9ca3af',
                          boxShadow: isActive ? `0 4px 14px ${pillColors[i]}40` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Appetit */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
                  Appetit
                </label>
                <div className="flex gap-3">
                  {appetiteOptions.map((a, i) => {
                    const isActive = form.appetite === a.value
                    return (
                      <button
                        key={a.value}
                        onClick={() => updateField('appetite', a.value)}
                        className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
                        style={{
                          backgroundColor: isActive ? pillColors[i] : '#f8f9fa',
                          color: isActive ? '#fff' : '#9ca3af',
                          boxShadow: isActive ? `0 4px 14px ${pillColors[i]}40` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {a.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Energie */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
                  Niveau d&apos;energie
                  <span className="text-[#E8A87C] font-bold ml-2">{form.energy_level}/5</span>
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => updateField('energy_level', n)}
                      className="w-12 h-12 rounded-full cursor-pointer hover:scale-110"
                      style={{
                        background: n <= form.energy_level
                          ? 'linear-gradient(135deg, #E8A87C, #e09060)'
                          : '#f1f5f9',
                        boxShadow: n <= form.energy_level ? '0 4px 12px #E8A87C50' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Crises */}
              <div className="bg-[#E8A87C]/5 rounded-2xl p-6">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 block">
                  Crises / Episodes
                </label>
                <div className="flex items-center gap-5 mb-4">
                  <button
                    onClick={() => updateField('crises_count', Math.max(0, form.crises_count - 1))}
                    className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:border-[#E8A87C] hover:text-[#E8A87C]"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <span className="material-symbols-outlined text-xl">remove</span>
                  </button>
                  <span className="text-3xl font-bold text-gray-800 w-10 text-center tabular-nums">
                    {form.crises_count}
                  </span>
                  <button
                    onClick={() => updateField('crises_count', form.crises_count + 1)}
                    className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:border-[#E8A87C] hover:text-[#E8A87C]"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
                {form.crises_count > 0 && (
                  <textarea
                    value={form.crises_details || ''}
                    onChange={e => updateField('crises_details', e.target.value || null)}
                    placeholder="Decrivez les details de l'episode..."
                    className="w-full bg-white rounded-none p-4 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-24 border border-gray-100 focus:ring-2 focus:ring-[#E8A87C]/30 focus:border-[#E8A87C]/40"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                )}
              </div>

              {/* Traitement Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-gray-800">Traitement pris</p>
                  <p className="text-sm text-gray-400 mt-0.5">Medication quotidienne</p>
                </div>
                <button
                  onClick={() => updateField('treatment_taken', !form.treatment_taken)}
                  className="w-14 h-8 rounded-full cursor-pointer relative"
                  style={{
                    backgroundColor: form.treatment_taken ? '#7EC8B0' : '#e2e8f0',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <div
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                    style={{
                      transform: form.treatment_taken ? 'translateX(24px)' : 'translateX(2px)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* ── Moments Positifs ── */}
            <div className="bg-white border border-gray-100 shadow-sm p-8" style={{ borderLeft: '4px solid #7EC8B0' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#7EC8B0]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#7EC8B0]">volunteer_activism</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-base">Moments positifs</h3>
              </div>
              <textarea
                value={form.positive_moments || ''}
                onChange={e => updateField('positive_moments', e.target.value || null)}
                placeholder="Qu'est-ce qui s'est bien passe aujourd'hui ?"
                className="w-full bg-gray-50 rounded-none p-5 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-28 focus:ring-2 focus:ring-[#7EC8B0]/30 focus:bg-white focus:border-[#7EC8B0]/30 border border-transparent"
                style={{ transition: 'all 0.2s ease' }}
              />
            </div>

            {/* ── Preoccupations ── */}
            <div className="bg-white border border-gray-100 shadow-sm p-8" style={{ borderLeft: '4px solid #E8A87C' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E8A87C]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#E8A87C]">psychology_alt</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-base">Preoccupations</h3>
              </div>
              <textarea
                value={form.concerns || ''}
                onChange={e => updateField('concerns', e.target.value || null)}
                placeholder="Y a-t-il quelque chose qui vous inquiete ?"
                className="w-full bg-gray-50 rounded-none p-5 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-28 focus:ring-2 focus:ring-[#E8A87C]/30 focus:bg-white focus:border-[#E8A87C]/30 border border-transparent"
                style={{ transition: 'all 0.2s ease' }}
              />
            </div>

            {/* ── Notes libres ── */}
            <div className="bg-white border border-gray-100 shadow-sm p-8" style={{ borderLeft: '4px solid #4A90D9' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4A90D9]">edit_note</span>
                </div>
                <h3 className="font-semibold text-gray-800 text-base">Notes</h3>
              </div>
              <textarea
                value={form.notes || ''}
                onChange={e => updateField('notes', e.target.value || null)}
                placeholder="Notes supplementaires pour cette journee..."
                className="w-full bg-gray-50 rounded-none p-5 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-28 focus:ring-2 focus:ring-[#4A90D9]/30 focus:bg-white focus:border-[#4A90D9]/30 border border-transparent"
                style={{ transition: 'all 0.2s ease' }}
              />
            </div>

            {/* ── Save Button ── */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{
                background: saveSuccess
                  ? 'linear-gradient(135deg, #7EC8B0, #5eb89a)'
                  : saveError
                    ? 'linear-gradient(135deg, #E87C7C, #d06060)'
                    : 'linear-gradient(135deg, #4A90D9, #3a7bc8)',
                boxShadow: saveSuccess
                  ? '0 8px 24px #7EC8B040'
                  : saveError
                    ? '0 8px 24px #E87C7C40'
                    : '0 8px 24px #4A90D940',
                transition: 'all 0.3s ease',
              }}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : saveSuccess ? (
                <>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Enregistre !
                </>
              ) : saveError ? (
                <>
                  <span className="material-symbols-outlined text-xl">error</span>
                  Erreur - Reessayer
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">save</span>
                  {hasExistingData ? 'Mettre a jour la journee' : 'Enregistrer la journee'}
                </>
              )}
            </button>

            {saveError && (
              <p className="text-sm text-red-500 text-center -mt-4">{saveError}</p>
            )}
          </>
        )}

        {/* ── History Modal (Weekly Summary) ── */}
        {showHistory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowHistory(false) }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              style={{
                animation: 'modalIn 0.25s ease-out',
              }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4A90D9]">bar_chart</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Synthese de la semaine</h2>
                    <p className="text-xs text-gray-400">
                      {days[0].num} - {days[6].num}{' '}
                      {days[6].date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
                  style={{ transition: 'background-color 0.15s ease' }}
                >
                  <span className="material-symbols-outlined text-gray-400">close</span>
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-6">
                {loadingSummary ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin" />
                  </div>
                ) : !weeklySummary ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-300 text-5xl mb-3 block">event_busy</span>
                    <p className="text-gray-400 text-sm">Aucune donnee cette semaine</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Commencez a remplir le journal pour voir la synthese.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Days logged */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <span className="text-sm text-gray-400">Jours enregistres</span>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {weeklySummary.daysLogged} <span className="text-base font-normal text-gray-400">/ 7</span>
                      </p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Average mood */}
                      <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
                        <span className="text-3xl block mb-2">{moodEmoji(Math.round(weeklySummary.avgMood))}</span>
                        <p className="text-2xl font-bold text-gray-800">{weeklySummary.avgMood}</p>
                        <p className="text-xs text-gray-400 mt-1">Humeur moyenne</p>
                      </div>

                      {/* Total crises */}
                      <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
                        <span className="material-symbols-outlined text-3xl text-[#E8A87C] block mb-2">warning</span>
                        <p className="text-2xl font-bold text-gray-800">{weeklySummary.totalCrises}</p>
                        <p className="text-xs text-gray-400 mt-1">Crises totales</p>
                      </div>
                    </div>

                    {/* Sleep pattern */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        Repartition du sommeil
                      </h4>
                      <div className="space-y-2">
                        {([
                          { key: 'bonne' as const, label: 'Bonne', color: '#7EC8B0' },
                          { key: 'moyenne' as const, label: 'Moyenne', color: '#E8A87C' },
                          { key: 'mauvaise' as const, label: 'Mauvaise', color: '#E87C7C' },
                        ]).map(s => {
                          const count = weeklySummary.sleepPattern[s.key]
                          const pct = weeklySummary.daysLogged > 0
                            ? Math.round((count / weeklySummary.daysLogged) * 100)
                            : 0
                          return (
                            <div key={s.key} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-20">{s.label}</span>
                              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: s.color,
                                    minWidth: count > 0 ? '20px' : '0',
                                    transition: 'width 0.5s ease',
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-600 w-16 text-right">
                                {count} nuit{count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Energy trend */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        Tendance energie
                      </h4>
                      <div className="flex items-end gap-2 h-24">
                        {weeklySummary.energyTrend.map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-md"
                              style={{
                                height: `${(val / 5) * 100}%`,
                                minHeight: val > 0 ? '8px' : '2px',
                                background: val >= 4
                                  ? '#7EC8B0'
                                  : val >= 2
                                    ? '#E8A87C'
                                    : val > 0
                                      ? '#E87C7C'
                                      : '#e5e7eb',
                                transition: 'height 0.5s ease',
                              }}
                            />
                            <span className="text-[10px] text-gray-400 font-medium">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal footer */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                  style={{ transition: 'background-color 0.2s ease' }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal animation keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  )
}
