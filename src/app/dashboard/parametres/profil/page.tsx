'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

function getInitialsFromName(fullName?: string | null): string {
  if (!fullName) return '??'
  const parts = fullName.trim().split(/\s+/)
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??'
}

export default function ParametresProfilPage() {
  const { user, profile, loading, refreshProfile } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setEmail(profile.email || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const initials = getInitialsFromName(fullName || profile?.full_name)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      setSaveError(error.message)
    } else {
      setSaveSuccess(true)
      await refreshProfile()
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (dataUrl: string) => {
    if (!user) return
    await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', user.id)
    await refreshProfile()
  }

  if (loading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Parametres', href: '/dashboard/parametres' }, { label: 'Mon profil', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#4A90D9]/30 border-t-[#4A90D9] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Parametres', href: '/dashboard/parametres' }, { label: 'Mon profil', href: '#' }]}>
      <div className="max-w-lg mx-auto py-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-8">Mon profil</h1>

        {/* Avatar */}
        <div className="text-center mb-10">
          <AvatarUpload
            currentUrl={profile?.avatar_url}
            initials={initials}
            onUpload={handleAvatarUpload}
          />
          <p className="text-xs text-gray-400 mt-3">Cliquez sur l&apos;icone pour changer la photo</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-7 space-y-6">

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Nom complet</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Prenom et nom"
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
            <input
              value={email}
              disabled
              className="w-full py-3 px-4 bg-gray-100 border border-gray-200 text-[15px] text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas etre modifie</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Telephone</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="06 00 00 00 00"
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 text-[15px] outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] transition-all"
            />
          </div>

          <div className="bg-[#4A90D9]/5 border border-[#4A90D9]/10 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#4A90D9] text-[20px] mt-0.5">info</span>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vos informations sont collectees pour la gestion de votre espace et ne seront jamais partagees a des fins commerciales.
            </p>
          </div>

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
              <p className="text-sm text-green-700 font-medium">Modifications enregistrees !</p>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <p className="text-sm text-red-600 font-medium">{saveError}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-[#4A90D9] text-white font-semibold cursor-pointer hover:bg-[#3a7bc8] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

        <div className="text-center mt-8">
          <Link href="#" className="text-sm text-red-500 font-medium hover:underline">
            Supprimer mon compte
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
