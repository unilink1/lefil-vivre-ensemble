'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const settingsCards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Mon profil',
    description: 'Informations personnelles, photo et coordonnées',
    href: '/dashboard/parametres/profil',
    color: '#4A90D9',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Mon enfant',
    description: 'Profil, suivi et informations de votre enfant',
    href: '/dashboard/enfant',
    color: '#7EC8B0',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: 'Liens de partage',
    description: 'Gérer les accès praticiens et les invitations',
    href: '/dashboard/parametres/partage',
    color: '#E8A87C',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Abonnement',
    description: 'Plan actuel, facturation et historique',
    href: '/dashboard/parametres/abonnement',
    color: '#4A90D9',
    badge: 'Sérénité',
  },
]

export default function ParametresPage() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const displayName = profile?.full_name || 'Utilisateur'

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-2">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-8">Paramètres</h1>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 mb-8">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: '#4A90D9' }}
            >
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 text-lg truncate">{displayName}</h2>
            <p className="text-sm text-gray-500">Compte parent</p>
          </div>
          <Link
            href="/dashboard/parametres/profil"
            className="text-sm text-[#4A90D9] font-medium hover:underline transition-colors"
          >
            Modifier
          </Link>
        </div>

        {/* Settings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {settingsCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
                {card.badge && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: `${card.color}15`, color: card.color }}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-[15px] mb-0.5 group-hover:text-[#4A90D9] transition-colors">
                  {card.title}
                </p>
                <p className="text-[13px] text-gray-500 leading-relaxed">{card.description}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-400 group-hover:text-[#4A90D9] transition-colors mt-auto">
                <span className="text-xs font-medium">Accéder</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-semibold flex items-center justify-center gap-2.5 hover:bg-red-100 transition-colors duration-200 cursor-pointer border border-red-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>

        {/* Footer */}
        <div className="text-center mt-10 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Le Fil — Vivre Ensemble</p>
          <p className="text-[10px] text-gray-300 mt-1">Version 2.4.0</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
