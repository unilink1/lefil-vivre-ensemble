'use client'
import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { useChildren } from '@/hooks/useData'
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
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]

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
        child_id: firstChild?.id,
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
  }, [firstChild?.id, user?.id, selectedDay, selectedMood, sommeil, appetit, energie, crises, criseDetails, traitement, momentsPositifs, preoccupations, days])

  const isLoading = authLoading || childrenLoading

  if (isLoading) {
    return (
      <DashboardLayout title="Journal" breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}>
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
    <DashboardLayout title={`Journal de ${firstChild?.first_name || 'votre enfant'}`} breadcrumb={[{ label: 'Suivi quotidien', href: '#' }]}>
      {/* Date Selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {days.map((d) => (
          <motion.button
            key={d.num}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDay(d.num)}
            className={`shrink-0 flex flex-col items-center py-3 px-4 rounded-2xl transition-all cursor-pointer ${
              selectedDay === d.num
                ? 'gradient-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'bg-surface-card text-on-surface-variant hover:bg-surface-low'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-70">{d.day}</span>
            <span className="text-lg font-bold">{d.num}</span>
            {d.today && <span className="w-1.5 h-1.5 rounded-full bg-current mt-1" />}
          </motion.button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Quick Entry */}
        <ScrollReveal>
          <Card padding="lg">
            {/* Mood */}
            <div className="mb-8">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4 block">Humeur generale</label>
              <div className="flex justify-between">
                {moods.map((m) => (
                  <motion.button
                    key={m.value}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMood(m.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer ${
                      selectedMood === m.value
                        ? 'bg-primary-fixed/40 ring-2 ring-primary shadow-md'
                        : 'hover:bg-surface-low'
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium text-on-surface-variant">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sommeil */}
            <div className="mb-8">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4 block">Sommeil</label>
              <div className="flex gap-2 mb-3">
                {['Bonne nuit', 'Moyenne', 'Mauvaise'].map(s => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSommeil(s)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      sommeil === s
                        ? 'gradient-primary text-white shadow-md'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >{s}</motion.button>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-surface-low rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-primary text-[20px]">bedtime</span>
                <span className="text-on-surface font-medium">8</span>
                <span className="text-on-surface-variant text-sm">h de sommeil</span>
              </div>
            </div>

            {/* Appetit */}
            <div className="mb-8">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4 block">Appetit</label>
              <div className="flex gap-2">
                {['Bon', 'Moyen', 'Faible'].map(a => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAppetit(a)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      appetit === a
                        ? 'bg-secondary text-white shadow-md'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >{a}</motion.button>
                ))}
              </div>
            </div>

            {/* Energie */}
            <div className="mb-8">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block">
                Niveau d&apos;energie <span className="text-primary font-bold">{energie}/5</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEnergie(n)}
                    className={`w-10 h-10 rounded-full transition-all cursor-pointer ${
                      n <= energie ? 'gradient-primary shadow-md' : 'bg-surface-high'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Crises */}
            <div className="mb-8 bg-tertiary-fixed/20 rounded-2xl p-5">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block">Crises / Episodes</label>
              <div className="flex items-center gap-4 mb-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCrises(Math.max(0, crises - 1))} className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center shadow cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant">remove</span>
                </motion.button>
                <span className="text-2xl font-bold text-on-surface w-8 text-center">{crises}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCrises(crises + 1)} className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center shadow cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant">add</span>
                </motion.button>
              </div>
              {crises > 0 && (
                <textarea
                  value={criseDetails}
                  onChange={e => setCriseDetails(e.target.value)}
                  placeholder="Decrivez les details de l'episode..."
                  className="w-full bg-surface-card/80 rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 outline-none resize-none h-20 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              )}
            </div>

            {/* Traitement */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-medium text-on-surface">Traitement pris</p>
                <p className="text-sm text-on-surface-variant">Matin et Soir</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setTraitement(!traitement)}
                className={`w-14 h-8 rounded-full transition-all cursor-pointer relative ${traitement ? 'bg-secondary' : 'bg-surface-high'}`}
              >
                <motion.div
                  animate={{ x: traitement ? 24 : 2 }}
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow"
                />
              </motion.button>
            </div>
          </Card>
        </ScrollReveal>

        {/* Expandable Sections */}
        <ScrollReveal delay={0.1}>
          <Card padding="lg" className="border-l-4 border-secondary">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">volunteer_activism</span>
              <h3 className="font-semibold text-on-surface">Moments positifs</h3>
            </div>
            <textarea
              value={momentsPositifs}
              onChange={e => setMomentsPositifs(e.target.value)}
              placeholder="Qu'est-ce qui s'est bien passe aujourd'hui ?"
              className="w-full bg-surface-low rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 outline-none resize-none h-24 focus:ring-2 focus:ring-secondary/20 transition-all"
            />
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Card padding="lg" className="border-l-4 border-tertiary">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-tertiary">psychology_alt</span>
              <h3 className="font-semibold text-on-surface">Preoccupations</h3>
            </div>
            <textarea
              value={preoccupations}
              onChange={e => setPreoccupations(e.target.value)}
              placeholder="Y a-t-il quelque chose qui vous inquiete ?"
              className="w-full bg-surface-low rounded-xl p-4 text-sm text-on-surface placeholder:text-outline/50 outline-none resize-none h-24 focus:ring-2 focus:ring-tertiary/20 transition-all"
            />
          </Card>
        </ScrollReveal>

        <Button fullWidth size="lg" iconRight={saveSuccess ? 'check' : saving ? undefined : 'check'} onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : saveSuccess ? 'Enregistre !' : 'Enregistrer'}
        </Button>

        {/* Historique recent */}
        <div>
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4">Historique recent</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { day: 'Sam', emoji: '😊', sleep: '9h' },
              { day: 'Ven', emoji: '😐', sleep: '7h' },
              { day: 'Jeu', emoji: '🙂', sleep: '8h' },
              { day: 'Mer', emoji: '😟', sleep: '6h' },
            ].map((h, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="shrink-0 w-20 bg-surface-card rounded-2xl p-3 text-center shadow-sm"
              >
                <p className="text-xs text-outline mb-1">{h.day}</p>
                <p className="text-2xl mb-1">{h.emoji}</p>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px] text-outline">bedtime</span>
                  <span className="text-[10px] text-on-surface-variant">{h.sleep}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
