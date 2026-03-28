'use client'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'

const stats = [
  { icon: 'event_repeat', label: 'Seances totales', value: '48', color: 'text-primary' },
  { icon: 'timer', label: 'Frequence', value: '1x/sem', color: 'text-secondary' },
  { icon: 'history', label: 'Derniere seance', value: '15 Mar', color: 'text-tertiary' },
  { icon: 'event_upcoming', label: 'Prochaine', value: '22 Mar', color: 'text-gold' },
]

const evolutionData = [
  { month: 'Jan', value: 2, label: '2/5' },
  { month: 'Fev', value: 3, label: '3/5' },
  { month: 'Mar', value: 2.5, label: '2.5/5' },
  { month: 'Avr', value: 3.5, label: '3.5/5' },
  { month: 'Mai', value: 4, label: '4/5' },
  { month: 'Jun', value: 3.5, label: '3.5/5' },
  { month: 'Jul', value: 4.5, label: '4.5/5' },
]

const notes = [
  {
    date: '15 mars 2026',
    type: 'Note praticien',
    emoji: '😊',
    progress: 4,
    content: "Excellente seance aujourd\'hui. Lucas montre des progres significatifs sur les phonemes [s] et [z]. La discrimination auditive s\'ameliore nettement.",
    objectives: 'Phonemes [s] et [z], discrimination auditive',
    recommendation: "Lire l\'histoire \"Le Serpent Siffleur\" deux fois par semaine. Pratiquer 10 min de jeux de sons le soir.",
  },
  {
    date: '08 mars 2026',
    type: 'Note parent',
    emoji: '😐',
    progress: 2,
    content: "Semaine difficile a la maison. Lucas a du mal avec les exercices de prononciation. Il se decourage vite et refuse parfois de pratiquer.",
    objectives: '',
    recommendation: '',
  },
  {
    date: '01 mars 2026',
    type: 'Note praticien',
    emoji: '😄',
    progress: 3,
    content: "Bonne seance de travail. Lucas a montre beaucoup d\'enthousiasme pour les nouveaux exercices de lecture. La fluence s\'ameliore.",
    objectives: 'Fluence de lecture, comprehension orale',
    recommendation: 'Continuer les lectures quotidiennes de 15 minutes. Privilegier des textes avec dialogues.',
  },
]

const documents = [
  { name: 'Bilan_Orthophonique_Jan26.pdf', size: '1.8 MB', date: '20 Jan 2026' },
  { name: 'Fiche_Exercices_Phonemes.pdf', size: '0.5 MB', date: '15 Fev 2026' },
  { name: 'Compte_Rendu_Orthophonie_Mar26.pdf', size: '1.1 MB', date: '10 Mar 2026' },
]

export default function PraticienDetailPage() {
  return (
    <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: 'Praticiens', href: '/dashboard/enfant' }, { label: 'Sophie Martin', href: '#' }]}>

      {/* Practitioner Hero */}
      <ScrollReveal>
        <Card padding="lg" className="mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-secondary/8 to-transparent rounded-bl-full" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-secondary-container rounded-2xl flex items-center justify-center text-3xl font-bold text-secondary shadow-lg shadow-secondary/10">
                SM
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary rounded-full border-3 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">check</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-extrabold text-on-surface">Sophie Martin</h1>
              </div>
              <Badge variant="secondary" size="md" icon="record_voice_over">Orthophoniste</Badge>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-on-surface-variant">
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">call</span>
                  01 45 67 89 10
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">mail</span>
                  sophie.martin@lefil.fr
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                  12 Rue de la Paix, 75002
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end shrink-0">
              <Badge variant="primary" icon="event_repeat">Suivi Hebdomadaire</Badge>
              <div className="flex gap-2 mt-3">
                <Button size="sm" icon="link">Generer un lien</Button>
                <Button variant="outline" size="sm" icon="edit">Modifier</Button>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <ScrollReveal key={i} delay={i * 0.06}>
            <Card className="text-center" padding="md">
              <span className={`material-symbols-outlined ${s.color} text-[22px] mb-1 block`}>{s.icon}</span>
              <p className="font-[family-name:var(--font-heading)] font-bold text-xl text-on-surface">{s.value}</p>
              <p className="text-[10px] text-outline uppercase tracking-wider mt-0.5">{s.label}</p>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Evolution Chart */}
      <ScrollReveal>
        <Card padding="lg" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg">Evolution</h3>
              <p className="text-sm text-on-surface-variant">Progression des seances sur 7 mois</p>
            </div>
            <Badge variant="secondary" icon="trending_up">+125%</Badge>
          </div>
          <div className="h-48 flex items-end gap-3 px-2">
            {evolutionData.map((d, i) => (
              <div key={i} className="flex-1 relative group">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(d.value / 5) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="gradient-primary rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                    {d.label}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[11px] text-outline font-medium">
            {evolutionData.map(d => <span key={d.month}>{d.month}</span>)}
          </div>
        </Card>
      </ScrollReveal>

      {/* Session Notes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">clinical_notes</span>
            Notes de seances
          </h3>
          <select className="text-sm bg-surface-low rounded-xl px-4 py-2.5 outline-none cursor-pointer border border-outline-variant/20">
            <option>6 derniers mois</option>
            <option>3 derniers mois</option>
            <option>Toutes</option>
          </select>
        </div>
        <div className="space-y-4">
          {notes.map((note, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{note.emoji}</span>
                    <div>
                      <p className="font-semibold text-on-surface">{note.date}</p>
                      <Badge variant={note.type === 'Note praticien' ? 'primary' : 'tertiary'} size="sm">{note.type}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-outline">Progression</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className={`w-3 h-3 rounded-full transition-colors ${n <= note.progress ? 'gradient-primary' : 'bg-surface-high'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{note.content}</p>
                {note.objectives && (
                  <div className="bg-primary-fixed/20 rounded-xl p-4 mb-3">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Objectifs travailles</p>
                    <p className="text-sm text-primary">{note.objectives}</p>
                  </div>
                )}
                {note.recommendation && (
                  <div className="bg-secondary-container/30 rounded-xl p-4">
                    <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Recommandations</p>
                    <p className="text-sm text-secondary">{note.recommendation}</p>
                  </div>
                )}
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Documents */}
      <ScrollReveal>
        <Card padding="lg">
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">folder_open</span>
            Documents partages
          </h3>
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-4 bg-surface-low rounded-xl cursor-pointer hover:bg-surface-high transition-colors"
              >
                <div className="w-10 h-10 bg-error-container rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-[22px]">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{doc.name}</p>
                  <p className="text-xs text-outline">{doc.date} — {doc.size}</p>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">download</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </ScrollReveal>
    </DashboardLayout>
  )
}
