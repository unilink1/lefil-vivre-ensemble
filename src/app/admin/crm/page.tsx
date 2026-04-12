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

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  inscription: { label: 'Inscription', icon: 'person_add', color: '#8B5CF6' },
  rdv: { label: 'Rendez-vous', icon: 'calendar_month', color: '#3B82D9' },
  seance: { label: 'Séance', icon: 'medical_services', color: '#5CB89A' },
  document: { label: 'Document', icon: 'description', color: '#E09060' },
  journal: { label: 'Journal', icon: 'menu_book', color: '#8B5CF6' },
  message: { label: 'Message', icon: 'chat', color: '#3B82D9' },
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

      // Build client name map
      const clientMap: Record<string, string> = {}
      profiles?.forEach(p => { clientMap[p.id] = p.full_name || p.email })

      // Children
      const { data: children } = await supabase.from('children').select('*').eq('is_archived', false).order('created_at', { ascending: false })
      const childMap: Record<string, { name: string; parentId: string }> = {}
      children?.forEach(c => {
        childMap[c.id] = { name: `${c.first_name} ${c.last_name || ''}`.trim(), parentId: c.parent_id }
      })

      // Appointments
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

      // Sessions
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

      // Documents
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

      // Daily logs
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

      // Contact submissions
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
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">Admin CRM</span>
          </div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-[#3B82D9] transition-colors">
            &larr; Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900">CRM — Vue globale</h1>
            <p className="text-gray-500 text-sm mt-1">Historique complet de tous les clients et activités</p>
          </div>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="px-5 py-2.5 bg-[#5CB89A] text-white font-semibold cursor-pointer hover:bg-[#4aa888] disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exporter CSV ({filtered.length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: stats.total, color: '#3B82D9', icon: 'database' },
            { label: 'Inscrits', value: stats.inscriptions, color: '#8B5CF6', icon: 'person_add' },
            { label: 'RDV', value: stats.rdv, color: '#3B82D9', icon: 'calendar_month' },
            { label: 'Séances', value: stats.seances, color: '#5CB89A', icon: 'medical_services' },
            { label: 'Docs', value: stats.documents, color: '#E09060', icon: 'description' },
            { label: 'Journal', value: stats.journal, color: '#8B5CF6', icon: 'menu_book' },
            { label: 'Messages', value: stats.messages, color: '#3B82D9', icon: 'chat' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-[20px] mb-1 block" style={{ color: s.color }}>{s.icon}</span>
              <p className="font-[family-name:var(--font-heading)] text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, enfant, titre..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]" />
            </div>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="py-2.5 px-3 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="py-2.5 px-3 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['tous', 'inscription', 'rdv', 'seance', 'document', 'journal', 'message'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  filter === f ? 'bg-[#3B82D9] text-white' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}>
                {f === 'tous' ? 'Tous' : typeLabels[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Enfant</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Détails</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map(e => {
                    const t = typeLabels[e.type] || typeLabels.message
                    return (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-xs">
                          {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: t.color }}>
                            <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
                            {t.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 max-w-[150px] truncate">{e.client || '—'}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-[120px] truncate hidden sm:table-cell">{e.enfant || '—'}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-[180px] truncate">{e.titre}</td>
                        <td className="py-3 px-4 text-gray-400 max-w-[200px] truncate hidden sm:table-cell">{e.details}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{e.statut}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">search_off</span>
            <p className="text-gray-500">Aucune donnée trouvée</p>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 py-4">
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''} sur {entries.length}
          {filtered.length > 200 && ' (200 premières affichées)'}
        </div>
      </main>
    </div>
  )
}
