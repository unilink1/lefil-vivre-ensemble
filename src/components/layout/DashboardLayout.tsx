'use client'
import BottomNav from './BottomNav'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { ReactNode } from 'react'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useAuth } from '@/hooks/useAuth'

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?'
}

function ChildSelector() {
  const { children, selectedChild, selectChild } = useSelectedChild()

  if (children.length <= 1) return null

  return (
    <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-outline-variant/10 bg-surface/50">
      <span className="text-xs text-on-surface-variant font-medium mr-1">Enfant :</span>
      <div className="flex gap-2">
        {children.map(child => {
          const isSelected = selectedChild?.id === child.id
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
              {getInitials(child.first_name, child.last_name)}
            </button>
          )
        })}
        <Link href="/dashboard/ajouter-enfant"
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#4A90D9] hover:text-[#4A90D9] transition-all cursor-pointer"
          title="Ajouter un enfant"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </Link>
      </div>
      {selectedChild && (
        <span className="text-sm font-semibold text-on-surface ml-2">{selectedChild.first_name}</span>
      )}
    </div>
  )
}

export default function DashboardLayout({ children, title, breadcrumb }: {
  children: ReactNode
  title?: string
  breadcrumb?: { label: string; href: string }[]
}) {
  const { profile } = useAuth()
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-dvh bg-surface pb-20 sm:pb-6">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profil">
              <Logo size="sm" />
            </Link>
            {breadcrumb && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-outline-variant">/</span>
                    <Link href={b.href} className="hover:text-primary transition-colors">{b.label}</Link>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-low rounded-xl transition-colors relative">
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </div>
        <ChildSelector />
      </header>

      {title && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface">{title}</h1>
        </div>
      )}

      <main className="w-full px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
