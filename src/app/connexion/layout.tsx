import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace Le Fil pour suivre l\'évolution de votre enfant.',
  robots: { index: false, follow: false },
}

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
