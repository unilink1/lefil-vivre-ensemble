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
  { id: 'parent', icon: 'family_restroom', label: 'Parent', color: 'primary' },
  { id: 'coparent', icon: 'diversity_3', label: 'Co-parent', color: 'secondary' },
  { id: 'grandparent', icon: 'elderly', label: 'Grand-parent', color: 'tertiary' },
  { id: 'other', icon: 'volunteer_activism', label: 'Autre aidant', color: 'outline' },
]

const situations = ['Famille monoparentale', 'Couple', 'Famille recomposée', 'Autre']

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
    <div className="min-h-dvh bg-surface relative">
      <FloatingOrbs variant="subtle" />

      {/* Progress */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <span className="text-xs text-on-surface-variant font-medium">Étape 1 sur 3</span>
          </div>
          <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '33.33%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full gradient-primary rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-3">
            Bienvenue sur Le Fil
          </h1>
          <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
            Quelques informations pour personnaliser votre espace et mieux vous accompagner.
          </p>

          {/* Role Selection */}
          <div className="mb-10">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4 block">
              Votre rôle
            </label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role, i) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary-fixed/30 shadow-lg shadow-primary/8'
                      : 'border-outline-variant/20 bg-surface-card hover:border-primary/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    selectedRole === role.id ? 'gradient-primary' : 'bg-surface-low'
                  }`}>
                    <span className={`material-symbols-outlined text-[24px] ${
                      selectedRole === role.id ? 'text-white' : 'text-on-surface-variant'
                    }`}>{role.icon}</span>
                  </div>
                  <span className={`font-semibold ${selectedRole === role.id ? 'text-primary' : 'text-on-surface'}`}>
                    {role.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Situation */}
          <div className="mb-12">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-4 block">
              Situation familiale
            </label>
            <div className="relative">
              <select value={selectedSituation} onChange={e => setSelectedSituation(e.target.value)} className="w-full appearance-none bg-surface-low rounded-xl py-4 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                <option value="">Sélectionnez une option</option>
                {situations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <Button fullWidth size="lg" iconRight="arrow_forward" onClick={handleContinue} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Continuer'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
