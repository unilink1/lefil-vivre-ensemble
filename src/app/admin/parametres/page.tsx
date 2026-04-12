'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAdminSettings } from '@/hooks/useAdmin'

export default function AdminParametresPage() {
  const { settings, setSettings, save } = useAdminSettings()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

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

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-2">Paramètres</h1>
            <p className="text-on-surface-variant leading-relaxed">Configurez les liens de paiement et l&rsquo;assistant IA</p>
          </div>

          {/* Stripe Links */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100/80 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[22px]" aria-hidden="true">credit_card</span>
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface">Liens d&rsquo;abonnement Stripe</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">Ces liens seront utilisés sur les boutons de la page tarifs</p>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Essentiel (77 €/mois)', key: 'stripeEssentielLink' as const, icon: '🌱' },
                { label: 'Sérénité (99 €/mois)', key: 'stripeSereniteLink' as const, icon: '🌿' },
                { label: 'Accompagnement Plus (165 €/mois)', key: 'stripeAccompagnementLink' as const, icon: '🌳' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-semibold text-on-surface mb-2.5 flex items-center gap-2 block">
                    <span aria-hidden="true">{field.icon}</span> {field.label}
                  </label>
                  <input
                    value={settings[field.key]}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder="https://buy.stripe.com/..."
                    className="w-full px-4 py-3.5 bg-surface-low border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-mono leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* GPT Link */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100/80 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[22px]" aria-hidden="true">smart_toy</span>
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface">Assistant IA (GPT)</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">Lien vers votre assistant GPT personnalisé</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface mb-2.5 block">
                Lien de l&rsquo;assistant conversationnel
              </label>
              <input
                value={settings.gptAssistantLink}
                onChange={e => setSettings({ ...settings, gptAssistantLink: e.target.value })}
                placeholder="https://chatgpt.com/g/..."
                className="w-full px-4 py-3.5 bg-surface-low border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-mono leading-relaxed"
              />
              <p className="text-xs text-on-surface-variant mt-2.5 leading-relaxed">
                Ce lien sera utilisé sur le bouton &quot;Assistant IA&quot; de la sidebar et du dashboard.
              </p>
            </div>
          </div>

          {/* Save */}
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(74,144,217,0.30)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-4 gradient-primary text-white rounded-xl font-semibold text-base shadow-[0_4px_20px_rgba(74,144,217,0.20)] cursor-pointer transition-all flex items-center justify-center gap-2.5 min-h-[52px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-live="polite"
          >
            {saved ? (
              <>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
                Paramètres sauvegardés !
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">save</span>
                Enregistrer les paramètres
              </>
            )}
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
