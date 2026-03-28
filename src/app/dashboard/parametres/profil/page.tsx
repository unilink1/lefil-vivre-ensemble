'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

export default function ParametresProfilPage() {
  const { user, profile, loading, refreshProfile } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setEmail(profile.email || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const initials = getInitials(
    firstName || profile?.first_name,
    lastName || profile?.last_name
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
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

  if (loading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Parametres', href: '/dashboard/parametres' }, { label: 'Mon profil', href: '#' }]}>
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
    <DashboardLayout breadcrumb={[{ label: 'Parametres', href: '/dashboard/parametres' }, { label: 'Mon profil', href: '#' }]}>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-8">Mon profil</h1>

          {/* Avatar */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-3 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/15">
              {initials}
            </div>
            <button className="text-sm text-primary font-medium hover:underline cursor-pointer">
              Modifier votre photo de profil
            </button>
          </div>

          <Card padding="lg">
            <form className="space-y-5" onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prenom"
                  value={firstName}
                  onChange={(v) => setFirstName(v)}
                  icon="person"
                />
                <Input
                  label="Nom"
                  value={lastName}
                  onChange={(v) => setLastName(v)}
                />
              </div>
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  icon="mail"
                />
                <span className="material-symbols-outlined absolute right-4 top-8 text-secondary text-[18px]">verified</span>
              </div>
              <Input
                label="Telephone"
                type="tel"
                value={phone}
                onChange={(v) => setPhone(v)}
                icon="phone"
              />

              <div className="bg-primary-fixed/20 rounded-2xl p-4 flex items-start gap-3 mt-4">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Vos informations sont collectees pour la gestion de votre espace et ne seront jamais partagees a des fins commerciales.
                </p>
              </div>

              {saveSuccess && (
                <div className="bg-secondary-container/30 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  <p className="text-sm text-secondary font-medium">Modifications enregistrees avec succes !</p>
                </div>
              )}

              {saveError && (
                <div className="bg-error-container/30 rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[20px]">error</span>
                  <p className="text-sm text-error font-medium">{saveError}</p>
                </div>
              )}

              <Button type="submit" fullWidth size="lg" iconRight={saving ? undefined : 'check'} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </Card>

          <div className="text-center mt-10">
            <Link href="#" className="text-sm text-error font-medium hover:underline">
              Supprimer mon compte
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
