'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const specialites = [
  { label: 'Orthophoniste', value: 'orthophoniste' },
  { label: 'Psychomotricien', value: 'psychomotricien' },
  { label: 'Ergothérapeute', value: 'ergotherapeute' },
  { label: 'Psychologue', value: 'psychologue' },
  { label: 'Pédopsychiatre', value: 'pedopsychiatre' },
  { label: 'Neuropédiatre', value: 'neuropediatre' },
  { label: 'Kinésithérapeute', value: 'kinesitherapeute' },
  { label: 'Pédiatre', value: 'pediatre' },
  { label: 'Neuropsychologue', value: 'neuropsychologue' },
  { label: 'Autre', value: 'autre' },
]

export default function OnboardingPraticiensPage() {
  const [praticiens, setPraticiens] = useState([
    { id: 1, principal: true, name: '', specialty: '' },
    { id: 2, principal: false, name: '', specialty: '' },
  ])
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const updatePraticien = (id: number, field: 'name' | 'specialty', value: string) => {
    setPraticiens(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleFinish = async () => {
    if (!user) { router.push('/dashboard/profil'); return }
    setSaving(true)
    try {
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      const childId = children?.[0]?.id

      for (const p of praticiens) {
        if (p.name && p.specialty) {
          await supabase.from('practitioners').insert({
            child_id: childId || null,
            first_name: p.name.split(' ')[0],
            last_name: p.name.split(' ').slice(1).join(' '),
            specialty: p.specialty,
          })
        }
      }

      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
    } catch {
      // Tables may not exist yet — continue anyway
    }
    setSaving(false)
    router.push('/dashboard/profil')
  }

  return (
    <div className="min-h-dvh bg-surface relative font-[family-name:var(--font-body)]">
      <FloatingOrbs variant="subtle" />

      {/* ── Progress header ── */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100/60 shadow-[0_1px_8px_rgba(45,55,72,0.04)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/onboarding/enfant"
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] px-2 rounded-lg hover:bg-surface-low focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Retour à l'étape précédente"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
              <span className="text-sm font-medium hidden sm:inline">Votre enfant</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-semibold">Étape 3 sur 3</span>
              <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary-dark rounded-full text-[10px] font-bold uppercase tracking-wider">
                Dernière étape
              </span>
            </div>
          </div>
          {/* Segmented progress */}
          <div className="flex gap-1.5 h-2" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label="Progression : étape 3 sur 3, dernière étape">
            <div className="flex-1 bg-secondary rounded-full" />
            <div className="flex-1 bg-secondary rounded-full" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex-1 gradient-primary rounded-full origin-left"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary/10 rounded-full text-tertiary-dark text-sm font-semibold mb-5">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">medical_services</span>
              Étape 3 — L&rsquo;équipe de soin
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface mb-4 leading-[1.2]">
              Qui accompagne votre enfant ?
            </h1>
            <p className="text-on-surface-variant text-lg leading-[1.7]">
              Renseignez les professionnels qui suivent votre enfant. Vous pourrez en ajouter d&rsquo;autres plus tard depuis votre espace.
            </p>
          </div>

          {/* Praticiens list */}
          <div className="space-y-5">
            {praticiens.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`rounded-2xl p-6 transition-all duration-300 ${
                  p.principal
                    ? 'bg-white shadow-[0_4px_24px_rgba(45,55,72,0.07)] border border-outline-variant/15'
                    : 'border-2 border-dashed border-outline-variant/30 bg-surface-low/50'
                }`}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.principal ? 'gradient-primary' : 'bg-surface-high'}`}>
                    <span className={`material-symbols-outlined text-[22px] ${p.principal ? 'text-white' : 'text-outline'}`} aria-hidden="true">
                      medical_services
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface text-sm block leading-tight">
                      {p.principal ? 'Praticien référent' : `Praticien ${i + 1}`}
                    </span>
                    {p.principal && (
                      <span className="text-xs text-primary font-medium">Contact principal de l&rsquo;équipe</span>
                    )}
                    {!p.principal && (
                      <span className="text-xs text-on-surface-variant">Optionnel</span>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Prénom & Nom"
                    placeholder="Ex : Dr Sophie Martin"
                    icon="person"
                    value={p.name}
                    onChange={v => updatePraticien(p.id, 'name', v)}
                  />
                  <div>
                    <label htmlFor={`specialty-${p.id}`} className="text-sm font-semibold text-on-surface mb-2 block">
                      Spécialité
                    </label>
                    <div className="relative">
                      <select
                        id={`specialty-${p.id}`}
                        value={p.specialty}
                        onChange={e => updatePraticien(p.id, 'specialty', e.target.value)}
                        className="w-full appearance-none bg-surface-low border border-transparent rounded-xl py-4 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all duration-300 cursor-pointer leading-relaxed text-[15px]"
                      >
                        <option value="">Sélectionnez une spécialité</option>
                        {specialites.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]" aria-hidden="true">expand_more</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add practitioner */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setPraticiens([...praticiens, { id: praticiens.length + 1, principal: false, name: '', specialty: '' }])}
            className="w-full mt-5 py-4 rounded-2xl border-2 border-dashed border-secondary/30 text-secondary font-semibold flex items-center justify-center gap-2.5 hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-300 cursor-pointer min-h-[56px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            aria-label="Ajouter un praticien supplémentaire"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
            Ajouter un praticien
          </motion.button>

          {/* Final CTA */}
          <div className="mt-10">
            <Button fullWidth size="lg" iconRight="arrow_forward" onClick={handleFinish} disabled={saving}>
              {saving ? 'Finalisation...' : 'Accéder à mon espace'}
            </Button>
            <p className="text-center text-sm text-on-surface-variant mt-4 leading-relaxed">
              Vous pouvez ignorer cette étape et ajouter vos praticiens plus tard.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
