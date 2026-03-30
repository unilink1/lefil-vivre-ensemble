'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import InstallPrompt from '@/components/ui/InstallPrompt'
import { getSettings } from '@/lib/adminStore'

const steps = [
  { num: '1', color: 'bg-primary', title: 'Premier contact', desc: 'Un échange gratuit de 30 minutes pour comprendre votre situation et vos besoins.' },
  { num: '2', color: 'bg-secondary', title: 'Audit personnalisé', desc: 'Analyse complète de votre parcours, des démarches en cours et des priorités.' },
  { num: '3', color: 'bg-tertiary', title: "Plan d'action", desc: 'Un programme sur mesure avec objectifs clairs, étapes et accompagnement continu.' },
  { num: '4', color: 'bg-gold', textDark: true, title: 'Suivi et progrès', desc: 'Coaching régulier, coordination avec les praticiens et ajustements en continu.' },
]

const services = [
  { emoji: '🧩', title: 'Coaching familial', desc: "Accompagnement personnalisé pour les parents d'enfants atypiques. Stratégies concrètes pour le quotidien, gestion des crises, routines adaptées.", tags: ['TSA', 'TDAH', 'DYS', 'Gestion de crises', 'Routines'], border: 'hover:border-primary/40', topColor: '#4A90D9' },
  { emoji: '🤰', title: 'Coaching maternité', desc: 'Pour les mamans qui accueillent un enfant avec un diagnostic. Soutien émotionnel, préparation pratique et accompagnement dans les démarches.', tags: ['Post-diagnostic', 'Soutien émotionnel', 'Démarches'], border: 'hover:border-secondary/40', topColor: '#7EC8B0' },
  { emoji: '🏫', title: 'Coordination scolaire', desc: "Faciliter le lien entre l'école et les professionnels de santé. PAP, PPS, AESH, aménagements aux examens, relations avec l'équipe éducative.", tags: ['PAP / PPS', 'AESH', 'ULIS', 'Examens'], border: 'hover:border-tertiary/40', topColor: '#E8A87C' },
  { emoji: '📋', title: 'Coordination professionnelle', desc: "Centralisation du suivi entre tous les praticiens de votre enfant. Synthèse d'équipe, partage d'informations, cohérence des interventions.", tags: ['Orthophoniste', 'Psychomotricien', 'Ergothérapeute', 'MDPH'], border: 'hover:border-gold/40', topColor: '#F5C842' },
]

const audiences = [
  { emoji: '👨‍👩‍👦', title: 'Parents', desc: 'Vous cherchez des solutions concrètes pour le quotidien, les démarches MDPH, la scolarité ou simplement un soutien bienveillant sans jugement.' },
  { emoji: '🩺', title: 'Praticiens', desc: "Vous souhaitez mieux coordonner le suivi avec les autres professionnels et avoir une vision globale de l'enfant que vous accompagnez." },
  { emoji: '🏥', title: 'Structures', desc: 'CAMSP, CMP, PCO, SESSAD : améliorez la coordination de vos équipes et le lien avec les familles grâce à nos outils.' },
]

const plans = [
  { name: 'Essentiel', desc: 'Pour démarrer et structurer votre parcours', price: '77', features: ['1 profil enfant', 'Coaching mensuel (1 session)', 'Accès à la plateforme de suivi', 'Support par email', 'Ressources et guides pratiques'] },
  { name: 'Sérénité', desc: 'Pour un accompagnement complet et régulier', price: '99', popular: true, features: ['2 profils enfants', 'Coaching bimensuel (2 sessions)', 'Coordination praticiens', 'Messagerie interne', 'Agenda partagé', 'Support prioritaire'] },
  { name: 'Accompagnement Plus', desc: 'Pour un soutien intensif et sur mesure', price: '165', features: ['Profils illimités', 'Coaching hebdomadaire', "Synthèse d'équipe pluridisciplinaire", 'Templates MDPH automatiques', 'QR code urgence', 'Support 7j/7'] },
]

