'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase sets the session from the URL hash when user lands from email link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/connexion'), 3000)
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-6 relative">
      <FloatingOrbs variant="subtle" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-12">
          <Link href="/connexion" className="p-2 hover:bg-surface-low rounded-xl transition-colors" aria-label="Retour à la connexion">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </Link>
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-[#7EC8B0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-[#5CB89A]">check_circle</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe modifié !</h1>
              <p className="text-gray-500 mb-4">
                Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la connexion.
              </p>
              <Link href="/connexion" className="text-[#4A90D9] font-medium hover:underline">
                Se connecter maintenant
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
                <p className="text-gray-500 text-sm">
                  Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
                </p>
              </div>

              {!sessionReady && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
                    Si vous arrivez ici via un lien email, votre session sera automatiquement détectée.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="new-password">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    aria-describedby={error ? 'reset-error' : undefined}
                    placeholder="Au moins 8 caractères"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirm-password">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    aria-describedby={error ? 'reset-error' : undefined}
                    placeholder="Répétez votre mot de passe"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#4A90D9]/20 focus:border-[#4A90D9] outline-none transition-all text-gray-900"
                  />
                </div>

                {error && (
                  <p id="reset-error" role="alert" className="text-sm text-red-600 flex items-start gap-1.5 p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                    {error}
                  </p>
                )}

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            password.length >= i * 3
                              ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-[#7EC8B0]' : 'bg-[#5CB89A]'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {password.length < 4 ? 'Trop court' : password.length < 7 ? 'Faible' : password.length < 10 ? 'Bon' : 'Fort'}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  fullWidth
                  size="lg"
                >
                  {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/connexion" className="text-[#4A90D9] hover:underline font-medium">
            Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
