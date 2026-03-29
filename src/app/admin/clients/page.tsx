'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminClients, type AdminClient } from '@/hooks/useAdmin'

const statusConfig = {
  actif: { label: 'Actif', color: 'bg-success/15 text-success', dot: 'bg-success' },
  impaye: { label: 'Impaye', color: 'bg-warning/15 text-amber-700', dot: 'bg-warning' },
  banni: { label: 'Banni', color: 'bg-error/15 text-error', dot: 'bg-error' },
  suspendu: { label: 'Suspendu', color: 'bg-outline/15 text-on-surface-variant', dot: 'bg-outline' },
}

const planConfig: Record<string, { label: string; price: string; color: string }> = {
  free: { label: 'Gratuit', price: '0 CHF', color: 'bg-surface-low text-on-surface-variant' },
  essentiel: { label: 'Essentiel', price: '77 CHF', color: 'bg-surface-low text-on-surface-variant' },
  serenite: { label: 'Serenite', price: '99 CHF', color: 'bg-primary-fixed text-primary' },
  accompagnement: { label: 'Accompagnement+', price: '165 CHF', color: 'bg-secondary-container text-secondary' },
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
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            &larr; Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-1">Gestion clients</h1>
              <p className="text-on-surface-variant">{clients.length} clients au total</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full pl-12 pr-4 py-3 bg-surface-card border border-outline-variant/20 rounded-xl text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {(['tous', 'actif', 'impaye', 'banni', 'suspendu'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer capitalize ${
                        filter === f ? 'gradient-primary text-white shadow-md' : 'bg-surface-card text-on-surface-variant border border-outline-variant/20 hover:border-primary/30'
                      }`}>
                      {f === 'tous' ? 'Tous' : statusConfig[f as keyof typeof statusConfig]?.label || f}
                      <span className="ml-1.5 text-xs opacity-70">
                        ({f === 'tous' ? clients.length : clients.filter(c => c.status === f).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client List */}
              <div className="space-y-3">
                {filtered.map((client, i) => {
                  const st = statusConfig[client.status] || statusConfig.actif
                  const pl = planConfig[client.plan] || planConfig.free
                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedClient(client)}
                      className="bg-surface-card rounded-2xl p-4 sm:p-6 border border-outline-variant/15 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-on-surface truncate">{client.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                            <span className="truncate">{client.email}</span>
                            {client.phone && <span className="hidden sm:inline">{client.phone}</span>}
                          </div>
                        </div>
                        <div className="hidden md:block text-right shrink-0">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${pl.color}`}>{pl.label}</span>
                          <p className="text-xs text-outline mt-1">{pl.price}/mois</p>
                        </div>
                        <div className="hidden lg:flex items-center gap-1.5 text-sm text-on-surface-variant shrink-0">
                          <span className="material-symbols-outlined text-[18px]">child_care</span>
                          {client.children}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {client.status !== 'banni' && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'banni') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-error/5 text-error hover:bg-error/15 transition-colors cursor-pointer" title="Bannir">
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </motion.button>
                          )}
                          {client.status === 'banni' && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'actif') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-success/5 text-success hover:bg-success/15 transition-colors cursor-pointer" title="Reactiver">
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </motion.button>
                          )}
                          {client.status === 'impaye' && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(client.id, 'suspendu') }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-warning/5 text-amber-700 hover:bg-warning/15 transition-colors cursor-pointer" title="Suspendre">
                              <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-20 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] text-outline/30 block mb-4">search_off</span>
                    <p>Aucun client trouve</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* Client Detail Drawer */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-on-surface/30 z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-card z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold">Detail client</h2>
                  <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-surface-low rounded-xl cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{selectedClient.name}</h3>
                  <p className="text-on-surface-variant text-sm">{selectedClient.email}</p>
                  {selectedClient.phone && <p className="text-on-surface-variant text-sm">{selectedClient.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-surface-low rounded-xl p-4 text-center">
                    <p className="text-xs text-outline uppercase tracking-wider mb-1">Statut</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${(statusConfig[selectedClient.status] || statusConfig.actif).color}`}>
                      <span className={`w-2 h-2 rounded-full ${(statusConfig[selectedClient.status] || statusConfig.actif).dot}`} />
                      {(statusConfig[selectedClient.status] || statusConfig.actif).label}
                    </span>
                  </div>
                  <div className="bg-surface-low rounded-xl p-4 text-center">
                    <p className="text-xs text-outline uppercase tracking-wider mb-1">Forfait</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${(planConfig[selectedClient.plan] || planConfig.free).color}`}>
                      {(planConfig[selectedClient.plan] || planConfig.free).label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: 'calendar_month', label: 'Inscrit le', value: new Date(selectedClient.startDate).toLocaleDateString('fr-FR') },
                    { icon: 'child_care', label: 'Enfants suivis', value: selectedClient.children.toString() },
                    { icon: 'payments', label: 'Montant mensuel', value: (planConfig[selectedClient.plan] || planConfig.free).price },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <span className="material-symbols-outlined text-outline text-[20px]">{d.icon}</span>
                      <span className="text-sm text-on-surface-variant flex-1">{d.label}</span>
                      <span className="text-sm font-semibold text-on-surface">{d.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Actions</p>
                  {selectedClient.status !== 'actif' && (
                    <button onClick={() => handleUpdateStatus(selectedClient.id, 'actif')}
                      className="w-full py-3 rounded-xl bg-success/10 text-success font-semibold flex items-center justify-center gap-2 hover:bg-success/20 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      Reactiver le compte
                    </button>
                  )}
                  {selectedClient.status !== 'suspendu' && selectedClient.status !== 'banni' && (
                    <button onClick={() => handleUpdateStatus(selectedClient.id, 'suspendu')}
                      className="w-full py-3 rounded-xl bg-outline/10 text-on-surface-variant font-semibold flex items-center justify-center gap-2 hover:bg-outline/20 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                      Suspendre le compte
                    </button>
                  )}
                  {selectedClient.status !== 'banni' && (
                    <button onClick={() => handleUpdateStatus(selectedClient.id, 'banni')}
                      className="w-full py-3 rounded-xl bg-error/10 text-error font-semibold flex items-center justify-center gap-2 hover:bg-error/20 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">block</span>
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
