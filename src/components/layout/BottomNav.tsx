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
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-2 pb-[env(safe-area-inset-bottom)] flex items-center justify-around">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="flex-1">
              <div className={`flex flex-col items-center gap-0.5 py-2.5 transition-all ${active ? '' : ''}`}>
                <span className={`material-symbols-outlined text-[22px] ${
                  active ? 'text-[#4A90D9]' : 'text-gray-400'
                }`} style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${
                  active ? 'text-[#4A90D9]' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
