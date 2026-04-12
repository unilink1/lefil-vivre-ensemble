import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte Le Fil et commencez à accompagner votre enfant atypique avec notre plateforme dédiée.',
  openGraph: {
    title: 'Rejoindre Le Fil',
    description: 'Créez votre compte et commencez à accompagner votre enfant atypique.',
  },
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
