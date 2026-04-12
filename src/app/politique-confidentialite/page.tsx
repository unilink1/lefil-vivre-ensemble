'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PolitiqueConfidentialitePage() {
  const sections = [
    {
      title: 'Collecte des donn\u00e9es',
      icon: 'database',
      content: `Nous collectons uniquement les donn\u00e9es n\u00e9cessaires au fonctionnement de la plateforme : informations de compte (nom, email), donn\u00e9es de sant\u00e9 de vos enfants saisies volontairement, et donn\u00e9es techniques de navigation. Aucune donn\u00e9e n\u2019est collect\u00e9e \u00e0 votre insu.`,
    },
    {
      title: 'Utilisation des donn\u00e9es',
      icon: 'settings',
      content: `Vos donn\u00e9es sont utilis\u00e9es exclusivement pour fournir et am\u00e9liorer nos services : coordination du suivi de sant\u00e9, partage s\u00e9curis\u00e9 avec les praticiens autoris\u00e9s, et personnalisation de votre exp\u00e9rience. Nous ne vendons jamais vos donn\u00e9es \u00e0 des tiers.`,
    },
    {
      title: 'Stockage et s\u00e9curit\u00e9',
      icon: 'encrypted',
      content: `Toutes les donn\u00e9es sont chiffr\u00e9es (AES-256) et h\u00e9berg\u00e9es sur des serveurs conformes aux normes HDS (H\u00e9bergement de Donn\u00e9es de Sant\u00e9). Les acc\u00e8s sont strictement contr\u00f4l\u00e9s et audit\u00e9s r\u00e9guli\u00e8rement.`,
    },
    {
      title: 'Cookies',
      icon: 'cookie',
      content: `Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification, pr\u00e9f\u00e9rences). Les cookies analytiques ne sont activ\u00e9s qu\u2019avec votre consentement explicite. Vous pouvez modifier vos pr\u00e9f\u00e9rences \u00e0 tout moment.`,
    },
    {
      title: 'Vos droits',
      icon: 'gavel',
      content: `Conform\u00e9ment au RGPD, vous disposez d\u2019un droit d\u2019acc\u00e8s, de rectification, de suppression, de portabilit\u00e9 et d\u2019opposition concernant vos donn\u00e9es personnelles. Pour exercer ces droits, contactez-nous \u00e0 l\u2019adresse indiqu\u00e9e ci-dessous.`,
    },
    {
      title: 'Conservation des donn\u00e9es',
      icon: 'schedule',
      content: `Vos donn\u00e9es sont conserv\u00e9es pendant la dur\u00e9e de votre utilisation du service, puis supprim\u00e9es dans un d\u00e9lai de 30 jours apr\u00e8s la cl\u00f4ture de votre compte. Les donn\u00e9es de sant\u00e9 peuvent \u00eatre conserv\u00e9es plus longtemps si la l\u00e9gislation l\u2019exige.`,
    },
    {
      title: 'Contact',
      icon: 'mail',
      content: `Pour toute question relative \u00e0 la protection de vos donn\u00e9es, vous pouvez nous contacter par email ou via le formulaire de contact accessible depuis notre site.`,
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto h-[72px] flex items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-on-surface font-bold text-lg font-[family-name:var(--font-heading)]">
            Le Fil
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-[10px] text-sm font-semibold hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Vos donn\u00e9es</p>
          <h1 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold text-on-surface mb-4">
            Politique de confidentialit\u00e9
          </h1>
          <p className="text-on-surface-variant mb-4">
            Chez Le Fil, la protection de vos donn\u00e9es personnelles et de celles de vos enfants est notre priorit\u00e9 absolue.
            Cette page d\u00e9taille comment nous collectons, utilisons et prot\u00e9geons vos informations.
          </p>
          <p className="text-xs text-outline mb-12">
            Derni\u00e8re mise \u00e0 jour : avril 2026
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="bg-surface-card rounded-2xl border border-outline-variant/25 p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-primary">{section.icon}</span>
                </div>
                <h2 className="font-[family-name:var(--font-heading)] font-bold text-on-surface">
                  {section.title}
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-outline-variant/30 text-center"
        >
          <p className="text-sm text-on-surface-variant mb-4">
            Des questions sur vos donn\u00e9es ?
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] hover:shadow-[0_4px_20px_rgba(74,144,217,0.35)] transition-all"
          >
            Nous contacter
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
