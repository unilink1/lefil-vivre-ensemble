import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et gestion des données personnelles de la plateforme Le Fil.',
  openGraph: {
    title: 'Politique de confidentialité — Le Fil',
    description: 'Politique de confidentialité et gestion des données personnelles de la plateforme Le Fil.',
  },
}

export default function PolitiqueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
