import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord',
  description: 'Votre espace personnel Le Fil — suivi de votre enfant, agenda, documents et coordination avec les praticiens.',
  robots: { index: false, follow: false },
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
