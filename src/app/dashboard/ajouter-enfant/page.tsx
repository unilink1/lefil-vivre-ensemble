'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const diagnostics = ['TSA', 'TDAH', 'Troubles DYS', 'Handicap moteur', 'Handicap sensoriel', 'Deficience intellectuelle', 'Maladie chronique', 'Autre', 'Pas encore de diagnostic']

export default function AjouterEnfantPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!user || !firstName.trim()) {
      setError('Le prenom est obligatoire.')
      return
    }

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('children').insert({
      parent_id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: birthDate || new Date().toISOString().split('T')[0],
      diagnosis_primary: diagnostic || null,
    })

    if (insertError) {
      setError('Erreur: ' + insertError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)

    // Redirect after short delay to let the user see the success message
    setTimeout(() => {
      window.location.href = '/dashboard/enfant'
    }, 1000)
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: 'Ajouter un enfant', href: '#' }]}>
      <div className="max-w-lg mx-auto py-8">

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#4A90D9]/10 to-[#7EC8B0]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4A90D9] text-[36px]">child_care</span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface mb-2">Ajouter un enfant</h1>
          <p className="text-on-surface-variant">Renseignez les informations de votre enfant. Vous pourrez completer son profil par la suite.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Enfant ajoute avec succes ! Redirection...
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

          <div>
            <label className="text-sm font-semibold text-on-surface mb-2 block">Prenom *</label>
            <input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="ex: Lucas"
              className="w-full py-3.5 px-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] text-[15px]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface mb-2 block">Nom</label>
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="ex: Dupont"
              className="w-full py-3.5 px-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] text-[15px]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface mb-2 block">Date de naissance</label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full py-3.5 px-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] text-[15px]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-on-surface mb-2 block">Diagnostic principal</label>
            <select
              value={diagnostic}
              onChange={e => setDiagnostic(e.target.value)}
              className="w-full py-3.5 px-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] text-[15px] cursor-pointer"
            >
              <option value="">Selectionnez...</option>
              {diagnostics.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || success || !firstName.trim()}
            className="w-full py-4 rounded-xl bg-[#4A90D9] text-white font-semibold text-lg cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? 'Enregistrement...' : success ? 'Ajoute !' : 'Ajouter cet enfant'}
          </button>
        </div>

        <div className="text-center mt-6">
          <a href="/dashboard/profil" className="text-sm text-on-surface-variant hover:text-[#4A90D9] transition-colors">
            &larr; Retour au tableau de bord
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
