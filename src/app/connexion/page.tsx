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

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error)
    } else {
      router.push('/dashboard/profil')
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
            Coordonner l&apos;accompagnement en TSA et TDAH.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Un espace serein pour naviguer ensemble, entre famille, école et spécialistes.
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
          className="w-full max-w-md relative z-10 text-center"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-2">
            Bon retour parmi nous
          </h2>
          <p className="text-on-surface-variant mb-10">
            Connectez-vous pour accéder à votre espace de coordination.
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 text-center">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 text-center">Mot de passe</label>
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all text-center"
              />
              <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:text-primary-container transition-colors mt-2 inline-block font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
            <Button type="submit" fullWidth iconRight="arrow_forward" size="lg" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-on-surface-variant mt-10">
            Pas encore inscrit ?{' '}
            <Link href="/inscription" className="text-primary font-semibold hover:text-primary-container transition-colors">
              Créer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
