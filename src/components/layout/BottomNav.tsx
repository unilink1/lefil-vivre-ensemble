'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { icon: 'space_dashboard', label: 'Parcours', href: '/dashboard/profil' },
  { icon: 'calendar_month', label: 'Agenda', href: '/dashboard/agenda' },
  { icon: 'child_care', label: 'Enfant', href: '/dashboard/enfant' },
  { icon: 'forum', label: 'Échanges', href: '/dashboard/echanges' },
  { icon: 'menu_book', label: 'Journal', href: '/dashboard/journal' },
  { icon: 'settings', label: 'Réglages', href: '/dashboard/parametres' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden" role="navigation" aria-label="Navigation mobile">
      <nav className="bg-white/88 backdrop-blur-2xl border-t border-white/60 shadow-[0_-4px_24px_rgba(45,55,72,0.07)] px-1 pb-[env(safe-area-inset-bottom,4px)] flex items-center justify-around">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 focus-visible:outline-none"
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className={`flex flex-col items-center gap-0.5 py-3 relative transition-all duration-300 ease-out rounded-xl mx-0.5 ${
                active ? 'scale-105' : 'scale-100'
              }`}>
                {/* Active background pill */}
                {active && (
                  <span
                    className="absolute inset-x-1 top-1 bottom-1 rounded-xl bg-primary/8 animate-dot-pop"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`material-symbols-outlined relative z-10 transition-all duration-300 ${
                    active ? 'text-[22px] text-primary' : 'text-[22px] text-outline'
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-semibold relative z-10 transition-all duration-300 leading-none ${
                  active ? 'text-primary' : 'text-outline'
                }`}>
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
