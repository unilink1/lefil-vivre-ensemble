'use client'
import BottomNav from './BottomNav'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const navItems = [
  { icon: 'space_dashboard', label: 'Tableau de bord', href: '/dashboard/profil' },
  { icon: 'child_care', label: 'Enfant', href: '/dashboard/enfant' },
  { icon: 'calendar_month', label: 'Agenda', href: '/dashboard/agenda' },
  { icon: 'forum', label: 'Échanges', href: '/dashboard/echanges' },
  { icon: 'menu_book', label: 'Journal', href: '/dashboard/journal' },
  { icon: 'medication', label: 'Médicaments', href: '/dashboard/medicaments' },
  { icon: 'health_and_safety', label: 'Carnet de santé', href: '/dashboard/carnet-sante' },
  { icon: 'folder', label: 'Documents', href: '/dashboard/documents' },
  { icon: 'flag', label: 'Objectifs', href: '/dashboard/objectifs' },
  { icon: 'school', label: 'École', href: '/dashboard/ecole' },
  { icon: 'settings', label: 'Paramètres', href: '/dashboard/parametres' },
]

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function SidebarChildSelector({ collapsed }: { collapsed?: boolean }) {
  const { children, selectedChild, selectChild } = useSelectedChild()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = async (childId: string) => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.from('children').update({ is_archived: true }).eq('id', childId)
    setConfirmDelete(null)
    window.location.reload()
  }

  return (
    <div className="px-4 py-4 border-b border-gray-100/50">
      {!collapsed && (
        <span className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3.5 block">
          Enfants suivis
        </span>
      )}
      <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : 'flex-wrap'}`}>
        {children.map(child => {
          const isSelected = selectedChild?.id === child.id
          const initials = `${(child.first_name || '')[0] || ''}${(child.last_name || '')[0] || ''}`.toUpperCase() || '?'
          return (
            <div key={child.id} className="relative group">
              <button
                onClick={() => selectChild(child.id)}
                title={child.first_name}
                aria-label={`Sélectionner ${child.first_name}${isSelected ? ' (sélectionné)' : ''}`}
                aria-pressed={isSelected}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] text-white shadow-lg shadow-[#4A90D9]/25 scale-110 ring-2 ring-[#4A90D9]/30 ring-offset-2'
                    : 'bg-surface-low text-on-surface-variant hover:bg-surface-high hover:scale-105'
                }`}
              >
                {initials}
              </button>
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(child.id) }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-red-600 shadow-sm"
                title={`Supprimer ${child.first_name}`}
                aria-label={`Supprimer ${child.first_name}`}
              >
                <span className="material-symbols-outlined text-[11px]" aria-hidden="true">remove</span>
              </button>
              {/* Confirm delete dialog */}
              {confirmDelete === child.id && (
                <div
                  className="absolute top-12 left-0 z-50 bg-white border border-gray-200/80 shadow-xl rounded-2xl p-4 w-52"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Confirmer la suppression de ${child.first_name}`}
                >
                  <p className="text-xs text-on-surface-variant mb-3.5 leading-relaxed">
                    Supprimer <span className="font-bold text-on-surface">{child.first_name}</span> du suivi ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 text-xs py-2 border border-outline-variant/30 rounded-lg text-on-surface-variant cursor-pointer hover:bg-surface-low transition-colors min-h-[32px]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="flex-1 text-xs py-2 bg-error text-white rounded-lg cursor-pointer hover:bg-red-600 transition-colors min-h-[32px] font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <Link
          href="/dashboard/ajouter-enfant"
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant/40 text-outline hover:border-primary/50 hover:text-primary hover:scale-105 transition-all duration-300 cursor-pointer"
          title="Ajouter un enfant"
          aria-label="Ajouter un enfant"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
        </Link>
      </div>
      {!collapsed && selectedChild && (
        <p className="text-xs text-on-surface-variant mt-2.5 leading-relaxed">
          Profil actif :{' '}
          <span className="font-bold text-on-surface">{selectedChild.first_name}</span>
        </p>
      )}
    </div>
  )
}

type SearchResult = {
  type: 'child' | 'practitioner' | 'session'
  label: string
  sublabel?: string
  href: string
}

function SidebarSearch({ collapsed }: { collapsed?: boolean }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const pattern = `%${q}%`
    const found: SearchResult[] = []

    try {
      const { data: children } = await supabase
        .from('children')
        .select('id, first_name, last_name')
        .or(`first_name.ilike.${pattern},last_name.ilike.${pattern}`)
        .eq('is_archived', false)
        .limit(5)
      if (children) {
        children.forEach(c => found.push({
          type: 'child',
          label: `${c.first_name} ${c.last_name || ''}`.trim(),
          sublabel: 'Enfant',
          href: '/dashboard/enfant',
        }))
      }

      const { data: practitioners } = await supabase
        .from('practitioners')
        .select('id, first_name, last_name, specialty')
        .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},specialty.ilike.${pattern}`)
        .limit(5)
      if (practitioners) {
        practitioners.forEach(p => found.push({
          type: 'practitioner',
          label: `${p.first_name} ${p.last_name || ''}`.trim(),
          sublabel: p.specialty,
          href: `/dashboard/praticien?id=${p.id}`,
        }))
      }

      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, session_date, observations, objectives, practitioner_id')
        .or(`observations.ilike.${pattern},objectives.ilike.${pattern}`)
        .order('session_date', { ascending: false })
        .limit(5)
      if (sessions) {
        sessions.forEach(s => found.push({
          type: 'session',
          label: s.objectives || s.observations?.slice(0, 60) || 'Séance',
          sublabel: new Date(s.session_date).toLocaleDateString('fr-FR'),
          href: `/dashboard/praticien?id=${s.practitioner_id}`,
        }))
      }
    } catch {
      // silently ignore search errors
    }

    setResults(found)
    setOpen(found.length > 0)
    setLoading(false)
  }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSelect = (r: SearchResult) => {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(r.href)
  }

  if (collapsed) return null

  const iconMap: Record<string, string> = {
    child: 'child_care',
    practitioner: 'stethoscope',
    session: 'menu_book',
  }

  return (
    <div ref={wrapperRef} className="px-4 py-3 border-b border-gray-100/50 relative">
      <div className="relative">
        <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">search</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Rechercher..."
          aria-label="Rechercher dans le tableau de bord"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-low border border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200/60 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto"
          role="listbox"
          aria-label="Résultats de recherche"
        >
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              role="option"
              aria-selected={false}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-low transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">{iconMap[r.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{r.label}</p>
                {r.sublabel && <p className="text-xs text-on-surface-variant truncate">{r.sublabel}</p>}
              </div>
              <span className="material-symbols-outlined text-[14px] text-outline" aria-hidden="true">chevron_right</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200/60 rounded-2xl shadow-xl z-50 p-5 text-center" role="status">
          <p className="text-sm text-on-surface-variant">Aucun résultat pour &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const initials = getInitials(profile?.full_name)
  const [bouncingIcon, setBouncingIcon] = useState<string | null>(null)

  const handleNavClick = (href: string) => {
    setBouncingIcon(href)
    setTimeout(() => setBouncingIcon(null), 450)
  }

  return (
    <aside
      className={`hidden sm:flex flex-col ${collapsed ? 'w-16' : 'w-64'} shrink-0 h-dvh sticky top-0 bg-white/75 backdrop-blur-xl border-r border-transparent relative transition-all duration-300 ease-out`}
      aria-label="Navigation principale"
    >
      {/* Gradient border */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#4A90D9]/15 via-[#7EC8B0]/20 to-[#4A90D9]/8" aria-hidden="true" />

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3.5 top-20 z-10 w-7 h-7 bg-white border border-gray-200/70 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-surface-low hover:border-primary/30 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
        aria-expanded={!collapsed}
      >
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant" aria-hidden="true">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Logo */}
      <div className={`${collapsed ? 'px-3' : 'px-5'} py-5 border-b border-gray-100/50 flex items-center justify-center`}>
        <Link href="/dashboard/profil" aria-label="Accueil tableau de bord">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="50" cy="22" r="7" fill="white"/>
                <path d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
          ) : (
            <Logo size="md" />
          )}
        </Link>
      </div>

      {/* Child selector */}
      <SidebarChildSelector collapsed={collapsed} />

      {/* Search */}
      <SidebarSearch collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin" aria-label="Sections du tableau de bord">
        <ul className="space-y-0.5 px-2" role="list">
          {navItems.map(item => {
            const active = pathname?.startsWith(item.href)
            const isBouncing = bouncingIcon === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out relative group min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[#4A90D9] to-[#7EC8B0] rounded-r-full" aria-hidden="true" />
                  )}
                  <span
                    className={`material-symbols-outlined text-[20px] transition-all duration-200 shrink-0 ${
                      active ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'
                    } ${isBouncing ? 'animate-icon-bounce' : ''}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate leading-none">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sidebar notice */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-outline leading-relaxed italic">
            Application en constante évolution pour vous offrir la meilleure expérience. Merci de votre indulgence.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} pb-3 space-y-1.5`}>
        <a
          href="https://chatgpt.com/g/g-6973d5559b04819190b689567f8199e5-lefil-vivre-ensemble-aide"
          target="_blank"
          rel="noopener noreferrer"
          id="chatbot-link"
          title={collapsed ? 'Assistant IA' : undefined}
          aria-label={collapsed ? 'Assistant IA (nouvelle fenêtre)' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl bg-purple-50/80 border border-purple-100 text-purple-600 font-semibold text-sm transition-all duration-300 hover:bg-purple-100/80 hover:shadow-sm cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-500`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">smart_toy</span>
          {!collapsed && <span className="truncate">Assistant IA</span>}
        </a>

        <Link
          href="/dashboard/contact-lefil"
          title={collapsed ? 'Contacter Le Fil' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 text-primary font-semibold text-sm transition-all duration-300 hover:bg-primary/10 hover:shadow-sm cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">mail</span>
          {!collapsed && <span className="truncate">Contacter Le Fil</span>}
        </Link>

        <Link
          href="/dashboard/demande-integration"
          title={collapsed ? "Demande d'intégration" : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl bg-tertiary/8 border border-tertiary/15 text-tertiary-dark font-semibold text-sm transition-all duration-300 hover:bg-tertiary/15 hover:shadow-sm cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tertiary`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">handshake</span>
          {!collapsed && <span className="truncate">Demande d&rsquo;intégration</span>}
        </Link>

        <Link
          href="/dashboard/parrainer"
          title={collapsed ? 'Parrainer un proche' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl bg-secondary/8 border border-secondary/15 text-secondary font-semibold text-sm transition-all duration-300 hover:bg-secondary/15 hover:shadow-sm cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary`}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">favorite</span>
          {!collapsed && <span className="truncate">Parrainer un proche</span>}
        </Link>
      </div>

      {/* User profile footer */}
      <div className="border-t border-gray-100/50 px-4 py-4 bg-gradient-to-r from-primary/[0.02] via-secondary/[0.03] to-transparent">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm" aria-hidden="true">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate leading-tight">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate leading-tight mt-0.5">
                  {profile?.email || ''}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                title="Se déconnecter"
                aria-label="Se déconnecter"
                className="p-2 rounded-xl text-outline hover:text-error hover:bg-error/8 transition-all duration-200 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-error"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const { profile } = useAuth()
  const initials = getInitials(profile?.full_name)
  const pathname = usePathname()

  const currentPage = navItems.find(n => pathname?.startsWith(n.href))?.label || 'Le Fil'

  return (
    <header className="sm:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-[0_1px_12px_rgba(45,55,72,0.05)]">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/dashboard/profil" aria-label="Accueil tableau de bord">
          <Logo size="sm" />
        </Link>
        <span className="text-sm font-semibold text-on-surface truncate flex-1 text-center">
          {currentPage}
        </span>
        <Link
          href="/dashboard/parametres/profil"
          aria-label="Accéder à votre profil"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#7EC8B0] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {initials}
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isHome = pathname === '/dashboard/profil' || pathname === '/dashboard'

  return (
    <>
      {/* Skip to content link — WCAG AA */}
      <a
        href="#main-dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-white focus:text-primary focus:rounded-xl focus:shadow-lg focus:font-semibold focus:text-sm focus:border focus:border-primary/20"
      >
        Aller au contenu principal
      </a>

      <div className="min-h-dvh bg-surface flex font-[family-name:var(--font-body)]">
        {/* Desktop sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main content */}
        <div className="flex-1 min-w-0 pb-28 sm:pb-8">
          {/* Mobile header */}
          <MobileHeader />

          {/* Breadcrumb */}
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 flex items-center gap-3 min-h-[40px]">
            {!isHome && (
              <Link
                href="/dashboard/profil"
                className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors shrink-0 min-h-[36px] px-2 rounded-lg hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
                <span className="hidden sm:inline font-medium">Accueil</span>
              </Link>
            )}
            {breadcrumb && (
              <nav aria-label="Fil d'Ariane" className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                {breadcrumb.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="text-outline/50" aria-hidden="true">/</span>
                    <Link href={b.href} className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline">{b.label}</Link>
                  </span>
                ))}
              </nav>
            )}
          </div>

          {title && (
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface leading-tight">
                {title}
              </h1>
            </div>
          )}

          <main
            id="main-dashboard-content"
            className="w-full px-4 sm:px-6 lg:px-8 py-5 animate-fade-in-page"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </>
  )
}
