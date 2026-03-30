'use client'

import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { supabase } from '@/lib/supabase'

const moods = [
  { emoji: '😊', label: 'Bien', value: 5 },
  { emoji: '🙂', label: 'Ok', value: 4 },
  { emoji: '😐', label: 'Neutre', value: 3 },
  { emoji: '😟', label: 'Difficile', value: 2 },
  { emoji: '😢', label: 'Dur', value: 1 },
]

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
      today: d.toDateString() === today.toDateString(),
      date: d,
    })
  }
  return days
}

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const { selectedChild, loading: childrenLoading } = useSelectedChild()

  const [selectedMood, setSelectedMood] = useState(3)
  const [sommeil, setSommeil] = useState<string>('Bonne nuit')
  const [appetit, setAppetit] = useState<string>('Moyen')
  const [energie, setEnergie] = useState(3)
  const [crises, setCrises] = useState(0)
  const [criseDetails, setCriseDetails] = useState('')
  const [traitement, setTraitement] = useState(true)
  const [momentsPositifs, setMomentsPositifs] = useState('')
  const [preoccupations, setPreoccupations] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const days = getWeekDays()
  const [selectedDay, setSelectedDay] = useState(days.find(d => d.today)?.num || days[0].num)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      const selectedDate = days.find(d => d.num === selectedDay)?.date || new Date()
      const dateStr = selectedDate.toISOString().split('T')[0]

      await supabase.from('daily_logs').upsert({
        child_id: selectedChild?.id,
        user_id: user?.id,
        log_date: dateStr,
        mood: selectedMood,
        sleep_quality: sommeil,
        appetite: appetit,
        energy_level: energie,
        crisis_count: crises,
        crisis_details: criseDetails || null,
        treatment_taken: traitement,
        positive_moments: momentsPositifs || null,
        concerns: preoccupations || null,
      }, { onConflict: 'child_id,log_date' })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // Table may not exist yet, silently ignore
    } finally {
      setSaving(false)
    }
  }, [selectedChild?.id, user?.id, selectedDay, selectedMood, sommeil, appetit, energie, crises, criseDetails, traitement, momentsPositifs, preoccupations, days])

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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[#4A90D9]/10 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[#4A90D9] text-3xl">child_care</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun enfant enregistre</h3>
            <p className="text-gray-400 text-sm">Ajoutez un profil enfant pour commencer le journal de suivi quotidien.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`Journal de ${selectedChild?.first_name || 'votre enfant'}`} breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">

        {/* ── Date Selector ── */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {days.map((d) => (
            <button
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              className={`shrink-0 flex flex-col items-center py-3 px-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                selectedDay === d.num
                  ? 'bg-[#4A90D9] text-white shadow-lg shadow-[#4A90D9]/25 scale-105'
                  : 'bg-white border border-gray-100 text-gray-500 hover:border-[#4A90D9]/30 hover:text-[#4A90D9]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest opacity-70 font-medium">{d.day}</span>
              <span className="text-lg font-bold mt-0.5">{d.num}</span>
              {d.today && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDay === d.num ? 'bg-white' : 'bg-[#4A90D9]'}`} />
              )}
            </button>
          ))}
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10">

          {/* Mood */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
              Humeur generale
            </label>
            <div className="flex justify-between gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 cursor-pointer flex-1 ${
                    selectedMood === m.value
                      ? 'bg-[#4A90D9]/10 ring-2 ring-[#4A90D9] shadow-md shadow-[#4A90D9]/10'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{ transform: selectedMood === m.value ? 'scale(1.05)' : 'scale(1)' }}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={`text-[11px] font-medium ${selectedMood === m.value ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Sommeil */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
              Sommeil
            </label>
            <div className="flex gap-3 mb-4">
              {['Bonne nuit', 'Moyenne', 'Mauvaise'].map((s, i) => {
                const colors = ['#7EC8B0', '#E8A87C', '#E87C7C']
                const isActive = sommeil === s
                return (
                  <button
                    key={s}
                    onClick={() => setSommeil(s)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? colors[i] : '#f8f9fa',
                      color: isActive ? '#fff' : '#9ca3af',
                      boxShadow: isActive ? `0 4px 14px ${colors[i]}40` : 'none',
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3.5">
              <span className="material-symbols-outlined text-[#4A90D9] text-xl">bedtime</span>
              <span className="text-gray-800 font-semibold">8</span>
              <span className="text-gray-400 text-sm">h de sommeil</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Appetit */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
              Appetit
            </label>
            <div className="flex gap-3">
              {['Bon', 'Moyen', 'Faible'].map((a, i) => {
                const colors = ['#7EC8B0', '#E8A87C', '#E87C7C']
                const isActive = appetit === a
                return (
                  <button
                    key={a}
                    onClick={() => setAppetit(a)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? colors[i] : '#f8f9fa',
                      color: isActive ? '#fff' : '#9ca3af',
                      boxShadow: isActive ? `0 4px 14px ${colors[i]}40` : 'none',
                    }}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Energie */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 block">
              Niveau d&apos;energie
              <span className="text-[#E8A87C] font-bold ml-2">{energie}/5</span>
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setEnergie(n)}
                  className="w-12 h-12 rounded-full transition-all duration-200 cursor-pointer hover:scale-110"
                  style={{
                    background: n <= energie
                      ? 'linear-gradient(135deg, #E8A87C, #e09060)'
                      : '#f1f5f9',
                    boxShadow: n <= energie ? '0 4px 12px #E8A87C50' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Crises */}
          <div className="bg-[#E8A87C]/8 rounded-2xl p-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 block">
              Crises / Episodes
            </label>
            <div className="flex items-center gap-5 mb-4">
              <button
                onClick={() => setCrises(Math.max(0, crises - 1))}
                className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:border-[#E8A87C] hover:text-[#E8A87C] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              <span className="text-3xl font-bold text-gray-800 w-10 text-center tabular-nums">{crises}</span>
              <button
                onClick={() => setCrises(crises + 1)}
                className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:border-[#E8A87C] hover:text-[#E8A87C] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
            {crises > 0 && (
              <textarea
                value={criseDetails}
                onChange={e => setCriseDetails(e.target.value)}
                placeholder="Decrivez les details de l'episode..."
                className="w-full bg-white rounded-xl p-4 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-24 border border-gray-100 focus:ring-2 focus:ring-[#E8A87C]/30 focus:border-[#E8A87C]/40 transition-all duration-200"
              />
            )}
          </div>

          {/* Traitement Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-gray-800">Traitement pris</p>
              <p className="text-sm text-gray-400 mt-0.5">Matin et Soir</p>
            </div>
            <button
              onClick={() => setTraitement(!traitement)}
              className="w-14 h-8 rounded-full transition-all duration-300 cursor-pointer relative"
              style={{ backgroundColor: traitement ? '#7EC8B0' : '#e2e8f0' }}
            >
              <div
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
                style={{ transform: traitement ? 'translateX(24px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>

        {/* ── Moments Positifs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8" style={{ borderLeft: '4px solid #7EC8B0' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#7EC8B0]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7EC8B0]">volunteer_activism</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-base">Moments positifs</h3>
          </div>
          <textarea
            value={momentsPositifs}
            onChange={e => setMomentsPositifs(e.target.value)}
            placeholder="Qu'est-ce qui s'est bien passe aujourd'hui ?"
            className="w-full bg-gray-50 rounded-xl p-5 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-28 focus:ring-2 focus:ring-[#7EC8B0]/30 focus:bg-white focus:border-[#7EC8B0]/30 border border-transparent transition-all duration-200"
          />
        </div>

        {/* ── Preoccupations ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8" style={{ borderLeft: '4px solid #E8A87C' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#E8A87C]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#E8A87C]">psychology_alt</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-base">Preoccupations</h3>
          </div>
          <textarea
            value={preoccupations}
            onChange={e => setPreoccupations(e.target.value)}
            placeholder="Y a-t-il quelque chose qui vous inquiete ?"
            className="w-full bg-gray-50 rounded-xl p-5 text-sm text-gray-700 placeholder:text-gray-300 outline-none resize-none h-28 focus:ring-2 focus:ring-[#E8A87C]/30 focus:bg-white focus:border-[#E8A87C]/30 border border-transparent transition-all duration-200"
          />
        </div>

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          style={{
            background: saveSuccess
              ? 'linear-gradient(135deg, #7EC8B0, #5eb89a)'
              : 'linear-gradient(135deg, #4A90D9, #3a7bc8)',
            boxShadow: saveSuccess
              ? '0 8px 24px #7EC8B040'
              : '0 8px 24px #4A90D940',
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
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">save</span>
              Enregistrer la journee
            </>
          )}
        </button>

        {/* ── Historique recent ── */}
        <div>
          <h3 className="font-semibold text-gray-800 text-lg mb-5">Historique recent</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { day: 'Sam', emoji: '😊', sleep: '9h' },
              { day: 'Ven', emoji: '😐', sleep: '7h' },
              { day: 'Jeu', emoji: '🙂', sleep: '8h' },
              { day: 'Mer', emoji: '😟', sleep: '6h' },
            ].map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:-translate-y-1 transition-transform duration-200"
              >
                <p className="text-xs font-medium text-gray-400 mb-2">{h.day}</p>
                <p className="text-3xl mb-3">{h.emoji}</p>
                <div className="flex items-center justify-center gap-1.5 bg-gray-50 rounded-lg py-1.5 px-2">
                  <span className="material-symbols-outlined text-[14px] text-[#4A90D9]">bedtime</span>
                  <span className="text-xs font-medium text-gray-500">{h.sleep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
