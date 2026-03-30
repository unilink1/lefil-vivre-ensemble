'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(
  'https://tlqvxurmrpiuczlinyve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscXZ4dXJtcnBpdWN6bGlueXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMDUsImV4cCI6MjA5MDA1ODIwNX0.TA83e0Etn2kLp9XE5PbiZ1dfwB4-NdxXZKFtjlUoZnU'
)

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const login = async () => {
    setBusy(true)
    setMsg('')
    setIsSuccess(false)
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) {
        setMsg(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message)
        setBusy(false)
      } else {
        setIsSuccess(true)
        setMsg('Connexion réussie ! Redirection...')
        window.location.href = '/dashboard/profil'
      }
    } catch (e: unknown) {
      setMsg('Erreur: ' + (e instanceof Error ? e.message : String(e)))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left - Decorative Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4A90D9 0%, #3a7bc8 40%, #7EC8B0 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full opacity-5 bg-white" />

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
            Prendre soin,{' '}
            <span className="text-white/70">ensemble.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Un espace apaisé pour coordonner les soins et partager le quotidien en toute sérénité.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Coordination', 'Partage', 'Sérénité'].map((item) => (
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

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-[#f8fafb] relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #4A90D9, #7EC8B0)' }}
            >
              LF
            </div>
            <span className="text-gray-700 font-semibold">Le Fil</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Bon retour parmi nous
            </h2>
            <p className="text-gray-500 mb-8">
              Connectez-vous pour accéder à votre espace de coordination.
            </p>

            {/* Error message */}
            {msg && !isSuccess && (
              <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {msg}
              </div>
            )}

            {/* Success message */}
            {msg && isSuccess && (
              <div className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-600">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {msg}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                />
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link href="/mot-de-passe-oublie" className="text-sm font-medium hover:underline" style={{ color: '#4A90D9' }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !busy && email && password) login() }}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 transition-all"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={login}
                disabled={busy || !email || !password}
                className="w-full h-12 rounded-xl text-white font-semibold text-[15px] shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2"
                style={{
                  background: busy ? '#93bde8' : 'linear-gradient(135deg, #4A90D9 0%, #5ba0e3 100%)',
                  boxShadow: '0 4px 14px rgba(74, 144, 217, 0.35)',
                }}
              >
                {busy ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
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
            Pas encore inscrit ?{' '}
            <Link href="/inscription" className="font-semibold hover:underline" style={{ color: '#4A90D9' }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
