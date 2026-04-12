'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const roles = [
  { id: 'parent', icon: 'family_restroom', label: 'Parent', desc: 'Père ou mère de l\'enfant', color: 'primary' },
  { id: 'coparent', icon: 'diversity_3', label: 'Co-parent', desc: 'Garde partagée', color: 'secondary' },
  { id: 'grandparent', icon: 'elderly', label: 'Grand-parent', desc: 'Famille élargie', color: 'tertiary' },
  { id: 'other', icon: 'volunteer_activism', label: 'Autre aidant', desc: 'Tuteur, famille d\'accueil…', color: 'outline' },
]

const situations = ['Famille monoparentale', 'Couple', 'Famille recomposée', 'Autre']

const steps = [
  { label: 'Votre profil', icon: 'person' },
  { label: 'Votre enfant', icon: 'child_care' },
  { label: 'L\'équipe de soin', icon: 'medical_services' },
]

export default function OnboardingProfilPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedSituation, setSelectedSituation] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleContinue = async () => {
    if (!user) { router.push('/onboarding/enfant'); return }
    setSaving(true)
    try {
      await supabase.from('profiles').update({
        role: selectedRole,
        situation: selectedSituation,
      }).eq('id', user.id)
    } catch {
      // Columns may not exist yet — continue anyway
    }
    setSaving(false)
    router.push('/onboarding/enfant')
  }

  return (
    <div className="min-h-dvh bg-surface relative font-[family-name:var(--font-body)]">
      <FloatingOrbs variant="subtle" />

      {/* ── Progress header ── */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100/60 shadow-[0_1px_8px_rgba(45,55,72,0.04)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" aria-label="Accueil Le Fil">
              <Logo size="sm" />
            </Link>
            {/* Step indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    i === 0
                      ? 'bg-primary/10 text-primary'
                      : 'text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{step.icon}</span>
                    {step.label}
                  </div>
                  {i < steps.length - 1 && <span className="text-outline/40 text-xs">›</span>}
                </div>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant font-medium sm:hidden">Étape 1 sur 3</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-surface-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de l'onboarding : étape 1 sur 3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '33.33%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full gradient-primary rounded-full"
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 rounded-full text-primary text-sm font-semibold mb-5">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">waving_hand</span>
              Bienvenue sur Le Fil
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface mb-4 leading-[1.2]">
              Parlons un peu de vous
            </h1>
            <p className="text-on-surface-variant text-lg leading-[1.7]">
              Ces informations nous permettront de personnaliser votre espace et de mieux vous accompagner au quotidien.
            </p>
          </div>

          {/* ── Role Selection ── */}
          <div className="mb-10">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5 block">
              Quel est votre rôle ?
            </label>
            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Sélectionnez votre rôle">
              {roles.map((role, i) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role.id)}
                  role="radio"
                  aria-checked={selectedRole === role.id}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary-fixed/30 shadow-lg shadow-primary/8'
                      : 'border-outline-variant/20 bg-surface-card hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all ${
                    selectedRole === role.id ? 'gradient-primary' : 'bg-surface-low'
                  }`}>
                    <span className={`material-symbols-outlined text-[24px] ${
                      selectedRole === role.id ? 'text-white' : 'text-on-surface-variant'
                    }`} aria-hidden="true">{role.icon}</span>
                  </div>
                  <span className={`font-bold text-sm block mb-1 ${selectedRole === role.id ? 'text-primary' : 'text-on-surface'}`}>
                    {role.label}
                  </span>
                  <span className="text-xs text-on-surface-variant leading-relaxed">{role.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Situation familiale ── */}
          <div className="mb-12">
            <label htmlFor="situation" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 block">
              Situation familiale
            </label>
            <div className="relative">
              <select
                id="situation"
                value={selectedSituation}
                onChange={e => setSelectedSituation(e.target.value)}
                className="w-full appearance-none bg-surface-low border border-transparent rounded-xl py-4 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all duration-300 cursor-pointer leading-relaxed text-[15px]"
                aria-label="Sélectionnez votre situation familiale"
              >
                <option value="">Sélectionnez votre situation</option>
                {situations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" aria-hidden="true">expand_more</span>
            </div>
          </div>

          {/* ── CTA ── */}
          <Button
            fullWidth
            size="lg"
            iconRight="arrow_forward"
            onClick={handleContinue}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Continuer'}
          </Button>

          <p className="text-center text-sm text-on-surface-variant mt-5 leading-relaxed">
            Vous pourrez modifier ces informations dans vos paramètres.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
