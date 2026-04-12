import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page introuvable — Le Fil',
  description: 'La page que vous cherchez n\'existe pas ou a été déplacée.',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-surface">
      <div className="max-w-md w-full">
        <div className="text-8xl mb-6" aria-hidden="true">🧵</div>
        <h1 className="text-4xl font-bold text-on-surface mb-3">Page introuvable</h1>
        <p className="text-on-surface-variant mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
