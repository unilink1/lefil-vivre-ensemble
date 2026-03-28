'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'

/** Compute password strength: 0 = empty, 1 = weak, 2 = medium, 3 = strong */
function getPasswordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasMinLength = pw.length >= 8
  const checks = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length
  if (checks <= 2) return { score: 1, label: 'Faible', color: 'bg-error' }
  if (checks === 3) return { score: 2, label: 'Moyen', color: 'bg-yellow-500' }
  return { score: 3, label: 'Fort', color: 'bg-secondary' }
}

export default function InscriptionPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Prevent double-submit
    if (loading) return

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("L'adresse email n'est pas valide.")
      return
    }

    // Password strength validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre minuscule.')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre majuscule.')
      return
    }
    if (!/\d/.test(password)) {
      setError('Le mot de passe doit contenir au moins un chiffre.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!accepted) {
      setError('Veuillez accepter les conditions générales.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, firstName, lastName)
    setLoading(false)

    if (error) {
      if (error.includes('already registered')) {
        setError('Un compte existe déjà avec cet email.')
      } else {
        setError(error)
      }
    } else {
      router.push('/onboarding/profil')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left - Hero */}
      <div className="relative lg:w-1/2 gradient-hero p-6 sm:p-10 lg:p-16 flex flex-col justify-center overflow-hidden min-h-[220px] sm:min-h-[300px] lg:min-h-dvh">
        <FloatingOrbs variant="auth" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          <Link href="/" className="mb-12 inline-block">
            <Logo size="lg" white />
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            Prendre soin,{' '}
            <span className="text-primary-fixed">ensemble.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Un espace apaisé pour coordonner les soins et partager le quotidien en toute sérénité.
          </p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-5 sm:p-8 lg:p-16 bg-surface relative">
        <FloatingOrbs variant="subtle" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-2">
            Rejoignez-nous
          </h2>
          <p className="text-on-surface-variant mb-10">
            Créez votre compte pour commencer votre parcours.
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" placeholder="Marie" icon="person" required value={firstName} onChange={setFirstName} />
              <Input label="Nom" placeholder="Dupont" required value={lastName} onChange={setLastName} />
            </div>
            <Input label="Email" type="email" placeholder="votre@email.com" icon="mail" required value={email} onChange={setEmail} />
            <div>
              <Input label="Mot de passe" type="password" placeholder="Min. 8 caractères" icon="lock" required value={password} onChange={setPassword} />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score === 1 ? 'text-error' :
                      passwordStrength.score === 2 ? 'text-yellow-600' :
                      'text-secondary'
                    }`}>{passwordStrength.label}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre</p>
                </div>
              )}
            </div>
            <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" icon="lock" required value={confirmPassword} onChange={setConfirmPassword} />

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-primary" />
              <span className="text-sm text-on-surface-variant leading-relaxed">
                J&apos;accepte les{' '}
                <Link href="#" className="text-primary font-medium hover:underline">conditions générales</Link>
                {' '}et la{' '}
                <Link href="#" className="text-primary font-medium hover:underline">politique de confidentialité</Link>
              </span>
            </label>

            <Button type="submit" fullWidth iconRight="arrow_forward" size="lg" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon espace'}
            </Button>
          </form>

          <p className="text-center text-on-surface-variant mt-10">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-primary font-semibold hover:text-primary-container transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
