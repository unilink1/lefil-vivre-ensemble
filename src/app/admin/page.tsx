'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminClients } from '@/hooks/useAdmin'

const statCards = [
  { icon: 'group', label: 'Clients actifs', colorBg: 'bg-primary/10', colorText: 'text-primary', colorIcon: 'text-primary', key: 'actif' },
  { icon: 'warning', label: 'Impayés', colorBg: 'bg-warning/10', colorText: 'text-warning', colorIcon: 'text-warning', key: 'impaye' },
  { icon: 'block', label: 'Bannis', colorBg: 'bg-error/10', colorText: 'text-error', colorIcon: 'text-error', key: 'banni' },
  { icon: 'pause_circle', label: 'Suspendus', colorBg: 'bg-outline/10', colorText: 'text-on-surface-variant', colorIcon: 'text-outline', key: 'suspendu' },
]

const navItems = [
  { icon: 'group', label: 'Gestion clients', href: '/admin/clients', desc: 'Voir, bannir, suspendre, relancer', color: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
  { icon: 'credit_card', label: 'Abonnements', href: '/admin/abonnements', desc: 'Suivi des forfaits et paiements', color: 'text-secondary', bg: 'bg-secondary/5 hover:bg-secondary/10' },
  { icon: 'database', label: 'CRM', href: '/admin/crm', desc: 'Historique complet, recherche, export CSV', color: 'text-tertiary', bg: 'bg-tertiary/5 hover:bg-tertiary/10' },
  { icon: 'settings', label: 'Paramètres', href: '/admin/parametres', desc: 'Liens Stripe, lien GPT, config', color: 'text-on-surface-variant', bg: 'bg-surface-low hover:bg-surface-high' },
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
    <div className="min-h-dvh bg-surface font-[family-name:var(--font-body)]">

      {/* ── Header ── */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/8 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link
            href="/"
            className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg hover:bg-surface-low"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Retour au site
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Page title */}
          <div className="mb-12">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-2">
              Tableau de bord
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Gestion des clients et abonnements Le Fil
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-5" />
                <p className="text-on-surface-variant text-sm">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Stats grid ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-14">
                {statCards.map((s, idx) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className={`w-11 h-11 ${s.colorBg} rounded-xl flex items-center justify-center mb-5`}>
                      <span className={`material-symbols-outlined ${s.colorIcon} text-[22px]`} aria-hidden="true">{s.icon}</span>
                    </div>
                    <div className={`font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-1.5 ${s.colorText}`}>
                      {counts[s.key as keyof typeof counts]}
                    </div>
                    <div className="text-sm text-on-surface-variant font-medium">{s.label}</div>
                  </motion.div>
                ))}

                {/* Revenue card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: statCards.length * 0.07 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-white text-[22px]" aria-hidden="true">payments</span>
                  </div>
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-primary mb-1.5">
                    {totalRevenue}&thinsp;<span className="text-lg font-semibold text-on-surface-variant">€</span>
                  </div>
                  <div className="text-sm text-on-surface-variant font-medium">Revenu mensuel</div>
                </motion.div>
              </div>

              {/* ── Navigation cards ── */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
                {navItems.map((item, i) => (
                  <Link key={i} href={item.href} className="group">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl p-7 border border-gray-100/80 cursor-pointer transition-all duration-300 group-hover:shadow-md h-full"
                    >
                      <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300`}>
                        <span className={`material-symbols-outlined ${item.color} text-[28px]`} aria-hidden="true">{item.icon}</span>
                      </div>
                      <h3 className="font-[family-name:var(--font-heading)] font-bold text-base text-on-surface mb-2 group-hover:text-primary transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* ── Impayés alert ── */}
              {counts.impaye > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-warning/6 border border-warning/20 rounded-2xl p-6 flex items-start gap-4"
                  role="alert"
                >
                  <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-warning text-[22px]" aria-hidden="true">priority_high</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-on-surface mb-1.5">
                      {counts.impaye} client{counts.impaye > 1 ? 's' : ''} avec paiement en attente
                    </h4>
                    <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                      Des paiements sont en retard. Vérifiez les comptes et relancez si nécessaire.
                    </p>
                    <Link
                      href="/admin/clients?filter=impaye"
                      className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      Voir les impayés
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
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
