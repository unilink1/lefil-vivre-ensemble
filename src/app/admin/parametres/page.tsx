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
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            &larr; Tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold mb-2">Parametres</h1>
          <p className="text-on-surface-variant mb-12">Configurez les liens de paiement et l&apos;assistant IA</p>

          {/* Stripe Links */}
          <div className="bg-surface-card rounded-2xl p-8 border border-outline-variant/15 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]">credit_card</span>
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg">Liens d&apos;abonnement Stripe</h2>
                <p className="text-sm text-on-surface-variant">Ces liens seront utilises sur les boutons de la page tarifs et abonnement</p>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Essentiel (77 €/mois)', key: 'stripeEssentielLink' as const, icon: '🌱' },
                { label: 'Serenite (99 €/mois)', key: 'stripeSereniteLink' as const, icon: '🌿' },
                { label: 'Accompagnement Plus (165 €/mois)', key: 'stripeAccompagnementLink' as const, icon: '🌳' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-semibold text-on-surface mb-2 flex items-center gap-2">
                    <span>{field.icon}</span> {field.label}
                  </label>
                  <input
                    value={settings[field.key]}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder="https://buy.stripe.com/..."
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* GPT Link */}
          <div className="bg-surface-card rounded-2xl p-8 border border-outline-variant/15 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[22px]">smart_toy</span>
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg">Assistant IA (GPT)</h2>
                <p className="text-sm text-on-surface-variant">Lien vers votre assistant GPT personnalise</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface mb-2 block">Lien de l&apos;assistant conversationnel</label>
              <input
                value={settings.gptAssistantLink}
                onChange={e => setSettings({ ...settings, gptAssistantLink: e.target.value })}
                placeholder="https://chatgpt.com/g/..."
                className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all font-mono"
              />
              <p className="text-xs text-outline mt-2">Ce lien sera utilise sur le bouton &quot;Discuter avec l&apos;assistant&quot; de la landing page et du dashboard.</p>
            </div>
          </div>

          {/* Save */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-4 gradient-primary text-white rounded-xl font-semibold text-base shadow-[0_4px_20px_rgba(74,144,217,0.25)] cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <><span className="material-symbols-outlined text-[20px]">check</span> Sauvegarde !</>
            ) : (
              <><span className="material-symbols-outlined text-[20px]">save</span> Enregistrer les parametres</>
            )}
          </motion.button>
        </motion.div>
      </main>
    </div>
  )
}
