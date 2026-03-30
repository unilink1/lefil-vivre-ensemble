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

const specialites = ['Orthophoniste', 'Psychomotricien', 'Ergothérapeute', 'Psychologue', 'Pédopsychiatre', 'Neuropédiatre', 'Kinésithérapeute', 'Éducateur spécialisé', 'Pédiatre', 'Autre']

export default function OnboardingPraticiensPage() {
  const [praticiens, setPraticiens] = useState([{ id: 1, principal: true, name: '', specialty: '' }, { id: 2, principal: false, name: '', specialty: '' }])
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
      // Get the child created in previous step
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      const childId = children?.[0]?.id

      // Save practitioners
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

      // Mark onboarding complete
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
    } catch {
      // Tables may not exist yet — continue anyway
    }
    setSaving(false)
    router.push('/dashboard/profil')
  }

  return (
    <div className="min-h-dvh bg-surface relative">
      <FloatingOrbs variant="subtle" />

      {/* Progress */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/onboarding/enfant" className="p-1.5 hover:bg-surface-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
            </Link>
            <span className="text-xs text-on-surface-variant font-medium">Étape 3 sur 3</span>
          </div>
          <div className="h-1.5 bg-surface-high rounded-full overflow-hidden flex gap-1">
            <div className="flex-1 bg-secondary rounded-full" />
            <div className="flex-1 bg-secondary rounded-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} className="flex-1 gradient-primary rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-3">
            Qui suit votre enfant ?
          </h1>
          <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
            Renseignez les professionnels de santé qui accompagnent votre enfant au quotidien. Vous pourrez en ajouter d&apos;autres plus tard.
          </p>

          <div className="space-y-6">
            {praticiens.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 transition-all ${
                  p.principal
                    ? 'bg-surface-card shadow-[0_8px_32px_rgba(26,28,27,0.04)] border border-outline-variant/10'
                    : 'border-2 border-dashed border-outline-variant/30 bg-surface-low/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.principal ? 'gradient-primary' : 'bg-surface-high'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${p.principal ? 'text-white' : 'text-outline'}`}>medical_services</span>
                  </div>
                  <div>
                    <span className="font-semibold text-on-surface text-sm">
                      {p.principal ? 'Praticien principal' : `Praticien ${i + 1}`}
                    </span>
                    {p.principal && <span className="text-xs text-primary block">Contact Référent</span>}
                  </div>
                </div>
                <div className="space-y-4">
                  <Input label="Prénom & Nom" placeholder="ex: Dr. Sophie Martin" icon="person" value={p.name} onChange={v => updatePraticien(p.id, 'name', v)} />
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-2 block">Spécialité</label>
                    <div className="relative">
                      <select value={p.specialty} onChange={e => updatePraticien(p.id, 'specialty', e.target.value)} className="w-full appearance-none bg-surface-low rounded-xl py-3.5 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-sm">
                        <option value="">Sélectionnez</option>
                        {specialites.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setPraticiens([...praticiens, { id: praticiens.length + 1, principal: false, name: '', specialty: '' }])}
            className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-secondary/30 text-secondary font-semibold flex items-center justify-center gap-2 hover:border-secondary/50 hover:bg-secondary/5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Ajouter un praticien
          </motion.button>

          <div className="mt-10">
            <Button fullWidth size="lg" iconRight="arrow_forward" onClick={handleFinish} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Accéder à mon espace'}
            </Button>
            <p className="text-center text-xs text-outline mt-4">Dernière étape de configuration</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
