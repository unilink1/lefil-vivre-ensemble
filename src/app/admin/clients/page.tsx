'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminClients, type AdminClient } from '@/hooks/useAdmin'

const statusConfig = {
  actif: { label: 'Actif', color: 'bg-success/12 text-success', dot: 'bg-success' },
  impaye: { label: 'Impayé', color: 'bg-warning/12 text-amber-700', dot: 'bg-warning' },
  banni: { label: 'Banni', color: 'bg-error/12 text-error', dot: 'bg-error' },
  suspendu: { label: 'Suspendu', color: 'bg-surface-high text-on-surface-variant', dot: 'bg-outline' },
}

const planConfig: Record<string, { label: string; price: string; color: string }> = {
  free: { label: 'Gratuit', price: '0 €', color: 'bg-surface-low text-on-surface-variant' },
  essentiel: { label: 'Essentiel', price: '77 €', color: 'bg-surface-low text-on-surface-variant' },
  serenite: { label: 'Sérénité', price: '99 €', color: 'bg-primary-fixed text-primary' },
  accompagnement: { label: 'Accompagnement+', price: '165 €', color: 'bg-secondary-container text-secondary' },
}

type FilterStatus = 'tous' | AdminClient['status']

export default function AdminClientsPage() {
  const { clients, loading, updateStatus } = useAdminClients()
  const [filter, setFilter] = useState<FilterStatus>('tous')
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)

  const filtered = clients
    .filter(c => filter === 'tous' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  const handleUpdateStatus = (id: string, status: AdminClient['status']) => {
    updateStatus(id, status)
    if (selectedClient?.id === id) setSelectedClient({ ...selectedClient, status })
  }

  return (
    <div className="min-h-dvh bg-surface font-[family-name:var(--font-body)]">

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/8 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link
            href="/admin"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg hover:bg-surface-low focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Page title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-1.5">
                Gestion clients
              </h1>
              <p className="text-on-surface-variant leading-relaxed">
                {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-on-surface-variant text-sm">Chargement des clients...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Search & Filters ── */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100/80 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm"
                    aria-label="Rechercher un client"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par statut">
                  {(['tous', 'actif', 'impaye', 'banni', 'suspendu'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                      className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-primary ${
                        filter === f
                          ? 'gradient-primary text-white shadow-md'
                          : 'bg-white text-on-surface-variant border border-gray-100/80 hover:border-primary/30 shadow-sm'
                      }`}
                    >
                      {f === 'tous' ? 'Tous' : statusConfig[f as keyof typeof statusConfig]?.label || f}
                      <span className="ml-1.5 text-xs opacity-70">
                        ({f === 'tous' ? clients.length : clients.filter(c => c.status === f).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Client list ── */}
              <div className="space-y-3" role="list" aria-label="Liste des clients">
                {filtered.map((client, i) => {
                  const st = statusConfig[client.status] || statusConfig.actif
                  const pl = planConfig[client.plan] || planConfig.free
                  return (
                    <motion.div
                      key={client.id}
                      role="listitem"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      onClick={() => setSelectedClient(client)}
                      className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100/80 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedClient(client) }}
                      aria-label={`Voir le détail de ${client.name}`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        {/* Avatar */}
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" aria-hidden="true">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-on-surface truncate">{client.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-on-surface-variant leading-relaxed">
                            <span className="truncate">{client.email}</span>
                            {client.phone && <span className="hidden sm:inline">{client.phone}</span>}
                          </div>
                        </div>

                        {/* Plan badge */}
                        <div className="hidden md:block text-right shrink-0">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${pl.color}`}>{pl.label}</span>
                          <p className="text-xs text-outline mt-1.5 font-medium">{pl.price}/mois</p>
                        </div>

                        {/* Children count */}
                        <div className="hidden lg:flex items-center gap-1.5 text-sm text-on-surface-variant shrink-0" aria-label={`${client.children} enfant(s)`}>
                          <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">child_care</span>
                          <span className="font-medium">{client.children}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 shrink-0">
                          {client.status !== 'banni' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'banni') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-error/6 text-error hover:bg-error/15 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-error"
                              title="Bannir ce client"
                              aria-label={`Bannir ${client.name}`}
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">block</span>
                            </motion.button>
                          )}
                          {client.status === 'banni' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'actif') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-success/6 text-success hover:bg-success/15 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-success"
                              title="Réactiver ce client"
                              aria-label={`Réactiver ${client.name}`}
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
                            </motion.button>
                          )}
                          {client.status === 'impaye' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'suspendu') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-warning/6 text-amber-700 hover:bg-warning/15 transition-colors duration-200 cursor-pointer focus-visible:outline-2"
                              title="Suspendre ce client"
                              aria-label={`Suspendre ${client.name}`}
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">pause_circle</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-20" role="status">
                    <div className="w-16 h-16 bg-surface-low rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-outline text-[32px]" aria-hidden="true">search_off</span>
                    </div>
                    <p className="font-semibold text-on-surface mb-1">Aucun client trouvé</p>
                    <p className="text-on-surface-variant text-sm">Modifiez votre recherche ou vos filtres</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* ── Client Detail Drawer ── */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-on-surface/25 backdrop-blur-sm z-50"
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label={`Détail du client ${selectedClient.name}`}
            >
              <div className="p-8">
                {/* Drawer header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-on-surface">
                    Fiche client
                  </h2>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="p-2.5 hover:bg-surface-low rounded-xl cursor-pointer transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label="Fermer la fiche client"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">close</span>
                  </button>
                </div>

                {/* Avatar & name */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-md" aria-hidden="true">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-xl text-on-surface mb-1">{selectedClient.name}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{selectedClient.email}</p>
                  {selectedClient.phone && (
                    <p className="text-on-surface-variant text-sm mt-0.5">{selectedClient.phone}</p>
                  )}
                </div>

                {/* Status & plan pills */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-surface-low rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-outline uppercase tracking-widest mb-2 font-bold">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${(statusConfig[selectedClient.status] || statusConfig.actif).color}`}>
                      <span className={`w-2 h-2 rounded-full ${(statusConfig[selectedClient.status] || statusConfig.actif).dot}`} aria-hidden="true" />
                      {(statusConfig[selectedClient.status] || statusConfig.actif).label}
                    </span>
                  </div>
                  <div className="bg-surface-low rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-outline uppercase tracking-widest mb-2 font-bold">Forfait</p>
                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${(planConfig[selectedClient.plan] || planConfig.free).color}`}>
                      {(planConfig[selectedClient.plan] || planConfig.free).label}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 mb-8 divide-y divide-gray-50">
                  {[
                    { icon: 'calendar_month', label: 'Inscrit le', value: new Date(selectedClient.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    { icon: 'child_care', label: 'Enfants suivis', value: `${selectedClient.children} enfant${selectedClient.children > 1 ? 's' : ''}` },
                    { icon: 'payments', label: 'Montant mensuel', value: (planConfig[selectedClient.plan] || planConfig.free).price },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3 py-3.5">
                      <span className="material-symbols-outlined text-outline text-[20px] shrink-0" aria-hidden="true">{d.icon}</span>
                      <span className="text-sm text-on-surface-variant flex-1 leading-relaxed">{d.label}</span>
                      <span className="text-sm font-bold text-on-surface">{d.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Actions</p>
                  {selectedClient.status !== 'actif' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedClient.id, 'actif')}
                      className="w-full py-3.5 rounded-xl bg-success/8 text-success font-semibold flex items-center justify-center gap-2 hover:bg-success/15 transition-all duration-300 cursor-pointer min-h-[52px] focus-visible:outline-2 focus-visible:outline-success"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
                      Réactiver le compte
                    </button>
                  )}
                  {selectedClient.status !== 'suspendu' && selectedClient.status !== 'banni' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedClient.id, 'suspendu')}
                      className="w-full py-3.5 rounded-xl bg-surface-low text-on-surface-variant font-semibold flex items-center justify-center gap-2 hover:bg-surface-high transition-all duration-300 cursor-pointer min-h-[52px] focus-visible:outline-2 focus-visible:outline-outline"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">pause_circle</span>
                      Suspendre le compte
                    </button>
                  )}
                  {selectedClient.status !== 'banni' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedClient.id, 'banni')}
                      className="w-full py-3.5 rounded-xl bg-error/8 text-error font-semibold flex items-center justify-center gap-2 hover:bg-error/15 transition-all duration-300 cursor-pointer min-h-[52px] focus-visible:outline-2 focus-visible:outline-error"
                    >
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">block</span>
                      Bannir pour non-paiement
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
