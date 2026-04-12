'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const sb = createClient(
  'https://tlqvxurmrpiuczlinyve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscXZ4dXJtcnBpdWN6bGlueXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMDUsImV4cCI6MjA5MDA1ODIwNX0.TA83e0Etn2kLp9XE5PbiZ1dfwB4-NdxXZKFtjlUoZnU'
)

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Check if already logged in
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setRedirecting(true)
        window.location.replace('/dashboard/profil')
      }
    })
  }, [])

  const login = async () => {
    setBusy(true)
    setMsg('')
    setIsSuccess(false)
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password })
      if (error) {
        setMsg(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect. Vérifiez vos identifiants.' : error.message)
        setBusy(false)
        return
      }

      setIsSuccess(true)
      setMsg('Connexion réussie — redirection en cours...')

      const checkSession = async (attempts: number) => {
        const { data: sessionData } = await sb.auth.getSession()
        if (sessionData.session) {
          window.location.replace('/dashboard/profil')
        } else if (attempts > 0) {
          setTimeout(() => checkSession(attempts - 1), 500)
        } else {
          window.location.replace('/dashboard/profil')
        }
      }

      setTimeout(() => checkSession(5), 500)

    } catch (e: unknown) {
      setMsg('Une erreur est survenue : ' + (e instanceof Error ? e.message : String(e)))
      setBusy(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-5" />
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Redirection vers votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row font-[family-name:var(--font-body)]">

      {/* ── Left hero panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-center overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #4A90D9 0%, #3570B8 45%, #7EC8B0 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute top-1/2 left-2/3 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 px-12 xl:px-20 max-w-lg">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-14 group" aria-label="Retour à l'accueil Le Fil">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
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
            Prendre soin,{' '}
            <span className="text-white/70">ensemble.</span>
          </h1>
          <p className="text-white/75 text-lg leading-[1.7] mb-12">
            Un espace apaisé pour coordonner les soins et partager le quotidien de votre enfant en toute sérénité.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Coordination', 'Partage', 'Sérénité'].map(item => (
              <span
                key={item}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-14 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <p className="text-white/85 text-sm leading-[1.7] italic mb-3">
              &ldquo;Le Fil m&rsquo;a aidée à mieux coordonner les rendez-vous de mon fils. Je me sens moins seule dans ce parcours.&rdquo;
            </p>
            <p className="text-white/60 text-xs font-semibold">— Sophie, maman d&rsquo;un enfant TSA</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-surface-warm relative">

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Accueil Le Fil">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4A90D9, #7EC8B0)' }}
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

        <div className="w-full max-w-md">

          {/* Card form */}
          <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(45,55,72,0.08)] border border-gray-100/60 p-8 sm:p-10">

            <div className="mb-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-on-surface mb-2 leading-tight">
                Bon retour parmi nous
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Connectez-vous pour accéder à votre espace de coordination.
              </p>
            </div>

            {/* Feedback message */}
            {msg && (
              <div
                className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-start gap-3 leading-relaxed ${
                  isSuccess
                    ? 'bg-secondary-fixed/60 border border-secondary/20 text-secondary-dark'
                    : 'bg-error-container border border-error/20 text-error'
                }`}
                role="alert"
                aria-live="polite"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" aria-hidden="true">
                  {isSuccess ? 'check_circle' : 'info'}
                </span>
                {msg}
              </div>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full h-13 px-4 py-3.5 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 focus:border-primary border border-transparent transition-all duration-300 leading-relaxed"
                  aria-label="Adresse email"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-on-surface">
                    Mot de passe
                  </label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !busy && email && password) login() }}
                    autoComplete="current-password"
                    className="w-full h-13 pl-4 pr-12 py-3.5 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/50 outline-none focus:bg-white focus:ring-2 focus:ring-primary/25 border border-transparent transition-all duration-300 leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-outline hover:text-primary transition-colors rounded-lg"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={login}
                disabled={busy || !email || !password}
                className="w-full h-13 rounded-xl text-white font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary mt-2"
                style={{
                  background: busy ? 'linear-gradient(135deg, #8BB8E0, #7EC8B0)' : 'linear-gradient(135deg, #4A90D9, #3570B8)',
                  boxShadow: busy ? 'none' : '0 4px 16px rgba(74, 144, 217, 0.25)',
                }}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Connexion en cours...
                  </>
                ) : 'Se connecter'}
              </button>
            </div>

            {/* Register link */}
            <p className="text-center text-on-surface-variant mt-8 text-sm leading-relaxed">
              Pas encore inscrit ?{' '}
              <Link
                href="/inscription"
                className="font-semibold text-primary hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Créer un compte gratuitement
              </Link>
            </p>

            {/* Install app hint */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                  alert(isIOS
                    ? "Pour installer Le Fil :\n\n1. Appuyez sur l'icône Partager\n2. « Sur l'écran d'accueil »\n3. « Ajouter »"
                    : "Pour installer Le Fil :\n\n• Chrome : icône d'installation dans la barre d'adresse\n• Mobile : Menu ⋮ → « Ajouter à l'écran d'accueil »")
                }}
                className="text-xs text-outline hover:text-primary cursor-pointer transition-colors inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">install_mobile</span>
                Installer l&rsquo;application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
