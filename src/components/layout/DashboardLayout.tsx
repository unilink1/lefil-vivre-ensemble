'use client'
import BottomNav from './BottomNav'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { icon: 'space_dashboard', label: 'Tableau de bord', href: '/dashboard/profil' },
  { icon: 'child_care', label: 'Enfant', href: '/dashboard/enfant' },
  { icon: 'calendar_month', label: 'Agenda', href: '/dashboard/agenda' },
  { icon: 'forum', label: 'Echanges', href: '/dashboard/echanges' },
  { icon: 'menu_book', label: 'Journal', href: '/dashboard/journal' },
  { icon: 'settings', label: 'Parametres', href: '/dashboard/parametres' },
]

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function SidebarChildSelector() {
  const { children, selectedChild, selectChild } = useSelectedChild()

  return (
    <div className="px-4 py-4 border-b border-gray-100">
      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-3 block">Enfants</span>
      <div className="flex items-center gap-2 flex-wrap">
        {children.map(child => {
          const isSelected = selectedChild?.id === child.id
          const initials = `${(child.first_name || '')[0] || ''}${(child.last_name || '')[0] || ''}`.toUpperCase() || '?'
          return (
            <button
              key={child.id}
              onClick={() => selectChild(child.id)}
              title={child.first_name}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] text-white shadow-lg shadow-[#4A90D9]/25 scale-110 ring-2 ring-[#4A90D9]/30 ring-offset-2'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {initials}
            </button>
          )
        })}
        <Link
          href="/dashboard/ajouter-enfant"
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#4A90D9] hover:text-[#4A90D9] transition-all cursor-pointer"
          title="Ajouter un enfant"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </Link>
      </div>
      {selectedChild && (
        <p className="text-xs text-gray-500 mt-2">
          Selectionne : <span className="font-semibold text-gray-700">{selectedChild.first_name}</span>
        </p>
      )}
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const initials = getInitials(profile?.full_name)

  return (
    <aside className="hidden sm:flex flex-col w-64 shrink-0 h-dvh sticky top-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/dashboard/profil">
          <Logo size="md" />
        </Link>
      </div>

      {/* Child selector */}
      <SidebarChildSelector />

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map(item => {
            const active = pathname?.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                    active
                      ? 'bg-[#4A90D9]/10 text-[#4A90D9]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#4A90D9] rounded-r-full" />
                  )}
                  <span
                    className={`material-symbols-outlined text-[20px] ${active ? 'text-[#4A90D9]' : 'text-gray-400'}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {profile?.full_name || 'Utilisateur'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {profile?.email || ''}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            title="Se deconnecter"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const { profile } = useAuth()
  const initials = getInitials(profile?.full_name)

  return (
    <header className="sm:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard/profil">
          <Logo size="sm" />
        </Link>
        <Link href="/dashboard/parametres/profil">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children, title, breadcrumb }: {
  children: ReactNode
  title?: string
  breadcrumb?: { label: string; href: string }[]
}) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isHome = pathname === '/dashboard/profil' || pathname === '/dashboard'

  return (
    <>
      <div className="min-h-dvh bg-surface flex">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 min-w-0 pb-24 sm:pb-6">
          {/* Mobile header */}
          <MobileHeader />

          {/* Breadcrumb + back button */}
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 flex items-center gap-3">
            {!isHome && (
              <Link href="/dashboard/profil" className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#4A90D9] transition-colors shrink-0">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            )}
            {breadcrumb && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-gray-300">/</span>
                    <Link href={b.href} className="hover:text-[#4A90D9] transition-colors">{b.label}</Link>
                  </span>
                ))}
              </div>
            )}
          </div>

          {title && (
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface">{title}</h1>
            </div>
          )}

          <main className="w-full px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav - OUTSIDE the flex container */}
      <BottomNav />
    </>
  )
}
