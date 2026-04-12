'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-surface">
      <div className="max-w-md w-full">
        <div className="text-8xl mb-6" aria-hidden="true">⚠️</div>
        <h2 className="text-3xl font-bold text-on-surface mb-3">Une erreur s&apos;est produite</h2>
        <p className="text-on-surface-variant mb-8">
          Quelque chose ne s&apos;est pas passé comme prévu. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Réessayer
        </button>
      </div>
    </main>
  )
}
