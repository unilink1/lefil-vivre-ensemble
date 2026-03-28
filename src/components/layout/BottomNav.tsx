'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { icon: 'space_dashboard', label: 'Parcours', href: '/dashboard/profil' },
  { icon: 'calendar_month', label: 'Calendrier', href: '/dashboard/agenda' },
  { icon: 'forum', label: 'Échanges', href: '/dashboard/echanges' },
  { icon: 'menu_book', label: 'Journal', href: '/dashboard/journal' },
  { icon: 'person', label: 'Profil', href: '/dashboard/parametres' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50"
    >
      <div className="glass rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/30 p-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="relative flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-1.5 min-h-[44px] rounded-xl transition-all duration-300 ${
                  active ? 'bg-primary/10' : 'hover:bg-surface-low'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] transition-colors duration-300 ${
                  active ? 'text-primary' : 'text-outline'
                }`} style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${
                  active ? 'text-primary' : 'text-outline'
                }`}>
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute -bottom-0.5 w-6 h-1 gradient-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
