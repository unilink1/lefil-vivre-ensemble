'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getClients, type Client } from '@/lib/adminStore'

export default function AdminAbonnementsPage() {
  const [clients, setClients] = useState<Client[]>([])
  useEffect(() => { setClients(getClients()) }, [])

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
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-2">Abonnements</h1>
          <p className="text-on-surface-variant mb-12">Vue d&apos;ensemble des forfaits actifs</p>

          {/* Revenue Overview */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-10 border border-primary/15 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold">Revenu mensuel récurrent</h2>
            </div>
            <div className="font-[family-name:var(--font-heading)] text-5xl font-extrabold text-primary mb-2">
              {totalRevenue} <span className="text-2xl text-on-surface-variant font-semibold">CHF/mois</span>
            </div>
            <p className="text-on-surface-variant">{actifs.length} abonnements actifs</p>
          </div>

          {/* Plans breakdown */}
          <div className="grid sm:grid-cols-3 gap-8 mb-14">
            {([
              { key: 'essentiel' as const, name: 'Essentiel', price: 77, emoji: '🌱', color: 'border-outline-variant/20' },
              { key: 'serenite' as const, name: 'Sérénité', price: 99, emoji: '🌿', color: 'border-primary/30' },
              { key: 'accompagnement' as const, name: 'Accompagnement+', price: 165, emoji: '🌳', color: 'border-secondary/30' },
            ]).map((plan, i) => (
              <motion.div key={i} whileHover={{ y: -3 }}
                className={`bg-surface-card rounded-2xl p-8 border ${plan.color}`}>
                <div className="text-3xl mb-4">{plan.emoji}</div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-outline mb-6">{plan.price} CHF/mois</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-[family-name:var(--font-heading)] text-3xl font-extrabold">{plans[plan.key].length}</span>
                  <span className="text-sm text-on-surface-variant">abonnés</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-primary">{revenue[plan.key]} CHF</span>
                  <span className="text-xs text-outline">/mois</span>
                </div>
                {/* Subscribers list */}
                {plans[plan.key].length > 0 && (
                  <div className="mt-6 pt-4 border-t border-outline-variant/15 space-y-2">
                    {plans[plan.key].map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0">
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
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">warning</span>
                Impayés à traiter
              </h2>
              <div className="space-y-3">
                {clients.filter(c => c.status === 'impaye').map(c => (
                  <div key={c.id} className="bg-warning/5 border border-warning/20 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-warning/15 rounded-xl flex items-center justify-center text-amber-700 font-bold text-sm">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-on-surface-variant">
                        Dernier paiement : {new Date(c.lastPayment).toLocaleDateString('fr-FR')} — Plan {c.plan}
                      </p>
                    </div>
                    <Link href="/admin/clients" className="text-sm text-primary font-semibold hover:underline">Gérer →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
