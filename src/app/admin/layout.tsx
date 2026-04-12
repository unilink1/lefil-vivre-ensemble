'use client'
import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Logo from '@/components/ui/Logo'

const ADMIN_CODE = 'Unseulmot1&'
const STORAGE_KEY = 'lefil_admin_auth'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setAuthorized(true)
    setChecking(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === ADMIN_CODE) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthorized(true)
      setError('')
    } else {
      setError('Code incorrect. Veuillez réessayer.')
      setCode('')
    }
  }

  if (checking) return null

  if (!authorized) {
    return (
      <div className="min-h-dvh bg-surface-warm flex items-center justify-center p-6 font-[family-name:var(--font-body)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mb-10 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_48px_rgba(45,55,72,0.08)] border border-gray-100/60">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-error/8 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[32px]" aria-hidden="true">admin_panel_settings</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-on-surface mb-2">
              Accès Administration
            </h1>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              Entrez le code d&rsquo;accès réservé aux administrateurs Le Fil.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 bg-error-container border border-error/20 rounded-xl text-sm text-error font-medium flex items-center justify-center gap-2"
                role="alert"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="admin-code" className="sr-only">Code d&rsquo;accès administrateur</label>
              <input
                id="admin-code"
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Code d'accès"
                autoFocus
                autoComplete="current-password"
                className="w-full px-4 py-4 bg-surface-low border border-transparent rounded-xl text-center text-lg font-mono tracking-[0.25em] outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 mb-4"
                aria-label="Code d'accès administrateur"
              />
              <motion.button
                type="submit"
                whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(74,144,217,0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 gradient-primary text-white rounded-xl font-semibold text-base cursor-pointer transition-all duration-300 shadow-[0_2px_12px_rgba(74,144,217,0.20)] min-h-[52px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Accéder au panneau admin
              </motion.button>
            </form>
          </div>

          <p className="text-xs text-outline mt-6 leading-relaxed">
            Accès réservé aux administrateurs Le Fil uniquement
          </p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
