'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { icon: 'space_dashboard', label: 'Parcours', href: '/dashboard/profil' },
  { icon: 'calendar_month', label: 'Agenda', href: '/dashboard/agenda' },
  { icon: 'child_care', label: 'Enfant', href: '/dashboard/enfant' },
  { icon: 'forum', label: 'Echanges', href: '/dashboard/echanges' },
  { icon: 'menu_book', label: 'Journal', href: '/dashboard/journal' },
  { icon: 'settings', label: 'Reglages', href: '/dashboard/parametres' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <nav aria-label="Navigation mobile" className="bg-white/80 backdrop-blur-xl border-t border-white/50 shadow-[0_-2px_20px_rgba(45,55,72,0.06)] px-2 pb-[env(safe-area-inset-bottom)] flex items-center justify-around">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="flex-1" aria-label={tab.label} aria-current={active ? 'page' : undefined}>
              <div className={`flex flex-col items-center gap-0.5 py-2.5 relative transition-all duration-300 ${
                active ? 'scale-105' : 'scale-100'
              }`}>
                <span
                  className={`material-symbols-outlined transition-all duration-300 ${
                    active ? 'text-[22px] text-[#4A90D9]' : 'text-[22px] text-gray-400'
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium transition-all duration-300 ${
                  active ? 'text-[#4A90D9]' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
                {/* Active dot indicator */}
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4A90D9] animate-dot-pop" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
