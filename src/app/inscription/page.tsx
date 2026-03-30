'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

/** Compute password strength: 0 = empty, 1 = weak, 2 = medium, 3 = strong */
function getPasswordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string; color: string; barColor: string } {
  if (!pw) return { score: 0, label: '', color: '', barColor: '' }
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasMinLength = pw.length >= 8
  const checks = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length
  if (checks <= 2) return { score: 1, label: 'Faible', color: 'text-red-500', barColor: 'bg-red-500' }
  if (checks === 3) return { score: 2, label: 'Moyen', color: 'text-yellow-500', barColor: 'bg-yellow-500' }
  return { score: 3, label: 'Fort', color: 'text-green-500', barColor: 'bg-green-500' }
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

  const handleSignUp = async () => {
    setError('')
    if (loading) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("L'adresse email n'est pas valide.")
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
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
      setError('Veuillez accepter les conditions generales.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password, firstName, lastName)
    setLoading(false)

    if (signUpError) {
      if (signUpError.includes('already registered')) {
        setError('Un compte existe deja avec cet email.')
      } else {
        setError(signUpError)
      }
    } else {
      router.push('/onboarding/profil')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left - Decorative Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7EC8B0 0%, #5bb89a 40%, #4A90D9 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] rounded-full opacity-5 bg-white" />

        <div className="relative z-10 px-12 xl:px-20 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
            >
              LF
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-tight">Le Fil</span>
          </Link>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Rejoignez{' '}
            <span className="text-white/70">la communaute.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Creez votre espace de coordination pour faciliter le suivi et le partage au quotidien.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Gratuit', 'Securise', 'Collaboratif'].map((item) => (
              <span
                key={item}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/90"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-[#f8fafb] relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #7EC8B0, #4A90D9)' }}
            >
              LF
            </div>
            <span className="text-gray-700 font-semibold">Le Fil</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-12 lg:mt-0">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Creer votre compte
            </h2>
            <p className="text-gray-500 mb-8">
              Commencez votre parcours de coordination en quelques instants.
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom</label>
                  <input
                    type="text"
                    placeholder="Marie"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Min. 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.barColor}`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Min. 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="Retapez votre mot de passe"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  style={{ accentColor: '#4A90D9' }}
                />
                <span className="text-sm text-gray-500 leading-relaxed">
                  J&apos;accepte les{' '}
                  <Link href="#" className="font-medium hover:underline" style={{ color: '#4A90D9' }}>conditions generales</Link>
                  {' '}et la{' '}
                  <Link href="#" className="font-medium hover:underline" style={{ color: '#4A90D9' }}>politique de confidentialite</Link>
                </span>
              </label>

              {/* Submit button */}
              <button
                onClick={handleSignUp}
                disabled={loading || !firstName || !lastName || !email || !password || !confirmPassword}
                className="w-full h-12 rounded-xl text-white font-semibold text-[15px] shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                style={{
                  background: loading ? '#8cc4ad' : 'linear-gradient(135deg, #7EC8B0 0%, #4A90D9 100%)',
                  boxShadow: '0 4px 14px rgba(126, 200, 176, 0.35)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creation en cours...
                  </>
                ) : (
                  <>
                    Creer mon espace
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center text-gray-500 mt-8 text-sm">
            Deja inscrit ?{' '}
            <Link href="/connexion" className="font-semibold hover:underline" style={{ color: '#4A90D9' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
