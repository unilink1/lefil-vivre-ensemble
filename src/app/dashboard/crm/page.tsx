'use client'
import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedChild } from '@/hooks/useSelectedChild'
import { supabase } from '@/lib/supabase'

type CrmEntry = {
  id: string
  date: string
  type: 'rdv' | 'seance' | 'document' | 'journal' | 'message' | 'note'
  titre: string
  details: string
  praticien: string
  statut: string
}

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  rdv: { label: 'Rendez-vous', icon: 'calendar_month', color: '#3B82D9' },
  seance: { label: 'Séance', icon: 'medical_services', color: '#5CB89A' },
  document: { label: 'Document', icon: 'description', color: '#E09060' },
  journal: { label: 'Journal', icon: 'menu_book', color: '#8B5CF6' },
  message: { label: 'Message', icon: 'chat', color: '#3B82D9' },
  note: { label: 'Note', icon: 'edit_note', color: '#5CB89A' },
}

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function CrmPage() {
  const { user } = useAuth()
  const { selectedChild } = useSelectedChild()
  const [entries, setEntries] = useState<CrmEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('tous')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Load all data
  useEffect(() => {
    if (!selectedChild?.id) return
    setLoading(true)

    const load = async () => {
      const childId = selectedChild.id
      const all: CrmEntry[] = []

      // Appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, practitioners(first_name, last_name, specialty)')
        .eq('child_id', childId)
        .order('datetime_start', { ascending: false })

      appointments?.forEach(a => {
        const p = (a as Record<string, unknown>).practitioners as { first_name?: string; last_name?: string; specialty?: string } | undefined
        all.push({
          id: `rdv-${a.id}`,
          date: a.datetime_start,
          type: 'rdv',
          titre: a.title || 'Rendez-vous',
          details: `${a.location || ''} — ${a.notes || ''}`.trim(),
          praticien: p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '',
          statut: a.status === 'confirme' ? 'Confirmé' : a.status === 'termine' ? 'Terminé' : a.status === 'annule' ? 'Annulé' : 'Planifié',
        })
      })

      // Sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('child_id', childId)
        .order('session_date', { ascending: false })

      sessions?.forEach(s => {
        all.push({
          id: `seance-${s.id}`,
          date: s.session_date,
          type: 'seance',
          titre: s.objectives || 'Séance',
          details: s.observations || s.progress || '',
          praticien: '',
          statut: s.child_mood ? `Humeur : ${moodEmojis[s.child_mood] || s.child_mood}/5` : '',
        })
      })

      // Documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })

      documents?.forEach(d => {
        all.push({
          id: `doc-${d.id}`,
          date: d.document_date || d.created_at,
          type: 'document',
          titre: d.file_name,
          details: d.description || d.category,
          praticien: '',
          statut: d.category,
        })
      })

      // Daily logs
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('child_id', childId)
        .order('log_date', { ascending: false })

      logs?.forEach(l => {
        const mood = l.mood ? moodEmojis[l.mood] || `${l.mood}/5` : ''
        all.push({
          id: `journal-${l.id}`,
          date: l.log_date,
          type: 'journal',
          titre: `Journal du ${new Date(l.log_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
          details: [
            mood ? `Humeur : ${mood}` : '',
            l.sleep_quality ? `Sommeil : ${l.sleep_quality}` : '',
            l.appetite ? `Appétit : ${l.appetite}` : '',
            l.crises_count > 0 ? `Crises : ${l.crises_count}` : '',
            l.positive_moments ? `Positif : ${l.positive_moments}` : '',
            l.concerns ? `Préoccupations : ${l.concerns}` : '',
          ].filter(Boolean).join(' | '),
          praticien: '',
          statut: mood,
        })
      })

      // Messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(50)

      messages?.forEach(m => {
        all.push({
          id: `msg-${m.id}`,
          date: m.created_at,
          type: 'message',
          titre: m.sender_is_parent ? 'Message envoyé' : 'Message reçu',
          details: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
          praticien: '',
          statut: m.sender_is_parent ? 'Envoyé' : 'Reçu',
        })
      })

      // Sort by date desc
      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(all)
      setLoading(false)
    }

    load()
  }, [selectedChild?.id])

  // Filter entries
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filter !== 'tous' && e.type !== filter) return false
      if (search && !e.titre.toLowerCase().includes(search.toLowerCase()) && !e.details.toLowerCase().includes(search.toLowerCase()) && !e.praticien.toLowerCase().includes(search.toLowerCase())) return false
      if (dateFrom && new Date(e.date) < new Date(dateFrom)) return false
      if (dateTo && new Date(e.date) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [entries, filter, search, dateFrom, dateTo])

  // Stats
  const stats = useMemo(() => ({
    total: entries.length,
    rdv: entries.filter(e => e.type === 'rdv').length,
    seances: entries.filter(e => e.type === 'seance').length,
    documents: entries.filter(e => e.type === 'document').length,
    journal: entries.filter(e => e.type === 'journal').length,
    messages: entries.filter(e => e.type === 'message').length,
  }), [entries])

  // Export CSV
  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Titre', 'Détails', 'Praticien', 'Statut']
    const rows = filtered.map(e => [
      new Date(e.date).toLocaleDateString('fr-FR'),
      typeLabels[e.type]?.label || e.type,
      `"${e.titre.replace(/"/g, '""')}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      `"${e.praticien.replace(/"/g, '""')}"`,
      e.statut,
    ])

    const bom = '\uFEFF'
    const csv = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lefil-crm-${selectedChild?.first_name || 'enfant'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!selectedChild) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'CRM', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">database</span>
            <p className="text-gray-500">Sélectionnez un enfant pour voir son historique.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'CRM — Historique complet', href: '#' }]}>
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900">
              CRM — {selectedChild.first_name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Historique complet de toutes les données du suivi</p>
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, color: '#3B82D9', icon: 'database' },
            { label: 'RDV', value: stats.rdv, color: '#3B82D9', icon: 'calendar_month' },
            { label: 'Séances', value: stats.seances, color: '#5CB89A', icon: 'medical_services' },
            { label: 'Documents', value: stats.documents, color: '#E09060', icon: 'description' },
            { label: 'Journal', value: stats.journal, color: '#8B5CF6', icon: 'menu_book' },
            { label: 'Messages', value: stats.messages, color: '#3B82D9', icon: 'chat' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-[22px] mb-1 block" style={{ color: s.color }}>{s.icon}</span>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9] transition-all"
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="py-2.5 px-3 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]"
              placeholder="Du"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="py-2.5 px-3 bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#3B82D9]/20 focus:border-[#3B82D9]"
              placeholder="Au"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['tous', 'rdv', 'seance', 'document', 'journal', 'message'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#3B82D9] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f === 'tous' ? 'Tous' : typeLabels[f]?.label || f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#3B82D9]/30 border-t-[#3B82D9] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Chargement des données...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Détails</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Praticien</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const t = typeLabels[e.type] || typeLabels.note
                    return (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: t.color }}>
                            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                            {t.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 max-w-[200px] truncate">{e.titre}</td>
                        <td className="py-3 px-4 text-gray-500 max-w-[250px] truncate">{e.details}</td>
                        <td className="py-3 px-4 text-gray-600">{e.praticien || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{e.statut}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-50">
              {filtered.map(e => {
                const t = typeLabels[e.type] || typeLabels.note
                return (
                  <div key={e.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: t.color }}>
                        <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                        {t.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 text-sm">{e.titre}</p>
                    {e.details && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{e.details}</p>}
                    <div className="flex items-center justify-between mt-2">
                      {e.praticien && <span className="text-xs text-gray-400">{e.praticien}</span>}
                      {e.statut && <span className="text-xs text-gray-500">{e.statut}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-gray-300 text-[48px] mb-3 block">search_off</span>
            <p className="text-gray-500">Aucune donnée trouvée</p>
            <p className="text-xs text-gray-400 mt-1">Modifiez vos filtres ou ajoutez des données au suivi.</p>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 py-4">
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''} sur {entries.length} au total
          {(dateFrom || dateTo) && ' (filtré par date)'}
          {search && ` · Recherche : "${search}"`}
        </div>
      </div>
    </DashboardLayout>
  )
}
