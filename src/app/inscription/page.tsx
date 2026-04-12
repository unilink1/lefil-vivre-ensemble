'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

/** Compute password strength: 0 = empty, 1 = weak, 2 = medium, 3 = strong */
function getPasswordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string; colorClass: string; barColor: string } {
  if (!pw) return { score: 0, label: '', colorClass: '', barColor: '' }
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasMinLength = pw.length >= 8
  const checks = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length
  if (checks <= 2) return { score: 1, label: 'Faible', colorClass: 'text-error', barColor: 'bg-error' }
  if (checks === 3) return { score: 2, label: 'Moyen', colorClass: 'text-warning', barColor: 'bg-warning' }
  return { score: 3, label: 'Fort', colorClass: 'text-success', barColor: 'bg-success' }
}

export default function InscriptionPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const passwordStrength = getPasswordStrength(password)

  const handleSignUp = async () => {
    setError('')
    if (loading) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("L'adresse email n'est pas valide.")
      return
    }
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
      setError('Veuillez accepter les conditions générales pour continuer.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password, firstName, lastName)
    setLoading(false)

    if (signUpError) {
      if (signUpError.includes('already registered')) {
        setError('Un compte existe déjà avec cet email. Essayez de vous connecter.')
      } else {
        setError(signUpError)
      }
    } else {
      window.location.href = '/onboarding/profil'
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row font-[family-name:var(--font-body)]">

      {/* ── Left hero panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-center overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #7EC8B0 0%, #5bb89a 45%, #4A90D9 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 px-12 xl:px-20 max-w-lg">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-14 group" aria-label="Retour à l'accueil Le Fil">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
            >
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="50" cy="22" r="7" fill="white"/>
                <path d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Le Fil</span>
          </Link>

          <h1 className="font-[family-name:var(--font-heading)] text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-6">
            Rejoignez{' '}
            <span className="text-white/70">la communauté.</span>
          </h1>
          <p className="text-white/75 text-lg leading-[1.7] mb-12">
            Créez votre espace de coordination pour faciliter le suivi et le partage au quotidien de votre enfant atypique.
          </p>

          {/* Engagement points */}
          <div className="space-y-4">
            {[
              { icon: 'shield', text: 'Données sécurisées et confidentielles' },
              { icon: 'group', text: 'Partagez avec toute l\'équipe de soin' },
              { icon: 'favorite', text: 'Conçu avec et pour les familles' },
            ].map(item => (
              <div key={item.icon} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="material-symbols-outlined text-white text-[18px]" aria-hidden="true">{item.icon}</span>
                </div>
                <span className="text-white/85 text-sm leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Pill badges */}
          <div className="flex flex-wrap gap-3 mt-10">
            {['Gratuit', 'Sécurisé', 'Collaboratif'].map((item) => (
              <span
                key={item}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-8 lg:p-16 bg-surface-warm relative overflow-y-auto">

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Accueil Le Fil">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7EC8B0, #4A90D9)' }}
            >
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="50" cy="22" r="7" fill="white"/>
                <path d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
            <span className="text-on-surface font-bold text-base">Le Fil</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-16 lg:mt-0">

          {/* Card form */}
          <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(45,55,72,0.08)] border border-gray-100/60 p-8 sm:p-10">

            <div className="mb-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-on-surface mb-2 leading-tight">
                Créer votre compte
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Commencez votre parcours de coordination en quelques instants.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="mb-6 p-4 rounded-2xl text-sm font-medium flex items-start gap-3 bg-error-container border border-error/20 text-error leading-relaxed"
                role="alert"
                aria-live="polite"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" aria-hidden="true">info</span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-on-surface mb-2">
                    Prénom <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Marie"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                    className="w-full h-12 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-on-surface mb-2">
                    Nom <span className="text-error" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    autoComplete="family-name"
                    required
                    className="w-full h-12 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-2">
                  Adresse email <span className="text-error" aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full h-12 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-on-surface mb-2">
                  Mot de passe <span className="text-error" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 caractères"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    aria-describedby="password-strength"
                    className="w-full h-12 pl-4 pr-12 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-outline hover:text-primary transition-colors rounded-lg"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {password && (
                  <div id="password-strength" className="mt-2.5" aria-live="polite">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="flex-1 h-1.5 bg-surface-low rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={passwordStrength.score}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${passwordStrength.barColor}`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${passwordStrength.colorClass}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-on-surface mb-2">
                  Confirmer le mot de passe <span className="text-error" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Retapez votre mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full h-12 pl-4 pr-12 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-outline hover:text-primary transition-colors rounded-lg"
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirmPassword && password && confirmPassword !== password && (
                  <p className="text-xs text-error mt-1.5 leading-relaxed" role="alert">
                    Les mots de passe ne correspondent pas encore.
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3.5 cursor-pointer pt-1 group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={e => setAccepted(e.target.checked)}
                    className="sr-only"
                    aria-label="Accepter les conditions générales et la politique de confidentialité"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      accepted ? 'bg-secondary border-secondary' : 'border-outline-variant group-hover:border-primary/50'
                    }`}
                  >
                    {accepted && (
                      <span className="material-symbols-outlined text-white text-[14px]" aria-hidden="true">check</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-on-surface-variant leading-relaxed">
                  J&rsquo;accepte les{' '}
                  <Link href="#" className="font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline">
                    conditions générales
                  </Link>
                  {' '}et la{' '}
                  <Link href="#" className="font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline">
                    politique de confidentialité
                  </Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                onClick={handleSignUp}
                disabled={loading || !firstName || !lastName || !email || !password || !confirmPassword}
                className="w-full h-13 rounded-xl text-white font-semibold text-base cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2.5 mt-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                style={{
                  background: loading ? 'linear-gradient(135deg, #a0d4c2, #7EC8B0)' : 'linear-gradient(135deg, #7EC8B0 0%, #4A90D9 100%)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(126, 200, 176, 0.30)',
                }}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création de votre espace...
                  </>
                ) : (
                  <>
                    Créer mon espace
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Login link */}
          <p className="text-center text-on-surface-variant mt-8 text-sm leading-relaxed">
            Déjà inscrit ?{' '}
            <Link
              href="/connexion"
              className="font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
