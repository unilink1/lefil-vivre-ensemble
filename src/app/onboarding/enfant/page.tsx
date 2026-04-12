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

const diagnostics = ['TSA', 'TDAH', 'Troubles DYS', 'Handicap moteur', 'Handicap sensoriel', 'Déficience intellectuelle', 'Maladie chronique', 'Autre', 'Pas encore de diagnostic']
const genres = [
  { label: 'Masculin', short: '♂', value: 'Masculin' },
  { label: 'Féminin', short: '♀', value: 'Féminin' },
  { label: 'Autre', short: '⚬', value: 'Autre' },
]
const scolarisations = ['Milieu ordinaire', 'Dispositif ULIS', 'Établissement spécialisé', 'Non scolarisé']

export default function OnboardingEnfantPage() {
  const [genre, setGenre] = useState<string | null>(null)
  const [scolarisation, setScolarisation] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleContinue = async () => {
    if (!user) { router.push('/onboarding/praticiens'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('children').insert({
        parent_id: user.id,
        first_name: childName || 'Enfant',
        last_name: '',
        birth_date: birthDate || new Date().toISOString().split('T')[0],
        diagnosis_primary: diagnostic || null,
      })
      if (error) console.error('Child insert error:', error.message)
    } catch (e) {
      console.error('Child insert exception:', e)
    }
    setSaving(false)
    router.push('/onboarding/praticiens')
  }

  return (
    <div className="min-h-dvh bg-surface relative font-[family-name:var(--font-body)]">
      <FloatingOrbs variant="subtle" />

      {/* ── Progress header ── */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100/60 shadow-[0_1px_8px_rgba(45,55,72,0.04)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/onboarding/profil"
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] px-2 rounded-lg hover:bg-surface-low focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Retour à l'étape précédente"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
              <span className="text-sm font-medium hidden sm:inline">Votre profil</span>
            </Link>
            <span className="text-xs text-on-surface-variant font-semibold">Étape 2 sur 3</span>
          </div>
          {/* Segmented progress */}
          <div className="flex gap-1.5 h-2" role="progressbar" aria-valuenow={66} aria-valuemin={0} aria-valuemax={100} aria-label="Progression : étape 2 sur 3">
            <div className="flex-1 bg-secondary rounded-full" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex-1 gradient-primary rounded-full origin-left"
            />
            <div className="flex-1 bg-surface-high rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-semibold mb-5">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">child_care</span>
              Étape 2 — Votre enfant
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface mb-4 leading-[1.2]">
              Présentez-nous votre enfant
            </h1>
            <p className="text-on-surface-variant text-lg leading-[1.7]">
              Aidez-nous à mieux comprendre ses besoins pour personnaliser son parcours d&rsquo;accompagnement.
            </p>
          </div>

          {/* Photo placeholder */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-28 h-28 mx-auto mb-10 rounded-full border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary-fixed/10 transition-all duration-300"
            role="button"
            tabIndex={0}
            aria-label="Ajouter une photo de votre enfant (optionnel)"
          >
            <span className="material-symbols-outlined text-outline text-[28px] mb-1" aria-hidden="true">add_a_photo</span>
            <span className="text-[10px] text-outline font-medium">Photo</span>
          </motion.div>

          <form className="space-y-7" onSubmit={e => e.preventDefault()}>
            <Input label="Prénom de votre enfant" placeholder="Ex : Lucas" icon="child_care" required value={childName} onChange={v => setChildName(v)} />
            <Input label="Date de naissance" type="date" icon="cake" required value={birthDate} onChange={v => setBirthDate(v)} />

            {/* Genre */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 block">
                Genre
              </label>
              <div className="flex gap-3" role="radiogroup" aria-label="Genre">
                {genres.map(g => (
                  <motion.button
                    key={g.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setGenre(g.value)}
                    role="radio"
                    aria-checked={genre === g.value}
                    className={`flex-1 py-4 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      genre === g.value
                        ? 'gradient-primary text-white shadow-md shadow-primary/15'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >
                    <span className="block text-base mb-0.5" aria-hidden="true">{g.short}</span>
                    <span className="text-xs">{g.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Diagnostic */}
            <div>
              <label htmlFor="diagnostic" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 block">
                Diagnostic principal
              </label>
              <div className="relative">
                <select
                  id="diagnostic"
                  value={diagnostic}
                  onChange={e => setDiagnostic(e.target.value)}
                  className="w-full appearance-none bg-surface-low border border-transparent rounded-xl py-4 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all duration-300 cursor-pointer leading-relaxed text-[15px]"
                >
                  <option value="">Sélectionnez ou laissez vide</option>
                  {diagnostics.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" aria-hidden="true">expand_more</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Optionnel — vous pourrez compléter ou modifier cette information plus tard.
              </p>
            </div>

            {/* Scolarisation */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 block">
                Scolarisation
              </label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Modalité de scolarisation">
                {scolarisations.map(s => (
                  <motion.button
                    key={s}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScolarisation(s)}
                    role="radio"
                    aria-checked={scolarisation === s}
                    className={`py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      scolarisation === s
                        ? 'gradient-primary text-white shadow-md shadow-primary/15'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Button fullWidth size="lg" iconRight="arrow_forward" onClick={handleContinue} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Continuer'}
              </Button>
              <p className="text-center text-sm text-on-surface-variant mt-4 leading-relaxed">
                Vous pourrez modifier ces informations plus tard dans les paramètres.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
