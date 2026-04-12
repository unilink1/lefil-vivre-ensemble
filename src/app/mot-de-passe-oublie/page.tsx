'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-dvh bg-surface-warm flex items-center justify-center p-6 relative font-[family-name:var(--font-body)]">
      <FloatingOrbs variant="subtle" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top nav */}
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/connexion"
            className="p-2.5 hover:bg-surface-low rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Retour à la connexion"
          >
            <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">arrow_back</span>
          </Link>
          <Link href="/" aria-label="Accueil Le Fil">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Animated icon */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto mb-8 bg-primary-fixed rounded-2xl flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-primary text-[36px]">
            {sent ? 'mark_email_read' : 'lock_reset'}
          </span>
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_48px_rgba(45,55,72,0.08)] border border-gray-100/60 mb-6">
          {sent ? (
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface mb-4 leading-tight">
                Email envoyé avec succès !
              </h2>
              <p className="text-on-surface-variant leading-[1.7] mb-8">
                Un lien de réinitialisation a été envoyé à{' '}
                <strong className="text-on-surface">{email}</strong>.
                Vérifiez votre boîte de réception et vos spams.
              </p>
              <Link href="/connexion">
                <Button fullWidth variant="outline" size="lg">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface text-center mb-3 leading-tight">
                Mot de passe oublié ?
              </h2>
              <p className="text-on-surface-variant text-center mb-8 leading-[1.7]">
                Indiquez votre adresse email et nous vous enverrons un lien pour créer un nouveau mot de passe.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-error-container border border-error/20 rounded-2xl text-sm text-error font-medium flex items-center gap-2.5"
                  role="alert"
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">info</span>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  icon="mail"
                  required
                  value={email}
                  onChange={setEmail}
                />
                <Button type="submit" fullWidth iconRight="arrow_forward" size="lg" disabled={loading}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </form>

              <Link
                href="/connexion"
                className="flex items-center justify-center gap-1.5 text-sm text-primary font-semibold mt-7 hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
