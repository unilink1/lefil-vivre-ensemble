'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'

const sb = createClient(
  'https://tlqvxurmrpiuczlinyve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscXZ4dXJtcnBpdWN6bGlueXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMDUsImV4cCI6MjA5MDA1ODIwNX0.TA83e0Etn2kLp9XE5PbiZ1dfwB4-NdxXZKFtjlUoZnU'
)

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const login = async () => {
    setBusy(true)
    setMsg('')
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) {
        setMsg(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message)
        setBusy(false)
      } else {
        setMsg('Connexion reussie !')
        window.location.href = '/dashboard/profil'
      }
    } catch (e: unknown) {
      setMsg('Erreur: ' + (e instanceof Error ? e.message : String(e)))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface relative">
      <FloatingOrbs variant="subtle" />

      <div className="w-full max-w-md mx-auto px-6 relative z-10 text-center">
        <Link href="/" className="inline-block mb-10">
          <Logo size="lg" />
        </Link>

        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-2">
          Bon retour parmi nous
        </h2>
        <p className="text-on-surface-variant mb-10">
          Connectez-vous pour acceder a votre espace de coordination.
        </p>

        {msg && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
            msg.includes('reussie')
              ? 'bg-secondary-container/50 text-secondary'
              : 'bg-error/10 border border-error/20 text-error'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {msg.includes('reussie') ? 'check_circle' : 'error'}
            </span>
            {msg}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 text-center">
              Email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 text-center">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !busy && email && password) login() }}
              className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all text-center"
            />
            <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline mt-2 inline-block font-medium">
              Mot de passe oublie ?
            </Link>
          </div>

          <button
            onClick={login}
            disabled={busy || !email || !password}
            className="w-full py-4 gradient-primary text-white rounded-xl font-semibold font-[family-name:var(--font-heading)] text-lg shadow-lg shadow-primary/20 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2.5"
          >
            {busy ? 'Connexion...' : 'Se connecter'}
            {!busy && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </div>

        <p className="text-on-surface-variant mt-10">
          Pas encore inscrit ?{' '}
          <Link href="/inscription" className="text-primary font-semibold hover:underline">
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
