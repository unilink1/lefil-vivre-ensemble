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
const genres = ['Masculin', 'Féminin', 'Autre']
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
    <div className="min-h-dvh bg-surface relative">
      <FloatingOrbs variant="subtle" />

      {/* Progress */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/onboarding/profil" className="p-1.5 hover:bg-surface-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
            </Link>
            <span className="text-xs text-on-surface-variant font-medium">Étape 2 sur 3</span>
          </div>
          <div className="h-1.5 bg-surface-high rounded-full overflow-hidden flex gap-1">
            <div className="flex-1 bg-secondary rounded-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} className="flex-1 gradient-primary rounded-full" />
            <div className="flex-1 bg-surface-high rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-3">
            Présentez-nous votre enfant
          </h1>
          <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
            Aidez-nous à mieux comprendre ses besoins pour personnaliser son parcours de soin.
          </p>

          {/* Photo Upload */}
          <motion.div whileHover={{ scale: 1.03 }} className="w-28 h-28 mx-auto mb-10 rounded-full border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary-fixed/10 transition-all">
            <span className="material-symbols-outlined text-outline text-[28px]">add_a_photo</span>
            <span className="text-[10px] text-outline mt-1">Photo</span>
          </motion.div>

          <form className="space-y-6">
            <Input label="Prénom" placeholder="Ex: Lucas" icon="child_care" required value={childName} onChange={v => setChildName(v)} />
            <Input label="Date de naissance" type="date" icon="cake" required value={birthDate} onChange={v => setBirthDate(v)} />

            {/* Genre */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block">Genre</label>
              <div className="flex gap-3">
                {genres.map(g => (
                  <motion.button
                    key={g}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setGenre(g)}
                    className={`flex-1 py-3.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                      genre === g
                        ? 'gradient-primary text-white shadow-lg shadow-primary/15'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >{g[0]}</motion.button>
                ))}
              </div>
            </div>

            {/* Diagnostic */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block">Diagnostic principal</label>
              <div className="relative">
                <select value={diagnostic} onChange={e => setDiagnostic(e.target.value)} className="w-full appearance-none bg-surface-low rounded-xl py-4 px-5 text-on-surface outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="">Sélectionnez</option>
                  {diagnostics.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Scolarisation */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-3 block">Scolarisation</label>
              <div className="grid grid-cols-2 gap-3">
                {scolarisations.map(s => (
                  <motion.button
                    key={s}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScolarisation(s)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer text-center ${
                      scolarisation === s
                        ? 'gradient-primary text-white shadow-lg shadow-primary/15'
                        : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                    }`}
                  >{s}</motion.button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button fullWidth size="lg" iconRight="arrow_forward" onClick={handleContinue} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Continuer'}
              </Button>
              <p className="text-center text-xs text-outline mt-4">Vous pourrez modifier ces informations plus tard.</p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
