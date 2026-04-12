'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminClients } from '@/hooks/useAdmin'

export default function AdminAbonnementsPage() {
  const { clients, loading } = useAdminClients()

  const actifs = clients.filter(c => c.status === 'actif')
  const plans = {
    essentiel: actifs.filter(c => c.plan === 'essentiel'),
    serenite: actifs.filter(c => c.plan === 'serenite'),
    accompagnement: actifs.filter(c => c.plan === 'accompagnement'),
  }

  const revenue = {
    essentiel: plans.essentiel.length * 77,
    serenite: plans.serenite.length * 99,
    accompagnement: plans.accompagnement.length * 165,
  }
  const totalRevenue = revenue.essentiel + revenue.serenite + revenue.accompagnement

  return (
    <div className="min-h-dvh bg-surface font-[family-name:var(--font-body)]">
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/8 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg hover:bg-surface-low">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-12">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-2">Abonnements</h1>
            <p className="text-on-surface-variant leading-relaxed">Vue d&rsquo;ensemble des forfaits actifs</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-on-surface-variant text-sm">Chargement des abonnements...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Revenue overview */}
              <div className="bg-gradient-to-br from-primary/6 to-secondary/6 rounded-2xl p-10 border border-primary/12 mb-10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-white text-[24px]" aria-hidden="true">account_balance</span>
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-on-surface">Revenu mensuel récurrent</h2>
                    <p className="text-sm text-on-surface-variant">{actifs.length} abonnements actifs</p>
                  </div>
                </div>
                <div className="font-[family-name:var(--font-heading)] text-5xl font-extrabold text-primary tabular-nums">
                  {totalRevenue.toLocaleString('fr-FR')}&thinsp;<span className="text-2xl text-on-surface-variant font-semibold">€/mois</span>
                </div>
              </div>

              {/* Plans breakdown */}
              <div className="grid sm:grid-cols-3 gap-6 mb-14">
                {([
                  { key: 'essentiel' as const, name: 'Essentiel', price: 77, emoji: '🌱', borderColor: 'border-gray-100/80' },
                  { key: 'serenite' as const, name: 'Sérénité', price: 99, emoji: '🌿', borderColor: 'border-primary/20' },
                  { key: 'accompagnement' as const, name: 'Accompagnement+', price: 165, emoji: '🌳', borderColor: 'border-secondary/20' },
                ]).map((plan, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`bg-white rounded-2xl p-8 border ${plan.borderColor} shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <div className="text-3xl mb-5" aria-hidden="true">{plan.emoji}</div>
                    <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface mb-1">{plan.name}</h3>
                    <p className="text-sm text-on-surface-variant mb-7 font-medium">{plan.price} €/mois</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface tabular-nums">{plans[plan.key].length}</span>
                      <span className="text-sm text-on-surface-variant">abonné{plans[plan.key].length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-primary tabular-nums">{revenue[plan.key].toLocaleString('fr-FR')} €</span>
                      <span className="text-xs text-on-surface-variant">/mois</span>
                    </div>
                    {plans[plan.key].length > 0 && (
                      <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5">
                        {plans[plan.key].map(c => (
                          <div key={c.id} className="flex items-center gap-2.5 text-sm">
                            <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0" aria-hidden="true">
                              {c.name[0]}
                            </div>
                            <span className="text-on-surface truncate">{c.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Impayés list */}
              {clients.filter(c => c.status === 'impaye').length > 0 && (
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-6 flex items-center gap-2.5 text-on-surface">
                    <span className="material-symbols-outlined text-warning text-[24px]" aria-hidden="true">warning</span>
                    Impayés à traiter
                  </h2>
                  <div className="space-y-3">
                    {clients.filter(c => c.status === 'impaye').map(c => (
                      <div key={c.id} className="bg-warning/5 border border-warning/20 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 bg-warning/12 rounded-xl flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">{c.name}</p>
                          <p className="text-sm text-on-surface-variant">Plan {c.plan}</p>
                        </div>
                        <Link
                          href="/admin/clients"
                          className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline shrink-0"
                        >
                          Gérer
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
