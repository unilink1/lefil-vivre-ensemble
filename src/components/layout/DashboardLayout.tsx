'use client'
import BottomNav from './BottomNav'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function DashboardLayout({ children, title, breadcrumb }: {
  children: ReactNode
  title?: string
  breadcrumb?: { label: string; href: string }[]
}) {
  return (
    <div className="min-h-dvh bg-surface pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
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
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">ML</div>
          </div>
        </div>
      </header>

      {title && (
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface">{title}</h1>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-4">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
