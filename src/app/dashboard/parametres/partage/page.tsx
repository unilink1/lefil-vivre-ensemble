'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'

const links = [
  { name: 'Mme Sophie Martin', specialty: 'Orthophoniste', created: '12/01/26', accesses: 12, active: true },
  { name: 'Dr Jean Dupont', specialty: 'Pédiatre', created: '05/02/26', accesses: 6, active: true },
]

export default function PartageParametresPage() {
  const [activeLinks, setActiveLinks] = useState(links.map(() => true))

  return (
    <DashboardLayout breadcrumb={[{ label: 'Paramètres', href: '/dashboard/parametres' }, { label: 'Liens de partage', href: '#' }]}>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-3">Liens de partage actifs</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Les praticiens accèdent aux informations de votre enfant via ces liens sécurisés. Vous pouvez révoquer l&apos;accès à tout moment.
          </p>

          <div className="space-y-4">
            {links.map((link, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <Card className={`border-l-4 ${activeLinks[i] ? 'border-secondary' : 'border-outline-variant'}`} padding="lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-on-surface mb-1">{link.name}</h3>
                      <Badge variant="secondary" size="sm">{link.specialty}</Badge>
                      <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                        <span>Créé le {link.created}</span>
                        <span>{link.accesses} accès</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const next = [...activeLinks]
                        next[i] = !next[i]
                        setActiveLinks(next)
                      }}
                      className={`w-12 h-7 rounded-full transition-all cursor-pointer relative ${activeLinks[i] ? 'bg-secondary' : 'bg-surface-high'}`}
                    >
                      <motion.div
                        animate={{ x: activeLinks[i] ? 22 : 2 }}
                        className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow"
                      />
                    </motion.button>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Créer un nouveau lien de partage
          </motion.button>

          <div className="mt-6">
            <Button fullWidth size="lg" icon="share">Partager un accès</Button>
          </div>

          {/* Security Info */}
          <Card className="mt-8 bg-surface-low border-none" padding="lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5">shield</span>
              <div>
                <h4 className="font-semibold text-on-surface mb-2">Sécurité & Confidentialité</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Chaque lien est unique et crypté. Les professionnels de santé accèdent via un accès temporaire et sécurisé.
                  Seules les informations de suivi que vous avez sélectionnées pour ce praticien sont visibles.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
