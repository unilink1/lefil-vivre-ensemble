'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { supabase } from '@/lib/supabase'

type CrmEntry = {
  id: string
  date: string
  type: 'rdv' | 'seance' | 'document' | 'journal' | 'message' | 'inscription'
  titre: string
  details: string
  client: string
  enfant: string
  statut: string
}

const typeLabels: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  inscription: { label: 'Inscription', icon: 'person_add', color: 'text-purple-600', bg: 'bg-purple-50' },
  rdv: { label: 'Rendez-vous', icon: 'calendar_month', color: 'text-primary', bg: 'bg-primary/8' },
  seance: { label: 'Séance', icon: 'medical_services', color: 'text-secondary', bg: 'bg-secondary/10' },
  document: { label: 'Document', icon: 'description', color: 'text-tertiary', bg: 'bg-tertiary/10' },
  journal: { label: 'Journal', icon: 'menu_book', color: 'text-purple-600', bg: 'bg-purple-50' },
  message: { label: 'Message', icon: 'chat', color: 'text-primary', bg: 'bg-primary/8' },
}

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function AdminCrmPage() {
  const [entries, setEntries] = useState<CrmEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const all: CrmEntry[] = []

      // Profiles (inscriptions)
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      profiles?.forEach(p => {
        all.push({
          id: `profile-${p.id}`,
          date: p.created_at,
          type: 'inscription',
          titre: p.full_name || p.email,
          details: `Email : ${p.email}${p.phone ? ' | Tél : ' + p.phone : ''}${p.subscription_plan ? ' | Plan : ' + p.subscription_plan : ''}`,
          client: p.full_name || p.email,
          enfant: '',
          statut: p.role || 'user',
        })
      })

      const clientMap: Record<string, string> = {}
      profiles?.forEach(p => { clientMap[p.id] = p.full_name || p.email })

      const { data: children } = await supabase.from('children').select('*').eq('is_archived', false).order('created_at', { ascending: false })
      const childMap: Record<string, { name: string; parentId: string }> = {}
      children?.forEach(c => {
        childMap[c.id] = { name: `${c.first_name} ${c.last_name || ''}`.trim(), parentId: c.parent_id }
      })

      const { data: appointments } = await supabase.from('appointments').select('*, practitioners(first_name, last_name)').order('datetime_start', { ascending: false })
      appointments?.forEach(a => {
        const child = childMap[a.child_id]
        const p = (a as Record<string, unknown>).practitioners as { first_name?: string; last_name?: string } | undefined
        all.push({
          id: `rdv-${a.id}`,
          date: a.datetime_start,
          type: 'rdv',
          titre: a.title || 'Rendez-vous',
          details: `${p ? p.first_name + ' ' + (p.last_name || '') : ''} ${a.location || ''}`.trim(),
          client: child ? clientMap[child.parentId] || '' : '',
          enfant: child?.name || '',
          statut: a.status === 'confirme' ? 'Confirmé' : a.status === 'termine' ? 'Terminé' : a.status === 'annule' ? 'Annulé' : 'Planifié',
        })
      })

      const { data: sessions } = await supabase.from('sessions').select('*').order('session_date', { ascending: false })
      sessions?.forEach(s => {
        const child = childMap[s.child_id]
        all.push({
          id: `seance-${s.id}`,
          date: s.session_date,
          type: 'seance',
          titre: s.objectives || 'Séance',
          details: (s.observations || s.progress || '').substring(0, 120),
          client: child ? clientMap[child.parentId] || '' : '',
          enfant: child?.name || '',
          statut: s.child_mood ? `${moodEmojis[s.child_mood] || ''} ${s.child_mood}/5` : '',
        })
      })

      const { data: documents } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      documents?.forEach(d => {
        const child = childMap[d.child_id]
        all.push({
          id: `doc-${d.id}`,
          date: d.document_date || d.created_at,
          type: 'document',
          titre: d.file_name,
          details: d.category,
          client: child ? clientMap[child.parentId] || '' : '',
          enfant: child?.name || '',
          statut: d.category,
        })
      })

      const { data: logs } = await supabase.from('daily_logs').select('*').order('log_date', { ascending: false }).limit(200)
      logs?.forEach(l => {
        const child = childMap[l.child_id]
        all.push({
          id: `journal-${l.id}`,
          date: l.log_date,
          type: 'journal',
          titre: `Journal — ${child?.name || ''}`,
          details: [
            l.mood ? `Humeur ${moodEmojis[l.mood] || l.mood}` : '',
            l.sleep_quality ? `Sommeil ${l.sleep_quality}` : '',
            l.crises_count > 0 ? `${l.crises_count} crise(s)` : '',
          ].filter(Boolean).join(' | '),
          client: child ? clientMap[child.parentId] || '' : '',
          enfant: child?.name || '',
          statut: l.mood ? moodEmojis[l.mood] || '' : '',
        })
      })

      const { data: contacts } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      contacts?.forEach(c => {
        all.push({
          id: `contact-${c.id}`,
          date: c.created_at,
          type: 'message',
          titre: c.subject || 'Message',
          details: (c.message || '').substring(0, 120),
          client: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
          enfant: '',
          statut: c.status || 'Nouveau',
        })
      })

      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(all)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filter !== 'tous' && e.type !== filter) return false
      if (search) {
        const s = search.toLowerCase()
        if (!e.titre.toLowerCase().includes(s) && !e.details.toLowerCase().includes(s) && !e.client.toLowerCase().includes(s) && !e.enfant.toLowerCase().includes(s)) return false
      }
      if (dateFrom && new Date(e.date) < new Date(dateFrom)) return false
      if (dateTo && new Date(e.date) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [entries, filter, search, dateFrom, dateTo])

  const stats = useMemo(() => ({
    total: entries.length,
    inscriptions: entries.filter(e => e.type === 'inscription').length,
    rdv: entries.filter(e => e.type === 'rdv').length,
    seances: entries.filter(e => e.type === 'seance').length,
    documents: entries.filter(e => e.type === 'document').length,
    journal: entries.filter(e => e.type === 'journal').length,
    messages: entries.filter(e => e.type === 'message').length,
  }), [entries])

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Client', 'Enfant', 'Titre', 'Détails', 'Statut']
    const rows = filtered.map(e => [
      new Date(e.date).toLocaleDateString('fr-FR'),
      typeLabels[e.type]?.label || e.type,
      `"${e.client.replace(/"/g, '""')}"`,
      `"${e.enfant.replace(/"/g, '""')}"`,
      `"${e.titre.replace(/"/g, '""')}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      e.statut,
    ])
    const bom = '\uFEFF'
    const csv = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lefil-crm-admin-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-dvh bg-surface font-[family-name:var(--font-body)]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/8 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin CRM</span>
          </div>
          <Link
            href="/admin"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg hover:bg-surface-low"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-7">

        {/* ── Page heading ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface mb-1.5">
              CRM — Vue globale
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Historique complet de tous les clients et activités
            </p>
          </div>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-5 py-3 bg-secondary text-white font-semibold text-sm rounded-xl cursor-pointer hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            aria-label={`Exporter ${filtered.length} entrée${filtered.length > 1 ? 's' : ''} en CSV`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">download</span>
            Exporter CSV ({filtered.length})
          </button>
        </div>

        {/* ── Stats tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: stats.total, type: 'total', icon: 'database' },
            { label: 'Inscrits', value: stats.inscriptions, type: 'inscription', icon: 'person_add' },
            { label: 'RDV', value: stats.rdv, type: 'rdv', icon: 'calendar_month' },
            { label: 'Séances', value: stats.seances, type: 'seance', icon: 'medical_services' },
            { label: 'Docs', value: stats.documents, type: 'document', icon: 'description' },
            { label: 'Journal', value: stats.journal, type: 'journal', icon: 'menu_book' },
            { label: 'Messages', value: stats.messages, type: 'message', icon: 'chat' },
          ].map((s) => {
            const t = typeLabels[s.type] || { color: 'text-on-surface', bg: 'bg-surface-low', icon: s.icon, label: s.label }
            return (
              <button
                key={s.type}
                onClick={() => setFilter(s.type === 'total' ? 'tous' : s.type)}
                className={`bg-white rounded-2xl border border-gray-100/80 p-4 text-center hover:shadow-md transition-all duration-300 cursor-pointer ${
                  filter === (s.type === 'total' ? 'tous' : s.type) ? 'ring-2 ring-primary/30 border-primary/20' : ''
                }`}
                aria-pressed={filter === (s.type === 'total' ? 'tous' : s.type)}
              >
                <div className={`w-8 h-8 ${t.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <span className={`material-symbols-outlined text-[16px] ${t.color}`} aria-hidden="true">{t.icon}</span>
                </div>
                <p className={`font-[family-name:var(--font-heading)] text-2xl font-bold ${t.color}`}>{s.value}</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{s.label}</p>
              </button>
            )
          })}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par client, enfant, titre..."
                className="w-full pl-11 pr-4 py-3 bg-surface-low rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary border border-transparent transition-all duration-300"
                aria-label="Rechercher dans le CRM"
              />
            </div>
            {/* Date range */}
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="py-3 px-4 bg-surface-low rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 border border-transparent transition-all duration-300"
              aria-label="Date de début"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="py-3 px-4 bg-surface-low rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 border border-transparent transition-all duration-300"
              aria-label="Date de fin"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x" role="group" aria-label="Filtrer par type">
            {['tous', 'inscription', 'rdv', 'seance', 'document', 'journal', 'message'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`shrink-0 snap-start px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer min-h-[36px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  filter === f
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                }`}
              >
                {f === 'tous' ? 'Tous' : typeLabels[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-16 text-center">
            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm">Chargement des données CRM...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-surface-low/60">
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Client</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Enfant</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Titre</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Détails</th>
                    <th scope="col" className="text-left py-4 px-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.slice(0, 200).map(e => {
                    const t = typeLabels[e.type] || typeLabels.message
                    return (
                      <tr key={e.id} className="hover:bg-surface-low/50 transition-colors duration-200">
                        <td className="py-4 px-5 text-on-surface-variant whitespace-nowrap text-xs font-medium">
                          {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${t.bg} ${t.color}`}>
                            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{t.icon}</span>
                            {t.label}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-semibold text-on-surface max-w-[150px] truncate">{e.client || '—'}</td>
                        <td className="py-4 px-5 text-on-surface-variant max-w-[120px] truncate hidden sm:table-cell">{e.enfant || '—'}</td>
                        <td className="py-4 px-5 text-on-surface max-w-[180px] truncate">{e.titre}</td>
                        <td className="py-4 px-5 text-on-surface-variant max-w-[200px] truncate hidden md:table-cell text-xs">{e.details}</td>
                        <td className="py-4 px-5 text-on-surface-variant text-xs font-medium">{e.statut}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-surface-low rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-outline text-[32px]" aria-hidden="true">search_off</span>
            </div>
            <p className="text-on-surface font-semibold mb-1">Aucun résultat trouvé</p>
            <p className="text-on-surface-variant text-sm">Modifiez vos filtres ou votre recherche</p>
          </div>
        )}

        {/* Result count */}
        <p className="text-center text-xs text-on-surface-variant py-2">
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''} sur {entries.length} au total
          {filtered.length > 200 && ' · 200 premières affichées'}
        </p>
      </main>
    </div>
  )
}
