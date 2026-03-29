'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : authError.message
        )
        setLoading(false)
        return
      }

      router.push('/dashboard/profil')
    } catch (err) {
      setError('Erreur de connexion. Veuillez reessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-block mb-10">
          <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-primary">Le Fil</span>
          <span className="block text-xs text-on-surface-variant">Vivre Ensemble</span>
        </Link>

        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-on-surface mb-2">
          Bon retour parmi nous
        </h2>
        <p className="text-on-surface-variant mb-10">
          Connectez-vous pour acceder a votre espace de coordination.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full py-3.5 px-4 bg-surface-low rounded-xl text-[15px] text-on-surface placeholder:text-outline/60 outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline mt-2 inline-block font-medium">
              Mot de passe oublie ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 gradient-primary text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary/20 cursor-pointer transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

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
