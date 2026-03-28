'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'

const sessions = [
  {
    date: '18 Mar 2026',
    type: 'Orthophonie',
    progress: 4,
    emoji: '😊',
    practitioner: 'Sophie Martin',
    note: 'Progres notables sur les phonemes complexes. Lucas montre une meilleure concentration pendant les exercices.',
  },
  {
    date: '12 Mar 2026',
    type: 'Psychomotricite',
    progress: 2,
    emoji: '😐',
    practitioner: 'Jean-Luc Petit',
    note: 'Seance correcte. Quelques difficultes de coordination fine, a retravailler.',
  },
  {
    date: '05 Mar 2026',
    type: 'Orthophonie',
    progress: 5,
    emoji: '😄',
    practitioner: 'Sophie Martin',
    note: 'Excellente seance ! Lucas a montre beaucoup d\'enthousiasme pour les jeux de lecture.',
  },
]

const sharedDocuments = [
  { name: 'Bilan Neuropsychologique - Jan 2026.pdf', size: '2.4 MB' },
  { name: 'Compte-rendu Ecole (T1) - Dec 2025.pdf', size: '0.8 MB' },
  { name: 'PAP scolaire 2025-2026.pdf', size: '1.2 MB' },
]

/**
 * Shared patient view page.
 *
 * SECURITY NOTE — Production token validation:
 * Currently this page renders demo/static data. In production, the share token
 * from the URL search params (e.g. ?token=abc123) MUST be validated server-side
 * before rendering any patient data. Use the `getSharedData(token)` function
 * from `@/hooks/useData` to:
 *   1. Verify the token exists and has not expired
 *   2. Check that the token grants access to the requested patient
 *   3. Fetch only the data the token authorises (scoped read)
 *
 * If the token is missing, invalid, or expired, redirect to an error page
 * or display a "Link expired" message — never show patient data.
 */
export default function PartagePage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedProgress, setSelectedProgress] = useState(0)

  return (
    <div className="min-h-dvh bg-surface relative">
      <FloatingOrbs variant="subtle" />

      {/* Security Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <Badge variant="secondary" icon="shield" size="md">Acces securise — Lien partage par Marie D.</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">

        {/* Child Summary Hero */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" />
            <div className="relative p-8">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Dossier patient</p>
                  <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold text-on-surface mb-3">Lucas, 7 ans</h1>
                  <p className="text-on-surface-variant mb-5">Suivi pluridisciplinaire coordonne</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <Badge variant="primary" size="md">TDAH</Badge>
                    <Badge variant="secondary" size="md">Dyslexie</Badge>
                  </div>

                  {/* Treatments */}
                  <div className="mb-5">
                    <p className="text-xs text-outline uppercase tracking-wider mb-2">Traitements en cours</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card/80 rounded-lg text-sm">
                        <span className="material-symbols-outlined text-primary text-[16px]">medication</span>
                        <span className="text-on-surface font-medium">Methylphenidate 10mg/jour</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card/80 rounded-lg text-sm">
                        <span className="material-symbols-outlined text-secondary text-[16px]">nutrition</span>
                        <span className="text-on-surface font-medium">Omega-3</span>
                      </div>
                    </div>
                  </div>

                  {/* Frequency info */}
                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">record_voice_over</span>
                      Orthophonie 2x/semaine
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">directions_run</span>
                      Psychomotricite 1x/semaine
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/15">
                    LD
                  </div>
                </div>
              </div>

              {/* Allergies Alert */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-error-container/80 backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 border border-error/10"
              >
                <div className="w-10 h-10 bg-error/15 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-[22px]">warning</span>
                </div>
                <div>
                  <p className="font-bold text-error text-sm mb-2">Allergies connues</p>
                  <div className="flex gap-2">
                    <Badge variant="error" icon="dangerous">Arachides</Badge>
                    <Badge variant="error" icon="dangerous">Penicilline</Badge>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>

        {/* Add Observation Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">clinical_notes</span>
              Historique des seances
            </h2>
            <Button size="sm" icon={showForm ? 'close' : 'add'} onClick={() => setShowForm(!showForm)} variant={showForm ? 'ghost' : 'primary'}>
              {showForm ? 'Fermer' : 'Ajouter une observation'}
            </Button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card padding="lg" className="mb-6 border-2 border-primary/20 shadow-lg shadow-primary/5">
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                  Nouvelle observation
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Date de la seance</label>
                      <input
                        type="date"
                        className="w-full bg-surface-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Progression (1-5)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <motion.button
                            key={n}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedProgress(n)}
                            className={`w-12 h-12 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                              selectedProgress === n
                                ? 'gradient-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface-low hover:bg-surface-high text-on-surface-variant border border-outline-variant/20'
                            }`}
                          >{n}</motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Observations de la seance</label>
                    <textarea
                      className="w-full bg-surface-low rounded-xl p-4 text-sm outline-none resize-none h-28 focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
                      placeholder="Decrivez le deroulement de la seance, les progres observes, les points d'attention..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">Recommandations pour la famille</label>
                    <textarea
                      className="w-full bg-surface-low rounded-xl p-4 text-sm outline-none resize-none h-24 focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 transition-all"
                      placeholder="Exercices a pratiquer a la maison, conseils pour les parents..."
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
                    <Button size="sm" iconRight="send">Envoyer l&apos;observation</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Session Cards */}
        <div className="space-y-4 mb-8">
          {sessions.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <Card padding="lg">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-on-surface">{s.date}</p>
                        <Badge variant="primary" size="sm">{s.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className={`w-3 h-3 rounded-full ${n <= s.progress ? 'gradient-primary' : 'bg-surface-high'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-outline font-medium">{s.progress}/5</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">Par {s.practitioner}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{s.note}</p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Shared Documents */}
        <ScrollReveal>
          <Card padding="lg" className="mb-8">
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">folder_shared</span>
              Documents partages
            </h3>
            <div className="space-y-3">
              {sharedDocuments.map((doc, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 bg-surface-low rounded-xl cursor-pointer hover:bg-surface-high transition-colors"
                >
                  <div className="w-10 h-10 bg-error-container rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[22px]">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-on-surface block truncate">{doc.name}</span>
                    <span className="text-xs text-outline">{doc.size}</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[20px]">download</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </ScrollReveal>

        {/* HDS Certification Footer */}
        <div className="py-10 border-t border-outline-variant/15">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-on-surface">Hebergement certifie HDS</p>
                <p className="text-xs text-on-surface-variant">Donnees de sante protegees — Conformite RGPD</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Chiffrement AES-256
              </span>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">gpp_good</span>
                ISO 27001
              </span>
              <span className="w-1 h-1 bg-outline rounded-full" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">health_and_safety</span>
                HDS
              </span>
            </div>
            <p className="text-[10px] text-outline mt-2">
              Politique de confidentialite &middot; Conditions d&apos;utilisation &middot; Mentions legales
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
