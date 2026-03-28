'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useChildren, usePractitioners, useDocuments, useSessions } from '@/hooks/useData'

const tabs = ['General', 'Praticiens', 'Documents', 'Journal', 'Courbes', 'Timeline']

// Demo fallback data
const demoPraticiens = [
  { initials: 'SM', name: 'Sophie Martin', specialty: 'Orthophoniste', freq: '2x/semaine', color: 'bg-primary-fixed', online: true },
  { initials: 'MM', name: 'Dr. Marc Morel', specialty: 'Pedopsychiatre', freq: 'Hebdomadaire', color: 'bg-tertiary-fixed', online: false },
  { initials: 'JL', name: 'Jean-Luc Petit', specialty: 'Psychomotricien', freq: 'Hebdomadaire', color: 'bg-secondary-fixed-dim', online: true },
  { initials: 'CH', name: 'Claire Henon', specialty: 'Ergotherapeute', freq: 'Hebdomadaire', color: 'bg-primary-fixed-dim', online: false },
  { initials: 'AD', name: 'Antoine Durand', specialty: 'Neuropsychologue', freq: 'Mensuel', color: 'bg-tertiary-fixed-dim', online: false },
]

const demoDocuments = [
  { name: 'Bilan_Neuropsychologique_Jan26.pdf', date: '15 Jan 2026', size: '2.4 MB', type: 'Bilan' },
  { name: 'Compte_Rendu_Orthophonie_Mar26.pdf', date: '10 Mar 2026', size: '1.1 MB', type: 'Compte-rendu' },
  { name: 'PAP_Ecole_Jean_Moulin_2025.pdf', date: '01 Sep 2025', size: '0.8 MB', type: 'Scolaire' },
  { name: 'Ordonnance_Methylphenidate.pdf', date: '05 Mar 2026', size: '0.3 MB', type: 'Ordonnance' },
  { name: 'Bilan_Psychomotricite_Dec25.pdf', date: '20 Dec 2025', size: '1.5 MB', type: 'Bilan' },
  { name: 'Courrier_MDPH_Renouvellement.pdf', date: '12 Jan 2026', size: '0.6 MB', type: 'MDPH' },
]

const demoJournalEntries = [
  { date: '26 Mar 2026', mood: '😊', sleep: 4, energy: 3, note: 'Bonne journee, Lucas etait concentre a l\'ecole. Il a joue avec ses camarades a la recreation.' },
  { date: '25 Mar 2026', mood: '😐', sleep: 3, energy: 2, note: 'Journee mitigee. Quelques difficultes de concentration en classe mais une bonne seance d\'orthophonie.' },
  { date: '24 Mar 2026', mood: '😄', sleep: 5, energy: 4, note: 'Excellente journee ! Lucas a recu des felicitations de sa maitresse pour son travail en lecture.' },
  { date: '23 Mar 2026', mood: '😢', sleep: 2, energy: 2, note: 'Nuit agitee, Lucas etait fatigue et irritable. Crise au moment des devoirs.' },
]

const demoProgressData = [
  { month: 'Oct', ortho: 2, psycho: 2.5, ergo: 1.5 },
  { month: 'Nov', ortho: 2.5, psycho: 3, ergo: 2 },
  { month: 'Dec', ortho: 3, psycho: 2.5, ergo: 2.5 },
  { month: 'Jan', ortho: 3, psycho: 3.5, ergo: 3 },
  { month: 'Fev', ortho: 3.5, psycho: 3.5, ergo: 3 },
  { month: 'Mar', ortho: 4, psycho: 4, ergo: 3.5 },
]

const demoTimelineItems = [
  { type: 'seance', icon: 'medical_services', color: 'bg-primary', title: 'Orthophonie : Phonemes complexes', date: '25 Mar 2026 — 14h30', practitioner: 'Sophie Martin, Orthophoniste', note: 'Progres notables sur les phonemes [s] et [z]. Lucas montre une meilleure concentration.' },
  { type: 'journal', icon: 'menu_book', color: 'bg-tertiary', title: 'Journal : Bonne journee scolaire', date: '24 Mar 2026', note: 'Felicitations de la maitresse en lecture. Lucas etait fier de lui.' },
  { type: 'document', icon: 'description', color: 'bg-secondary', title: 'Compte-rendu Orthophonie', date: '23 Mar 2026', file: 'Compte_Rendu_Orthophonie_Mar26.pdf' },
  { type: 'seance', icon: 'medical_services', color: 'bg-primary-dark', title: 'Psychomotricite : Coordination', date: '23 Mar 2026 — 10h00', practitioner: 'Jean-Luc Petit, Psychomotricien', note: 'Seance correcte, quelques difficultes de coordination fine.' },
  { type: 'rdv', icon: 'event', color: 'bg-gold', title: 'RDV Pedopsychiatre', date: '29 Mar 2026 — 10h00', note: 'Consultation de suivi avec Dr. Marc Morel. Rappel programme.' },
  { type: 'document', icon: 'description', color: 'bg-secondary', title: 'Ordonnance Methylphenidate', date: '05 Mar 2026', file: 'Ordonnance_Methylphenidate.pdf' },
]

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??'
}

