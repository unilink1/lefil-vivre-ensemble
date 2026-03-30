'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

const plans = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 77,
    features: ['Dossier centralisé', 'Partage sécurisé (3 accès)', 'Journal de suivi', 'Support email'],
    color: '#5CB89A',
  },
  {
    id: 'serenite',
    name: 'Sérénité',
    price: 99,
    popular: true,
    features: ['Tout Essentiel', 'Accès praticiens illimités', 'Timeline unifiée', 'Support prioritaire 7j/7', 'Agenda partagé', 'Messagerie sécurisée'],
    color: '#3B82D9',
  },
  {
    id: 'accompagnement',
    name: 'Accompagnement+',
    price: 165,
    features: ['Tout Sérénité', 'Conciergerie administrative', 'Coordination MDPH', 'Appel mensuel dédié', 'Formations exclusives', 'Réseau de praticiens'],
    color: '#E09060',
  },
]

const services = [
  { icon: 'support_agent', name: 'Appel de soutien parental', desc: '30 min avec un coach spécialisé', price: '45 CHF', available: true },
  { icon: 'description', name: 'Aide dossier MDPH', desc: 'Accompagnement administratif complet', price: '120 CHF', available: true },
  { icon: 'school', name: 'Médiation scolaire', desc: "Préparation de la réunion d'équipe éducative", price: '90 CHF', available: true },
  { icon: 'psychology', name: 'Bilan de coordination', desc: 'Synthèse pluridisciplinaire avec tous les praticiens', price: '200 CHF', available: false },
]

export default function AbonnementPage() {
  const { profile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(profile?.subscription_plan || 'serenite')

  const currentPlan = profile?.subscription_plan || 'free'

  return (
    <DashboardLayout breadcrumb={[{ label: 'Paramètres', href: '/dashboard/parametres' }, { label: 'Abonnement', href: '#' }]}>
      <div className="max-w-4xl mx-auto pb-12">

        {/* Current plan hero */}
        <div className="bg-gradient-to-r from-[#3B82D9]/8 via-[#5CB89A]/5 to-transparent border border-[#3B82D9]/10 p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#3B82D9]/10 text-[#3B82D9] text-xs font-bold uppercase tracking-wider">Plan actif</span>
                {currentPlan === 'free' && (
                  <span className="px-3 py-1 bg-[#E09060]/10 text-[#E09060] text-xs font-bold uppercase tracking-wider">Période d&apos;essai</span>
                )}
              </div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gray-900">
                {currentPlan === 'free' ? 'Essai gratuit' : plans.find(p => p.id === currentPlan)?.name || 'Sérénité'}
              </h1>
              <p className="text-gray-500 mt-1">
                {currentPlan === 'free'
                  ? 'Votre mois d\'essai gratuit est en cours. Choisissez un forfait pour continuer.'
                  : 'Renouvelé automatiquement le 1er de chaque mois'
                }
              </p>
            </div>
            {currentPlan !== 'free' && (
              <div className="text-right">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-extrabold text-[#3B82D9]">
                  {plans.find(p => p.id === currentPlan)?.price || 99}
                  <span className="text-lg font-medium text-gray-400"> CHF/mois</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plans grid */}
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-6">
          {currentPlan === 'free' ? 'Choisissez votre forfait' : 'Changer de forfait'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {plans.map(plan => {
            const isSelected = selectedPlan === plan.id
            const isCurrent = currentPlan === plan.id
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white border shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-2 shadow-lg' : 'border-gray-100'
                }`}
                style={{ borderColor: isSelected ? plan.color : undefined }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1" style={{ backgroundColor: plan.color }}>
                    Populaire
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-3 py-1">
                    Actuel
                  </span>
                )}
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-5">
                  <span className="font-[family-name:var(--font-heading)] text-3xl font-extrabold" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-gray-400 text-sm">CHF/mois</span>
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: plan.color }}>check</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isSelected && !isCurrent && (
                  <button
                    className="w-full mt-5 py-3 text-white font-semibold cursor-pointer transition-all hover:opacity-90"
                    style={{ backgroundColor: plan.color }}
                  >
                    Passer à {plan.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* À la carte services */}
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-3">Réserver un accompagnement</h2>
        <p className="text-gray-500 mb-6">Services à la carte disponibles avec votre abonnement.</p>
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {services.map((s, i) => (
            <div key={i} className={`bg-white border border-gray-100 shadow-sm p-6 flex items-start gap-4 ${!s.available ? 'opacity-50' : ''}`}>
              <div className="w-12 h-12 bg-[#3B82D9]/8 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#3B82D9] text-[24px]">{s.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{s.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: '#3B82D9' }}>{s.price}</span>
                  <button
                    disabled={!s.available}
                    className={`px-4 py-2 text-sm font-medium cursor-pointer transition-all ${
                      s.available
                        ? 'bg-[#3B82D9] text-white hover:bg-[#2970c9]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {s.available ? 'Réserver' : 'Bientôt'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Billing history */}
        <div className="bg-white border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-4">Historique de facturation</h3>
          <div className="space-y-3">
            {[
              { date: '01/03/2026', amount: '99 CHF', status: 'Payé' },
              { date: '01/02/2026', amount: '99 CHF', status: 'Payé' },
              { date: '01/01/2026', amount: '99 CHF', status: 'Payé' },
            ].map((bill, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">receipt</span>
                  <span className="text-sm text-gray-700">{bill.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-800">{bill.amount}</span>
                  <span className="px-2 py-0.5 bg-[#5CB89A]/10 text-[#5CB89A] text-xs font-medium">{bill.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel */}
        <div className="text-center">
          <button className="text-sm text-red-500 font-medium hover:underline cursor-pointer">
            Résilier mon abonnement
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
