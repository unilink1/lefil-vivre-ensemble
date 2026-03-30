'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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
        setMsg('Connecte ! Redirection...')
        window.location.href = '/dashboard/profil'
      }
    } catch (e: unknown) {
      setMsg('Erreur: ' + (e instanceof Error ? e.message : String(e)))
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: '#f8f9fa' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Le Fil</h1>
        <p style={{ color: '#666', marginBottom: 32 }}>Connectez-vous a votre espace</p>

        {msg && (
          <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: msg.includes('Connecte') ? '#d4edda' : '#f8d7da', color: msg.includes('Connecte') ? '#155724' : '#721c24', fontSize: 14 }}>
            {msg}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', marginBottom: 12, borderRadius: 10, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !busy) login() }}
          style={{ width: '100%', padding: '14px 16px', marginBottom: 20, borderRadius: 10, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }}
        />
        <button
          onClick={login}
          disabled={busy || !email || !password}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: 'none', background: busy ? '#999' : '#4A90D9', color: '#fff', fontSize: 16, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer' }}
        >
          {busy ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
          <a href="/inscription" style={{ color: '#4A90D9' }}>Creer un compte</a>
          {' · '}
          <a href="/mot-de-passe-oublie" style={{ color: '#4A90D9' }}>Mot de passe oublie</a>
        </p>
      </div>
    </div>
  )
}
