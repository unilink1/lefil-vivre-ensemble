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
    <div className="min-h-dvh bg-surface flex items-center justify-center p-6 relative">
      <FloatingOrbs variant="subtle" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-12">
          <Link href="/connexion" className="p-2 hover:bg-surface-low rounded-xl transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </Link>
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto mb-8 bg-primary-fixed rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-primary text-[36px]">{sent ? 'mark_email_read' : 'lock_reset'}</span>
        </motion.div>

        <div className="bg-surface-card rounded-2xl p-8 shadow-md border border-outline-variant/20 mb-6">
          {sent ? (
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface mb-3">Email envoyé !</h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
              </p>
              <Link href="/connexion">
                <Button fullWidth variant="outline">Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface text-center mb-3">
                Mot de passe oublié ?
              </h2>
              <p className="text-on-surface-variant text-center mb-8 leading-relaxed text-[15px]">
                Un email vous sera envoyé avec un lien de réinitialisation.
              </p>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Adresse email" type="email" placeholder="votre@email.com" icon="mail" required value={email} onChange={setEmail} />
                <Button type="submit" fullWidth iconRight="arrow_forward" size="lg" disabled={loading}>
                  {loading ? 'Envoi...' : 'Réinitialiser'}
                </Button>
              </form>

              <Link href="/connexion" className="block text-center text-primary font-medium mt-6 hover:text-primary-container transition-colors">
                Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
