'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'

const plans = [
  {
    name: 'Essentiel', price: 77, period: '/mois',
    features: ['Dossier centralisé', 'Partage sécurisé (3 accès)', 'Journal de suivi', 'Support email'],
    color: 'border-outline-variant/20',
  },
  {
    name: 'Sérénité', price: 99, period: '/mois', popular: true, current: true,
    features: ['Tout Essentiel', 'Accès praticiens illimités', 'Timeline unifiée', 'Support prioritaire 7j/7', 'Agenda partagé', 'Messagerie sécurisée'],
    color: 'border-primary',
  },
  {
    name: 'Accompagnement Plus', price: 165, period: '/mois',
    features: ['Tout Sérénité', 'Conciergerie administrative', 'Coordination MDPH', 'Appel mensuel dédié', 'Formations exclusives', 'Réseau de praticiens'],
    color: 'border-secondary',
  },
]

const accompagnements = [
  { icon: 'support_agent', name: 'Appel de soutien parental', desc: '30 min avec un coach spécialisé', price: '45 CHF', available: true },
  { icon: 'description', name: 'Aide dossier MDPH', desc: 'Accompagnement administratif complet', price: '120 CHF', available: true },
  { icon: 'school', name: 'Médiation scolaire', desc: "Préparation de la réunion d'équipe éducative", price: '90 CHF', available: true },
  { icon: 'psychology', name: 'Bilan de coordination', desc: 'Synthèse pluridisciplinaire avec tous les praticiens', price: '200 CHF', available: false },
]

export default function AbonnementPage() {
  const [selectedPlan, setSelectedPlan] = useState('Sérénité')

  return (
    <DashboardLayout breadcrumb={[{ label: 'Paramètres', href: '/dashboard/parametres' }, { label: 'Abonnement', href: '#' }]}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Current Plan */}
          <div className="bg-primary-fixed rounded-3xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" icon="verified">Plan Actif</Badge>
                </div>
                <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-on-surface">Plan Sérénité</h1>
                <p className="text-on-surface-variant mt-1">Renouvelé le 1er de chaque mois</p>
              </div>
              <div className="text-right">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-extrabold text-primary">99<span className="text-lg font-medium text-on-surface-variant"> CHF/mois</span></p>
                <p className="text-xs text-on-surface-variant mt-1">Prochain paiement : 1 avril 2026</p>
              </div>
            </div>

            {/* Usage */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary/10">
              {[
                { label: 'Praticiens connectés', value: '5', max: '∞' },
                { label: 'Documents stockés', value: '47', max: '500' },
                { label: 'Messages ce mois', value: '128', max: '∞' },
              ].map((u, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{u.label}</p>
                  <p className="font-bold text-on-surface text-lg">{u.value}<span className="text-xs text-outline">/{u.max}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-6">Changer de forfait</h2>
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {plans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Card
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`relative cursor-pointer transition-all ${
                    selectedPlan === plan.name
                      ? 'ring-2 ring-primary shadow-xl shadow-primary/10'
                      : `border ${plan.color}`
                  }`}
                  padding="lg"
                >
                  {plan.current && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      Actuel
                    </span>
                  )}
                  {plan.popular && !plan.current && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  )}
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5 mb-5">
                    <span className="font-[family-name:var(--font-heading)] text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-on-surface-variant text-sm">CHF{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.name && !plan.current && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5">
                      <Button fullWidth size="sm">Passer à {plan.name}</Button>
                    </motion.div>
                  )}
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Accompagnements */}
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-3">Réserver un accompagnement</h2>
          <p className="text-on-surface-variant mb-6">Services à la carte disponibles avec votre abonnement.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {accompagnements.map((acc, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <Card padding="lg" className={acc.available ? '' : 'opacity-50'}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-2xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[24px]">{acc.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-on-surface mb-1">{acc.name}</h4>
                      <p className="text-sm text-on-surface-variant mb-3">{acc.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-heading)] font-bold text-primary">{acc.price}</span>
                        <Button size="sm" variant={acc.available ? 'primary' : 'outline'} disabled={!acc.available}>
                          {acc.available ? 'Réserver' : 'Bientôt'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Billing */}
          <Card className="mt-8" padding="lg">
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4">Historique de facturation</h3>
            <div className="space-y-3">
              {[
                { date: '01/03/2026', amount: '99 CHF', status: 'Payé' },
                { date: '01/02/2026', amount: '99 CHF', status: 'Payé' },
                { date: '01/01/2026', amount: '99 CHF', status: 'Payé' },
              ].map((bill, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline text-[18px]">receipt</span>
                    <span className="text-sm text-on-surface">{bill.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-on-surface">{bill.amount}</span>
                    <Badge variant="secondary" size="sm">{bill.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cancel */}
          <div className="text-center mt-8 pb-4">
            <button className="text-sm text-error font-medium hover:underline cursor-pointer">
              Résilier mon abonnement
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
