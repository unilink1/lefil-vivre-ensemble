'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminClients } from '@/hooks/useAdmin'

const statCards = [
  { icon: 'group', label: 'Clients actifs', color: 'bg-primary', key: 'actif' },
  { icon: 'warning', label: 'Impayes', color: 'bg-warning', key: 'impaye' },
  { icon: 'block', label: 'Bannis', color: 'bg-error', key: 'banni' },
  { icon: 'pause_circle', label: 'Suspendus', color: 'bg-outline', key: 'suspendu' },
]

const navItems = [
  { icon: 'group', label: 'Gestion clients', href: '/admin/clients', desc: 'Voir, bannir, suspendre, relancer' },
  { icon: 'credit_card', label: 'Abonnements', href: '/admin/abonnements', desc: 'Suivi des forfaits et paiements' },
  { icon: 'settings', label: 'Parametres', href: '/admin/parametres', desc: 'Liens Stripe, lien GPT, config' },
]

export default function AdminDashboardPage() {
  const { clients, loading } = useAdminClients()

  const counts = {
    actif: clients.filter(c => c.status === 'actif').length,
    impaye: clients.filter(c => c.status === 'impaye').length,
    banni: clients.filter(c => c.status === 'banni').length,
    suspendu: clients.filter(c => c.status === 'suspendu').length,
  }
  const totalRevenue = clients.filter(c => c.status === 'actif').reduce((sum, c) => {
    const prices: Record<string, number> = { essentiel: 77, serenite: 99, accompagnement: 165 }
    return sum + (prices[c.plan] || 0)
  }, 0)

  return (
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            &larr; Retour au site
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-2">Tableau de bord</h1>
          <p className="text-on-surface-variant mb-12">Gestion des clients et abonnements Le Fil</p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-14">
                {statCards.map((s) => (
                  <motion.div key={s.key} whileHover={{ y: -3 }}
                    className="bg-surface-card rounded-2xl p-6 border border-outline-variant/15 shadow-[0_2px_8px_rgba(45,55,72,0.04)]">
                    <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                      <span className="material-symbols-outlined text-white text-[22px]">{s.icon}</span>
                    </div>
                    <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-1">
                      {counts[s.key as keyof typeof counts]}
                    </div>
                    <div className="text-sm text-on-surface-variant">{s.label}</div>
                  </motion.div>
                ))}
                <motion.div whileHover={{ y: -3 }}
                  className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/15">
                  <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-white text-[22px]">payments</span>
                  </div>
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-primary mb-1">
                    {totalRevenue} <span className="text-lg font-semibold text-on-surface-variant">CHF</span>
                  </div>
                  <div className="text-sm text-on-surface-variant">Revenu mensuel</div>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="grid sm:grid-cols-3 gap-6 mb-14">
                {navItems.map((item, i) => (
                  <Link key={i} href={item.href}>
                    <motion.div whileHover={{ y: -4, boxShadow: '0 8px 40px rgba(45,55,72,0.1)' }}
                      className="bg-surface-card rounded-2xl p-8 border border-outline-variant/15 cursor-pointer transition-all group h-full">
                      <div className="w-14 h-14 bg-surface-low rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-fixed transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[28px]">{item.icon}</span>
                      </div>
                      <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-2">{item.label}</h3>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Impayés alert */}
              {counts.impaye > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-warning/8 border border-warning/20 rounded-2xl p-6 flex items-start gap-4">
                  <span className="material-symbols-outlined text-warning text-[24px] mt-0.5">priority_high</span>
                  <div>
                    <h4 className="font-semibold text-on-surface mb-1">{counts.impaye} client(s) en impaye</h4>
                    <p className="text-sm text-on-surface-variant mb-3">Des paiements sont en retard. Vérifiez les comptes et relancez si nécessaire.</p>
                    <Link href="/admin/clients?filter=impaye" className="text-sm text-primary font-semibold hover:underline">
                      Voir les impayes &rarr;
                    </Link>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