const practColors = ['bg-primary-fixed', 'bg-tertiary-fixed', 'bg-secondary-fixed-dim', 'bg-primary-fixed-dim', 'bg-tertiary-fixed-dim']
const moodEmojis: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '😊', 5: '😄' }

export default function EnfantPage() {
  const [activeTab, setActiveTab] = useState('General')
  const { loading: authLoading } = useAuth()
  const { children, loading: childrenLoading } = useChildren()
  const firstChild = children[0]
  const { practitioners, loading: practLoading } = usePractitioners(firstChild?.id)
  const { documents: realDocuments, loading: docsLoading } = useDocuments(firstChild?.id)
  const { sessions, loading: sessionsLoading } = useSessions(firstChild?.id)

  const isLoading = authLoading || childrenLoading

  // Child display data
  const childName = firstChild ? `${firstChild.first_name} ${firstChild.last_name}` : 'Lucas Dupont'
  const childInitials = firstChild ? getInitials(firstChild.first_name, firstChild.last_name) : 'LD'
  const childAge = firstChild?.birth_date ? calculateAge(firstChild.birth_date) : 7
  const childBirthFormatted = firstChild?.birth_date
    ? new Date(firstChild.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '15 mars 2019'
  const childDiagnoses = firstChild?.diagnosis_primary
    ? [firstChild.diagnosis_primary, ...(firstChild.diagnosis_secondary || [])]
    : ['TDAH', 'Dyslexie']
  const childAllergies = firstChild?.allergies?.length ? firstChild.allergies : ['Arachides', 'Penicilline']
  const childTreatments = firstChild?.current_treatments?.length ? firstChild.current_treatments : null

  // Practitioners display
  const hasPractitioners = practitioners.length > 0
  const praticiensList = hasPractitioners
    ? practitioners.map((p, i) => ({
        initials: getInitials(p.first_name, p.last_name),
        name: `${p.first_name} ${p.last_name}`,
        specialty: p.specialty,
        freq: p.follow_up_frequency || '',
        color: practColors[i % practColors.length],
        online: p.status === 'actif',
      }))
    : demoPraticiens

  // Documents display
  const hasDocuments = realDocuments.length > 0
  const documentsList = hasDocuments
    ? realDocuments.map(d => ({
        name: d.file_name,
        date: new Date(d.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        size: '',
        type: d.category,
      }))
    : demoDocuments

  // Sessions for journal tab
  const hasSessions = sessions.length > 0
  const journalEntries = hasSessions
    ? sessions.slice(0, 4).map(s => ({
        date: new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        mood: moodEmojis[s.child_mood || 3] || '😐',
        sleep: 3,
        energy: 3,
        note: s.observations || s.progress || s.objectives || 'Aucune note.',
      }))
    : demoJournalEntries

  // Timeline from sessions + documents
  const hasTimeline = hasSessions || hasDocuments
  const timelineItems = hasTimeline
    ? [
        ...sessions.slice(0, 4).map(s => ({
          type: 'seance' as const,
          icon: 'medical_services',
          color: 'bg-primary',
          title: s.objectives || 'Seance',
          date: new Date(s.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          practitioner: '',
          note: s.observations || s.progress || '',
          file: undefined as string | undefined,
        })),
        ...realDocuments.slice(0, 2).map(d => ({
          type: 'document' as const,
          icon: 'description',
          color: 'bg-secondary',
          title: d.description || d.file_name,
          date: new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          practitioner: undefined as string | undefined,
          note: undefined as string | undefined,
          file: d.file_name,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : demoTimelineItems

  // Keep original progress data as demo (no real data source for this)
  const progressData = demoProgressData

  if (isLoading) {
    return (
      <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: 'Chargement...', href: '#' }]}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant text-sm">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumb={[{ label: 'Tableau de bord', href: '/dashboard/profil' }, { label: childName, href: '#' }]}>
      {/* Hero Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="relative w-28 h-28 mx-auto mb-5">
          <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/15">
            {childInitials}
          </div>
          <motion.button whileHover={{ scale: 1.1 }} className="absolute -bottom-1 -right-1 w-9 h-9 gradient-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer">
            <span className="material-symbols-outlined text-white text-[16px]">edit</span>
          </motion.button>
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-on-surface mb-3">{childName}</h1>
        <div className="flex justify-center gap-2 mb-3">
          {childDiagnoses.map((d, i) => (
            <Badge key={i} variant={i === 0 ? 'primary' : 'secondary'}>{d}</Badge>
          ))}
        </div>
        <p className="text-on-surface-variant">{childAge} ans — Ne le {childBirthFormatted}</p>
        <div className="flex justify-center gap-3 mt-5">
          <Button variant="outline" size="sm" icon="edit">Modifier</Button>
          <Button variant="outline" size="sm" icon="share">Partager</Button>
        </div>
      </motion.div>

      {/* Quick Info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: 'school', label: 'Scolarite', value: 'CE1 — Jean Moulin' },
          { icon: 'stethoscope', label: 'Suivi Medical', value: firstChild?.family_doctor_name || 'Dr Bernard' },
          { icon: 'folder_shared', label: 'Dossier MDPH', value: 'En cours', dot: 'bg-gold' },
        ].map((info, i) => (
          <ScrollReveal key={i} delay={i * 0.08}>
            <Card padding="sm" className="text-center">
              <span className="material-symbols-outlined text-primary text-[20px] mb-1 block">{info.icon}</span>
              <p className="text-[10px] text-outline uppercase tracking-wider mb-1">{info.label}</p>
              <p className="text-sm font-semibold text-on-surface flex items-center justify-center gap-1.5">
                {info.dot && <span className={`w-2 h-2 rounded-full ${info.dot}`} />}
                {info.value}
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-2 bg-surface/80 backdrop-blur-xl mb-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab
                  ? 'gradient-primary text-white shadow-lg shadow-primary/15'
                  : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* === GENERAL TAB === */}
          {activeTab === 'General' && (
            <div className="grid sm:grid-cols-2 gap-5">
              <ScrollReveal>
                <Card padding="lg">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">medical_information</span>
                    Informations medicales
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-outline uppercase tracking-wider mb-1">Diagnostic</p>
                      <p className="text-on-surface font-medium">{firstChild?.diagnosis_primary || 'TDAH (Mixte)'}</p>
                      {(firstChild?.diagnosis_secondary?.length ? firstChild.diagnosis_secondary : ['Troubles des fonctions executives']).map((d, i) => (
                        <p key={i} className="text-on-surface-variant text-sm">{d}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-outline uppercase tracking-wider mb-2">Allergies</p>
                      <div className="flex gap-2 flex-wrap">
                        {childAllergies.map((a, i) => (
                          <Badge key={i} variant="error" icon="warning">{a}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-outline uppercase tracking-wider mb-1">Traitements</p>
                      <div className="space-y-2">
                        {childTreatments ? childTreatments.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 bg-primary-fixed/20 rounded-xl">
                            <span className="material-symbols-outlined text-primary text-[18px]">medication</span>
                            <div>
                              <p className="text-sm font-medium text-on-surface">{t}</p>
                            </div>
                          </div>
                        )) : (
                          <>
                            <div className="flex items-center gap-2 p-2.5 bg-primary-fixed/20 rounded-xl">
                              <span className="material-symbols-outlined text-primary text-[18px]">medication</span>
                              <div>
                                <p className="text-sm font-medium text-on-surface">Methylphenidate</p>
                                <p className="text-xs text-on-surface-variant">10mg/jour — matin</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 bg-secondary-container/30 rounded-xl">
                              <span className="material-symbols-outlined text-secondary text-[18px]">nutrition</span>
                              <div>
                                <p className="text-sm font-medium text-on-surface">Omega-3</p>
                                <p className="text-xs text-on-surface-variant">Complement alimentaire</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <Card padding="lg">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">school</span>
                    Scolarite
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-outline uppercase tracking-wider mb-1">Etablissement</p>
                      <p className="text-on-surface font-medium">Ecole Jean Moulin — Public</p>
                      <p className="text-on-surface-variant text-sm">4 rue des Lilas, Lyon — CE1</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-outline-variant/15">
                      <p className="text-xs text-outline uppercase tracking-wider mb-1">Accompagnement AESH</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center text-sm font-bold text-secondary">ML</div>
                        <div>
                          <p className="text-on-surface font-medium">Mme Leroy</p>
                          <p className="text-on-surface-variant text-sm">Mi-temps — 12h/semaine</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <Card padding="lg">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-[22px]">emergency</span>
                    Contacts d&apos;urgence
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: firstChild?.family_doctor_name || 'Dr Bernard', role: 'Medecin traitant', phone: firstChild?.family_doctor_phone || '04 78 54 21 00' },
                      { name: 'Sophie Dupont', role: 'Mere', phone: '06 12 34 56 78' },
                      { name: 'Thomas Dupont', role: 'Pere', phone: '06 98 76 54 32' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-on-surface font-medium">{c.name}</p>
                          <p className="text-on-surface-variant text-xs">{c.role} — {c.phone}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center cursor-pointer">
                          <span className="material-symbols-outlined text-secondary text-[20px]">call</span>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <Card padding="lg">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold text-[22px]">verified</span>
                    MDPH &amp; Aides
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-on-surface font-medium">Renouvellement AEEH</span>
                      <Badge variant="gold">En cours</Badge>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i <= 2 ? 'bg-gold' : 'bg-surface-high'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-on-surface-variant">Dernier depot : 12 Janvier 2026</p>
                    <p className="text-sm text-on-surface-variant">Echeance estimee : Mai 2026</p>
                    <Link href="#" className="text-sm text-primary font-medium mt-2 inline-block hover:underline">
                      Voir le dossier complet &rarr;
                    </Link>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          )}

          {/* === PRATICIENS TAB === */}
          {activeTab === 'Praticiens' && (
            <div className="space-y-4">
              {practLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant">Chargement des praticiens...</p>
                </div>
              ) : (
                <>
                  {praticiensList.map((p, i) => (
                    <ScrollReveal key={i} delay={i * 0.08}>
                      <Card className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center font-bold text-on-surface text-lg`}>
                            {p.initials}
                          </div>
                          {p.online && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-secondary rounded-full border-2 border-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-on-surface">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" size="sm">{p.specialty}</Badge>
                            {p.freq && <span className="text-xs text-outline">{p.freq}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link href="/dashboard/praticien">
                            <Button variant="outline" size="sm">Voir les seances</Button>
                          </Link>
                          <motion.button whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center cursor-pointer">
                            <span className="material-symbols-outlined text-outline text-[20px]">share</span>
                          </motion.button>
                        </div>
                      </Card>
                    </ScrollReveal>
                  ))}
                  <div className="mt-6">
                    <Button fullWidth icon="add" variant="primary">Ajouter un praticien</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === DOCUMENTS TAB === */}
          {activeTab === 'Documents' && (
            <div>
              {/* Filter pills */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['Tous', 'Bilans', 'Comptes-rendus', 'Scolaire', 'Ordonnances', 'MDPH'].map((f, i) => (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      i === 0 ? 'gradient-primary text-white shadow-md' : 'bg-surface-card text-on-surface-variant hover:bg-surface-low border border-outline-variant/20'
                    }`}
                  >{f}</motion.button>
                ))}
              </div>

              {docsLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant">Chargement des documents...</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {documentsList.map((doc, i) => (
                    <ScrollReveal key={i} delay={i * 0.06}>
                      <Card padding="md" className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-error-container rounded-xl flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-error text-[24px]">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" size="sm">{doc.type}</Badge>
                            <span className="text-xs text-outline">{doc.date}</span>
                          </div>
                          {doc.size && <p className="text-xs text-outline mt-1">{doc.size}</p>}
                        </div>
                        <motion.button whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center cursor-pointer shrink-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">download</span>
                        </motion.button>
                      </Card>
                    </ScrollReveal>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <Button fullWidth icon="upload_file" variant="ghost">Ajouter un document</Button>
              </div>
            </div>
          )}

          {/* === JOURNAL TAB === */}
          {activeTab === 'Journal' && (
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-on-surface-variant">Chargement du journal...</p>
                </div>
              ) : (
                <>
                  {journalEntries.map((entry, i) => (
                    <ScrollReveal key={i} delay={i * 0.08}>
                      <Card padding="lg">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl shrink-0">{entry.mood}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-on-surface text-sm">{entry.date}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-outline">Sommeil</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <div key={n} className={`w-2 h-2 rounded-full ${n <= entry.sleep ? 'bg-primary' : 'bg-surface-high'}`} />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-outline">Energie</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <div key={n} className={`w-2 h-2 rounded-full ${n <= entry.energy ? 'bg-secondary' : 'bg-surface-high'}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-on-surface-variant leading-relaxed">{entry.note}</p>
                          </div>
                        </div>
                      </Card>
                    </ScrollReveal>
                  ))}
                  <div className="mt-4">
                    <Link href="/dashboard/journal">
                      <Button fullWidth variant="ghost" iconRight="arrow_forward">Voir tout le journal</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === COURBES TAB === */}
          {activeTab === 'Courbes' && (
            <div>
              <ScrollReveal>
                <Card padding="lg" className="mb-6">
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-2">Evolution globale</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Progression moyenne par specialite sur 6 mois</p>

                  {/* Legend */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-xs text-on-surface-variant">Orthophonie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <span className="text-xs text-on-surface-variant">Psychomotricite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-tertiary" />
                      <span className="text-xs text-on-surface-variant">Ergotherapie</span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-52 flex items-end gap-2 px-2">
                    {progressData.map((d, i) => (
                      <div key={i} className="flex-1 flex items-end gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${(d.ortho / 5) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="flex-1 bg-primary rounded-t-md"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${(d.psycho / 5) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.08 + 0.05 }}
                          className="flex-1 bg-secondary rounded-t-md"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${(d.ergo / 5) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                          className="flex-1 bg-tertiary rounded-t-md"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] text-outline px-2">
                    {progressData.map(d => <span key={d.month}>{d.month}</span>)}
                  </div>
                </Card>
              </ScrollReveal>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Orthophonie', value: '+100%', icon: 'trending_up', color: 'text-primary', bg: 'bg-primary-fixed' },
                  { label: 'Psychomotricite', value: '+60%', icon: 'trending_up', color: 'text-secondary', bg: 'bg-secondary-container' },
                  { label: 'Ergotherapie', value: '+133%', icon: 'trending_up', color: 'text-tertiary', bg: 'bg-tertiary-fixed' },
                ].map((s, i) => (
                  <ScrollReveal key={i} delay={i * 0.08}>
                    <Card padding="md" className="text-center">
                      <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                        <span className={`material-symbols-outlined ${s.color} text-[20px]`}>{s.icon}</span>
                      </div>
                      <p className={`font-[family-name:var(--font-heading)] font-bold text-lg ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-on-surface-variant">{s.label}</p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* === TIMELINE TAB === */}
          {activeTab === 'Timeline' && (
            <div>
              {/* Filter */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {['Tous', 'Seances', 'Documents', 'Journal', 'RDV'].map((f, i) => (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      i === 0 ? 'gradient-primary text-white shadow-md' : 'bg-surface-card text-on-surface-variant hover:bg-surface-low border border-outline-variant/20'
                    }`}
                  >{f}</motion.button>
                ))}
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-secondary/20 to-gold/20" />
                <div className="space-y-8">
                  {timelineItems.map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.1}>
                      <div className="flex gap-5">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`shrink-0 w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center shadow-lg relative z-10`}
                        >
                          <span className="material-symbols-outlined text-white text-[24px]">{item.icon}</span>
                        </motion.div>
                        <Card className="flex-1" padding="lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-[family-name:var(--font-heading)] font-bold text-on-surface">{item.title}</h4>
                          </div>
                          <p className="text-xs text-outline mb-3">{item.date}</p>
                          {item.practitioner && <p className="text-sm text-primary font-medium mb-2">{item.practitioner}</p>}
                          {item.note && <p className="text-sm text-on-surface-variant leading-relaxed">{item.note}</p>}
                          {item.file && (
                            <div className="flex items-center gap-2 mt-3 p-3 bg-surface-low rounded-xl">
                              <span className="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span>
                              <span className="text-sm text-on-surface font-medium">{item.file}</span>
                            </div>
                          )}
                        </Card>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-6 w-14 h-14 gradient-primary rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center cursor-pointer z-40"
      >
        <span className="material-symbols-outlined text-white text-[28px]">add</span>
      </motion.button>
    </DashboardLayout>
  )
}
