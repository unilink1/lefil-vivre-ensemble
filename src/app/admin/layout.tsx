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
      setError('Code incorrect.')
      setCode('')
    }
  }

  if (checking) return null

  if (!authorized) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="bg-surface-card rounded-2xl p-8 shadow-md border border-outline-variant/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-error/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[32px]">admin_panel_settings</span>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">Accès Administration</h1>
            <p className="text-sm text-on-surface-variant mb-6">Entrez le code d&apos;accès pour continuer.</p>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Code d'accès"
                autoFocus
                className="w-full px-4 py-3.5 bg-surface border-[1.5px] border-outline-variant/30 rounded-xl text-center text-lg font-mono tracking-wider outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all mb-4"
              />
              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] cursor-pointer transition-all"
              >
                Accéder
              </motion.button>
            </form>
          </div>

          <p className="text-xs text-outline mt-6">Accès réservé aux administrateurs</p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
