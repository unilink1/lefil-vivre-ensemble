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
        setMsg(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message)
        setBusy(false)
        return
      }

      setIsSuccess(true)
      setMsg('Connexion réussie !')

      // Verify session is truly set before redirecting
      const checkSession = async (attempts: number) => {
        const { data: sessionData } = await sb.auth.getSession()
        if (sessionData.session) {
          window.location.replace('/dashboard/profil')
        } else if (attempts > 0) {
          setTimeout(() => checkSession(attempts - 1), 500)
        } else {
          // Last resort: force redirect anyway
          window.location.replace('/dashboard/profil')
        }
      }

      // Wait a bit then check
      setTimeout(() => checkSession(5), 500)

    } catch (e: unknown) {
      setMsg('Erreur : ' + (e instanceof Error ? e.message : String(e)))
      setBusy(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f8fafb]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Redirection vers votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3B82D9 0%, #2970c9 40%, #5CB89A 100%)' }}>
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-10 bg-white" />
        <div className="relative z-10 px-12 xl:px-20 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none"><path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="50" cy="22" r="7" fill="white"/><path d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z" fill="white" opacity="0.85"/></svg>
            </div>
            <span className="text-white/90 font-semibold text-lg">Le Fil</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Prendre soin,{' '}<span className="text-white/70">ensemble.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Un espace apaisé pour coordonner les soins et partager le quotidien en toute sérénité.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Coordination', 'Partage', 'Sérénité'].map(item => (
              <span key={item} className="px-4 py-2 rounded-full text-sm font-medium text-white/90"
                style={{ background: 'rgba(255,255,255,0.15)' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-[#f8fafb] relative">
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82D9, #5CB89A)' }}>
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none"><path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="50" cy="22" r="7" fill="white"/><path d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z" fill="white" opacity="0.85"/></svg>
            </div>
            <span className="text-gray-700 font-semibold">Le Fil</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bon retour parmi nous</h2>
            <p className="text-gray-500 mb-8">Connectez-vous pour accéder à votre espace de coordination.</p>

            {msg && (
              <div className={`mb-6 p-4 text-sm font-medium flex items-center gap-2.5 ${
                isSuccess ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <span className="material-symbols-outlined text-[18px]">{isSuccess ? 'check_circle' : 'error'}</span>
                {msg}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#3B82D9] focus:ring-2 focus:ring-[#3B82D9]/20 transition-all" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <Link href="/mot-de-passe-oublie" className="text-sm font-medium hover:underline" style={{ color: '#3B82D9' }}>Mot de passe oublié ?</Link>
                </div>
                <input type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !busy && email && password) login() }}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#3B82D9] focus:ring-2 focus:ring-[#3B82D9]/20 transition-all" />
              </div>
              <button onClick={login} disabled={busy || !email || !password}
                className="w-full h-12 text-white font-semibold text-[15px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                style={{ background: busy ? '#999' : '#3B82D9' }}>
                {busy ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connexion...</>
                ) : 'Se connecter →'}
              </button>
            </div>

            <p className="text-center text-gray-500 mt-8 text-sm">
              Pas encore inscrit ?{' '}
              <Link href="/inscription" className="font-semibold hover:underline" style={{ color: '#3B82D9' }}>Créer un compte</Link>
            </p>

            <div className="mt-6 text-center">
              <button onClick={() => {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                alert(isIOS
                  ? "Pour installer Le Fil :\n\n1. Appuyez sur l'icône Partager\n2. « Sur l'écran d'accueil »\n3. « Ajouter »"
                  : "Pour installer Le Fil :\n\n• Chrome : icône d'installation dans la barre d'adresse\n• Mobile : Menu ⋮ → « Ajouter à l'écran d'accueil »")
              }} className="text-xs text-gray-400 hover:text-[#3B82D9] cursor-pointer transition-colors inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">install_mobile</span>
                Installer sur votre appareil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