const testimonials = [
  { text: "Le Fil a complètement changé notre quotidien. Enfin quelqu'un qui comprend ce qu'on vit et qui propose des solutions concrètes, pas juste de la théorie.", name: 'Sophie M.', role: 'Maman de Théo, 6 ans, TSA', color: 'bg-primary', accent: '#4A90D9' },
  { text: "La coordination entre les praticiens de mon fils était un cauchemar. Maintenant tout est centralisé, chacun sait ce que l'autre fait. Un vrai soulagement.", name: 'Marie L.', role: 'Maman de Lucas, 8 ans, TDAH', color: 'bg-secondary', accent: '#7EC8B0' },
  { text: "En tant qu'orthophoniste, avoir accès au suivi global de l'enfant change tout. Je vois ce que font les autres praticiens et j'adapte ma prise en charge.", name: 'Claire D.', role: 'Orthophoniste libérale', color: 'bg-tertiary', accent: '#E8A87C' },
]

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const [formSubject, setFormSubject] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [formNom, setFormNom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState('')
  const [gptLink, setGptLink] = useState('https://chatgpt.com')

  useEffect(() => { setGptLink(getSettings().gptAssistantLink) }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)
    setContactSuccess(false)
    setContactError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: formPrenom,
          nom: formNom,
          email: formEmail,
          telephone: formTelephone,
          sujet: formSubject,
          message: formMessage,
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'envoi')
      setContactSuccess(true)
      setFormPrenom('')
      setFormNom('')
      setFormEmail('')
      setFormTelephone('')
      setFormSubject('')
      setFormMessage('')
    } catch {
      setContactError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface overflow-hidden">
      <Navbar />

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-dvh flex items-center pt-[120px] sm:pt-[180px] pb-20 sm:pb-44 px-4 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F3] via-[#E8F0FA] via-40% to-[#E4F5EE] z-0" />
        <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
        <FloatingOrbs variant="hero" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-[1200px] mx-auto w-full grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/[0.08] border border-primary/15 rounded-full text-sm font-medium text-primary mb-8"
            >
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Accompagnement bienveillant
            </motion.div>

            <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-[1.15] mb-10">
              Votre enfant est{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">unique</span>.
              <br />Son accompagnement aussi.
            </h1>

            <p className="text-lg text-on-surface-variant leading-[1.9] mb-14 max-w-[520px]">
              Le Fil accompagne les familles d&apos;enfants atypiques (TSA, TDAH, DYS, handicap) avec un coaching personnalisé, une coordination des soins et un soutien sans jugement.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 flex-wrap mb-12 sm:mb-20">
              <Link href="#contact" className="w-full sm:w-auto">
                <motion.span whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(74,144,217,0.35)' }} whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-lg font-semibold text-[0.95rem] shadow-[0_2px_12px_rgba(74,144,217,0.25)] cursor-pointer transition-all">
                  Vérifier mon éligibilité
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </motion.span>
              </Link>
              <Link href="#comment-ca-marche" className="w-full sm:w-auto">
                <motion.span whileHover={{ borderColor: 'rgb(74,144,217)', color: 'rgb(74,144,217)' }} whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-all">
                  Découvrir
                </motion.span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:flex gap-8 sm:gap-16 pt-8 sm:pt-12 border-t border-outline-variant/30">
              {[
                { num: '250+', label: 'Familles accompagnées' },
                { num: '98%', label: 'Satisfaction' },
                { num: '15+', label: 'Professionnels partenaires' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }}>
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-primary">{s.num}</div>
                  <div className="text-xs text-outline mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Cards Stack */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-[400px] h-[460px]">
              {/* Card 1 — Child profile */}
              <motion.div animate={{ y: [-0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-0 w-[300px] bg-surface-card rounded-xl p-6 shadow-lg border border-outline-variant/20">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center text-white text-xs font-bold">L</div>
                  <div>
                    <div className="font-semibold text-sm">Lucas, 7 ans</div>
                    <div className="text-[0.72rem] text-outline">Suivi pluridisciplinaire</div>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-2.5">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[0.7rem] font-semibold">TDAH</span>
                  <span className="px-2.5 py-0.5 bg-secondary/12 text-secondary rounded-full text-[0.7rem] font-semibold">Dyslexie</span>
                </div>
                <div className="text-[0.78rem] text-on-surface-variant mb-1.5">Progrès cette semaine</div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-outline-variant'}`} />)}
                </div>
              </motion.div>

              {/* Card 2 — Sessions chart */}
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-10 right-0 w-[260px] bg-surface-card rounded-xl p-6 shadow-lg border border-outline-variant/20">
                <div className="text-[0.78rem] text-outline mb-1">Séances ce mois</div>
                <div className="font-[family-name:var(--font-heading)] text-xl font-extrabold mb-2">12 séances</div>
                <div className="flex items-end gap-1 h-10">
                  {[60,40,80,55,90,70,100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.08 }}
                      className={`flex-1 rounded-t ${i % 2 === 0 ? 'bg-primary-light/60' : 'bg-secondary/70'}`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Card 3 — Next RDV */}
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="absolute top-1/2 -left-5 -translate-y-1/2 w-[180px] bg-surface-card rounded-xl p-4 shadow-lg border border-outline-variant/20">
                <div className="text-[0.72rem] text-outline mb-1">Prochain RDV</div>
                <div className="font-bold text-sm">Orthophoniste</div>
                <div className="text-[0.75rem] text-primary mt-0.5">Mar. 14h00</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <span className="material-symbols-outlined text-outline/40 text-[28px]">expand_more</span>
        </motion.div>
      </section>

      {/* ===== COMMENT CA MARCHE ===== */}
      <section id="comment-ca-marche" className="py-20 sm:py-52 px-4 sm:px-8 bg-surface-warm">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-5">
                <span className="w-6 h-0.5 bg-primary rounded" /> Simplicité
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-4">Comment ça marche</h2>
              <p className="text-on-surface-variant text-lg max-w-[600px] mx-auto">Un parcours simple et bienveillant, adapté à votre rythme</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-16 relative">
            <div className="hidden lg:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20" />
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center relative z-10">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 font-[family-name:var(--font-heading)] text-xl font-extrabold ${step.textDark ? 'text-on-surface' : 'text-white'} relative shadow-lg`}>
                    {step.num}
                    <div className="absolute -inset-1 rounded-full border-2 border-dashed border-current/20" />
                  </motion.div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-[1.7]">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ACCOMPAGNEMENTS ===== */}
      <section id="accompagnements" className="py-20 sm:py-52 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-5">
                <span className="w-6 h-0.5 bg-primary rounded" /> Nos services
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-4">Accompagnements sur mesure</h2>
              <p className="text-on-surface-variant text-lg max-w-[600px]">Chaque famille est unique. Nos accompagnements s&apos;adaptent à votre réalité quotidienne.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-14">
            {services.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 12px 48px rgba(45,55,72,0.16)' }}
                  className={`group bg-surface-card hover:bg-[#FCFCFF] border border-outline-variant/20 rounded-xl p-6 sm:p-12 transition-all duration-300 relative overflow-hidden cursor-default ${s.border}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: s.topColor }} />
                  <div className="text-3xl mb-5">{s.emoji}</div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-[1.7] mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map(t => (
                      <span key={t} className="px-3 py-1 bg-surface rounded-full text-xs text-on-surface-variant font-medium">{t}</span>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
          {/* Devis card */}
          <ScrollReveal delay={0.4}>
            <motion.div whileHover={{ y: -2 }}
              className="mt-6 bg-gradient-to-r from-primary/[0.04] to-secondary/[0.04] border-[1.5px] border-dashed border-primary-light rounded-xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              <div className="flex-1">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-2">Devis personnalisé</h3>
                <p className="text-sm text-on-surface-variant leading-[1.7] mb-4">
                  Votre situation est unique et ne rentre pas dans une formule standard ? Nous construisons ensemble un accompagnement 100% sur mesure.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Sur mesure', 'Multi-enfants', 'Structures / associations', 'Tarif adapté'].map(t => (
                    <span key={t} className="px-3 py-1 bg-surface rounded-full text-xs text-on-surface-variant font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <Link href="#contact" className="w-full sm:w-auto shrink-0">
                <motion.span whileHover={{ y: -2 }} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-lg font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] cursor-pointer">
                  Demander un devis gratuit
                </motion.span>
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== POUR QUI ===== */}
      <section className="py-20 sm:py-52 px-4 sm:px-8 bg-surface-warm">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-4">
                <span className="w-6 h-0.5 bg-primary rounded" /> Pour qui
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold">Un accompagnement pour chacun</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-14">
            {audiences.map((a, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4, boxShadow: '0 8px 40px rgba(45,55,72,0.12)' }}
                  className="bg-surface-card rounded-xl p-8 sm:p-14 text-center border border-outline-variant/20 transition-all">
                  <span className="text-[3rem] block mb-6">{a.emoji}</span>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-3">{a.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-[1.7]">{a.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ASSISTANT IA ===== */}
      <section className="py-20 sm:py-52 px-4 sm:px-8">
        <div className="max-w-[800px] mx-auto">
          <ScrollReveal>
            <div className="relative bg-gradient-to-br from-[#EEF4FB] via-surface-card to-[#E8F7F2] rounded-2xl p-8 sm:p-16 text-center overflow-hidden border border-outline-variant/15">
              {/* Subtle background orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px]" />

              <div className="relative z-10">
                {/* Robot illustration */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-28 h-28 mx-auto mb-10 relative"
                >
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                    {/* Antenna */}
                    <line x1="60" y1="8" x2="60" y2="24" stroke="url(#robotGrad)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="60" cy="6" r="4" fill="url(#robotGrad)" />
                    {/* Head */}
                    <rect x="28" y="24" width="64" height="48" rx="16" fill="white" stroke="url(#robotGrad)" strokeWidth="2.5" />
                    {/* Eyes */}
                    <circle cx="44" cy="46" r="6" fill="url(#robotGrad)" />
                    <circle cx="76" cy="46" r="6" fill="url(#robotGrad)" />
                    <circle cx="45.5" cy="44.5" r="2" fill="white" />
                    <circle cx="77.5" cy="44.5" r="2" fill="white" />
                    {/* Smile */}
                    <path d="M48 58 Q60 66 72 58" stroke="url(#robotGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    {/* Body */}
                    <rect x="36" y="76" width="48" height="28" rx="12" fill="white" stroke="url(#robotGrad)" strokeWidth="2.5" />
                    {/* Heart on body */}
                    <path d="M55 86 C55 84 58 82 60 84.5 C62 82 65 84 65 86 C65 89 60 93 60 93 C60 93 55 89 55 86Z" fill="url(#robotGrad)" opacity="0.7" />
                    {/* Arms */}
                    <line x1="28" y1="82" x2="16" y2="90" stroke="url(#robotGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="14" cy="92" r="4" fill="white" stroke="url(#robotGrad)" strokeWidth="2" />
                    <line x1="92" y1="82" x2="104" y2="90" stroke="url(#robotGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="106" cy="92" r="4" fill="white" stroke="url(#robotGrad)" strokeWidth="2" />
                    {/* Signal waves */}
                    <path d="M72 14 Q78 10 78 4" stroke="url(#robotGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                    <path d="M76 18 Q84 12 86 4" stroke="url(#robotGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25" />
                    <defs>
                      <linearGradient id="robotGrad" x1="0" y1="0" x2="120" y2="120">
                        <stop offset="0%" stopColor="#4A90D9" />
                        <stop offset="50%" stopColor="#7EC8B0" />
                        <stop offset="100%" stopColor="#4A90D9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-6">
                  <span className="w-6 h-0.5 bg-primary rounded" /> Assistant intelligent
                </div>

                <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,2.5vw,2.2rem)] font-extrabold mb-6">
                  Posez vos questions à notre assistant IA
                </h2>

                <p className="text-on-surface-variant text-lg leading-[1.85] mb-12 max-w-[520px] mx-auto">
                  Besoin d&apos;un conseil rapide sur les démarches MDPH, le choix d&apos;un praticien ou la gestion du quotidien ? Notre assistant bienveillant est disponible 24h/24 pour vous guider.
                </p>

                <Link href={gptLink} target="_blank" rel="noopener noreferrer">
                  <motion.span
                    whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(74,144,217,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-10 py-4.5 bg-primary text-white rounded-lg font-semibold text-[1rem] shadow-[0_4px_20px_rgba(74,144,217,0.25)] cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                    Discuter avec l&apos;assistant
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </motion.span>
                </Link>

                <p className="text-xs text-outline mt-8">Gratuit et sans inscription — Propulsé par IA conversationnelle</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== TARIFS ===== */}
      <section id="tarifs" className="py-20 sm:py-52 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-5">
                <span className="w-6 h-0.5 bg-primary rounded" /> Tarifs
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-4">Des formules adaptées à vos besoins</h2>
              <p className="text-on-surface-variant text-lg max-w-[600px] mx-auto">Chaque formule inclut un audit gratuit de votre situation</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-start">
            {plans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4, boxShadow: '0 12px 48px rgba(45,55,72,0.14)' }}
                  className={`relative rounded-xl p-8 sm:p-10 border transition-all ${
                    plan.popular ? 'border-primary border-2 shadow-[0_8px_40px_rgba(74,144,217,0.2)] md:scale-[1.04] bg-gradient-to-b from-[#F0F6FD] to-surface-card' : 'bg-surface-card border-outline-variant/40'
                  }`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[0.72rem] font-bold rounded-full uppercase tracking-wider">
                      Populaire
                    </span>
                  )}
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-sm text-outline mb-6 leading-relaxed">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-[family-name:var(--font-heading)] text-[2.4rem] font-extrabold">{plan.price}</span>
                    <span className="text-on-surface-variant font-semibold">CHF</span>
                  </div>
                  <p className="text-sm text-outline mb-6">par mois</p>
                  <ul className="space-y-0 mb-10">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 py-2 border-b border-outline-variant/20 last:border-0 text-sm text-on-surface-variant">
                        <span className="text-success font-bold text-base mt-px">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="#contact" className="block">
                    <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center w-full py-3 rounded-[10px] font-semibold text-sm cursor-pointer transition-all ${
                        plan.popular
                          ? 'bg-primary text-white shadow-[0_2px_12px_rgba(74,144,217,0.25)]'
                          : 'bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}>
                      Choisir {plan.name}
                    </motion.span>
                  </Link>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TÉMOIGNAGES ===== */}
      <section id="temoignages" className="py-20 sm:py-52 px-4 sm:px-8 bg-surface-warm">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-5">
                <span className="w-6 h-0.5 bg-primary rounded" /> Témoignages
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold">Ils nous font confiance</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-14">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ boxShadow: '0 4px 20px rgba(45,55,72,0.08)' }}
                  className="bg-surface-card rounded-xl p-6 sm:p-12 border border-outline-variant/20 transition-all relative overflow-hidden">
                  <div className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full" style={{ backgroundColor: t.accent }} />
                  <div className="text-gold text-sm tracking-widest mb-5">★★★★★</div>
                  <p className="text-[0.95rem] text-on-surface-variant leading-[1.85] italic mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-outline">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-48 px-4 sm:px-8 gradient-hero text-white text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />
        <ScrollReveal>
          <div className="max-w-[600px] mx-auto relative z-10">
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-6">
              Prêt à simplifier le quotidien<br />de votre famille ?
            </h2>
            <p className="text-white/85 text-lg mb-10 leading-[1.8]">
              Prenez 30 minutes pour un premier échange gratuit et sans engagement. Nous vous écoutons.
            </p>
            <Link href="#contact">
              <motion.span whileHover={{ y: -2, boxShadow: '0 8px 40px rgba(45,55,72,0.12)' }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold shadow-lg cursor-pointer">
                Réserver mon appel gratuit
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </motion.span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-20 sm:py-52 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <div className="mb-12 sm:mb-32">
              <div className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-primary mb-5">
                <span className="w-6 h-0.5 bg-primary rounded" /> Contact
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-4">Parlons de votre situation</h2>
              <p className="text-on-surface-variant text-lg">Nous répondons sous 24h avec des propositions concrètes.</p>
            </div>
          </ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-16">
            <ScrollReveal>
              <div className="space-y-0">
                {[
                  { emoji: '✉️', label: 'Email', value: 'contact@lefil-vivre-ensemble.com' },
                  { emoji: '📞', label: 'Téléphone', value: '+33 6 22 87 36 15' },
                  { emoji: '🕐', label: 'Disponibilité', value: 'Lun-Ven, 9h-18h' },
                  { emoji: '📍', label: 'Zones couvertes', value: 'France et Suisse romande' },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3.5 py-5">
                    <div className="w-11 h-11 bg-primary/[0.08] rounded-xl flex items-center justify-center text-lg shrink-0">{c.emoji}</div>
                    <div>
                      <div className="text-[0.78rem] text-outline uppercase tracking-wider mb-0.5">{c.label}</div>
                      <div className="font-semibold text-[0.95rem]">{c.value}</div>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-6 bg-primary/[0.04] rounded-lg border border-primary/10">
                  <div className="font-bold text-sm mb-1">Premier échange gratuit</div>
                  <div className="text-sm text-on-surface-variant leading-[1.7]">
                    30 minutes pour comprendre votre situation, identifier vos priorités et vous proposer un accompagnement adapté. Sans engagement.
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <form onSubmit={handleContactSubmit} className="bg-surface-card rounded-xl p-6 sm:p-12 shadow-md border border-outline-variant/20">
                {contactSuccess && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl text-sm text-success font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Message envoyé avec succès ! Nous vous répondrons sous 24h.
                  </div>
                )}
                {contactError && (
                  <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Prénom *</label>
                    <input type="text" placeholder="Votre prénom" value={formPrenom} onChange={e => setFormPrenom(e.target.value)} required className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Nom</label>
                    <input type="text" placeholder="Votre nom" value={formNom} onChange={e => setFormNom(e.target.value)} className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Email *</label>
                    <input type="email" placeholder="votre@email.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} required className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Téléphone</label>
                    <input type="tel" placeholder="06 00 00 00 00" value={formTelephone} onChange={e => setFormTelephone(e.target.value)} className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1.5">Sujet</label>
                  <select value={formSubject} onChange={e => setFormSubject(e.target.value)} className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary cursor-pointer transition-all">
                    <option value="">Choisir un sujet</option>
                    <option>Premier contact / Découverte</option>
                    <option>Coaching familial</option>
                    <option>Coaching maternité</option>
                    <option>Coordination scolaire</option>
                    <option>Coordination professionnelle</option>
                    <option>Rejoindre le réseau (praticien)</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-1.5">Votre message</label>
                  <textarea placeholder="Parlez-nous de votre situation, nous sommes là pour vous écouter..." value={formMessage} onChange={e => setFormMessage(e.target.value)} className="w-full px-3.5 py-2.5 bg-surface border-[1.5px] border-outline-variant rounded-[10px] text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,144,217,0.1)] transition-all resize-y min-h-[100px]" />
                </div>
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={contactLoading}
                  className="w-full py-3.5 bg-primary text-white rounded-lg font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] cursor-pointer transition-all hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed">
                  {contactLoading ? 'Envoi en cours...' : 'Envoyer mon message'}
                </motion.button>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-on-surface text-white/70 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-12 mb-12">
            <div>
              <div className="mb-4"><Logo size="md" white /></div>
              <p className="text-sm leading-[1.7] max-w-[280px]">
                Accompagnement bienveillant pour les familles d&apos;enfants atypiques. Parce que chaque enfant mérite un suivi coordonné et chaque parent mérite du soutien.
              </p>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#accompagnements" className="hover:text-white transition-colors">Coaching familial</Link></li>
                <li><Link href="#accompagnements" className="hover:text-white transition-colors">Coaching maternité</Link></li>
                <li><Link href="#accompagnements" className="hover:text-white transition-colors">Coordination scolaire</Link></li>
                <li><Link href="#accompagnements" className="hover:text-white transition-colors">Coordination pro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">Informations</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
                <li><Link href="#temoignages" className="hover:text-white transition-colors">Témoignages</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">CGV</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <span>© 2026 Le Fil — Vivre Ensemble. Tous droits réservés.</span>
            <div className="flex gap-4">
              <span className="px-3 py-1 border border-white/15 rounded-full text-xs font-medium">🔒 Conforme RGPD</span>
              <span className="px-3 py-1 border border-white/15 rounded-full text-xs font-medium">🇫🇷 🇨🇭 France & Suisse</span>
            </div>
          </div>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  )
}
