'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────
   FAQ Accordion Item
   ────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-outline-variant/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-[family-name:var(--font-heading)] font-semibold text-on-surface pr-4">{q}</span>
        <span
          className="material-symbols-outlined text-outline transition-transform duration-300 shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="text-on-surface-variant leading-relaxed pb-5">{a}</p>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Scroll Reveal Hook (IntersectionObserver)
   ────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Data
   ────────────────────────────────────────────── */
const features = [
  { icon: 'folder_shared', title: 'Dossier centralis\u00e9', desc: 'Toutes les informations de votre enfant au m\u00eame endroit : diagnostics, bilans, ordonnances, comptes-rendus.', color: '#3B82D9' },
  { icon: 'lock', title: 'Partage s\u00e9curis\u00e9', desc: 'Choisissez pr\u00e9cis\u00e9ment quels documents partager avec chaque praticien. Vos donn\u00e9es restent les v\u00f4tres.', color: '#5CB89A' },
  { icon: 'edit_note', title: 'Journal quotidien', desc: 'Notez les progr\u00e8s, les humeurs et les \u00e9v\u00e9nements du jour. Un historique pr\u00e9cieux pour le suivi.', color: '#E09060' },
  { icon: 'groups', title: 'Coordination d\u2019\u00e9quipe', desc: 'Orthophoniste, psychologue, ergoth\u00e9rapeute\u2026 Tous connect\u00e9s autour du parcours de votre enfant.', color: '#3B82D9' },
]

const steps = [
  { num: '01', title: 'Inscription', desc: 'Cr\u00e9ez votre compte en quelques minutes.', color: '#3B82D9' },
  { num: '02', title: 'Profil enfant', desc: 'Renseignez le profil et les sp\u00e9cificit\u00e9s de votre enfant.', color: '#5CB89A' },
  { num: '03', title: 'Inviter praticiens', desc: 'Envoyez une invitation aux professionnels qui suivent votre enfant.', color: '#E09060' },
  { num: '04', title: 'Suivre ensemble', desc: 'Partagez, coordonnez et suivez les progr\u00e8s en temps r\u00e9el.', color: '#3B82D9' },
]

const plans = [
  {
    name: 'Essentiel',
    price: '77',
    desc: 'Pour d\u00e9marrer et structurer votre parcours',
    features: ['1 profil enfant', 'Coaching mensuel (1 session)', 'Acc\u00e8s plateforme de suivi', 'Support par email', 'Ressources et guides'],
    color: '#3B82D9',
    popular: false,
  },
  {
    name: 'S\u00e9r\u00e9nit\u00e9',
    price: '99',
    desc: 'Pour un accompagnement complet et r\u00e9gulier',
    features: ['2 profils enfants', 'Coaching bimensuel (2 sessions)', 'Coordination praticiens', 'Messagerie interne', 'Agenda partag\u00e9', 'Support prioritaire'],
    color: '#5CB89A',
    popular: true,
  },
  {
    name: 'Accompagnement+',
    price: '165',
    desc: 'Pour un soutien intensif et sur mesure',
    features: ['Profils illimit\u00e9s', 'Coaching hebdomadaire', 'Synth\u00e8se d\u2019\u00e9quipe pluridisciplinaire', 'Templates MDPH automatiques', 'QR code urgence', 'Support 7j/7'],
    color: '#E09060',
    popular: false,
  },
]

const testimonials = [
  { text: 'Le Fil a compl\u00e8tement chang\u00e9 notre quotidien. Enfin une plateforme qui centralise tout le suivi de notre fils. Fini les dossiers \u00e9parpill\u00e9s et les informations perdues entre praticiens.', name: 'Sophie M.', role: 'Maman de Th\u00e9o, 6 ans \u2014 TSA', color: '#3B82D9' },
  { text: 'La coordination entre les praticiens de mon fils \u00e9tait un cauchemar. Maintenant tout est centralis\u00e9, chacun sait ce que l\u2019autre fait. Un vrai soulagement.', name: 'Marie L.', role: 'Maman de Lucas, 8 ans \u2014 TDAH', color: '#5CB89A' },
  { text: 'En tant qu\u2019orthophoniste, avoir acc\u00e8s au suivi global de l\u2019enfant change tout. Je vois ce que font les autres praticiens et j\u2019adapte ma prise en charge.', name: 'Claire D.', role: 'Orthophoniste lib\u00e9rale', color: '#E09060' },
]

const faqs = [
  { q: 'Le Fil est-il adapt\u00e9 \u00e0 tous les types de handicap ?', a: 'Oui. Le Fil est con\u00e7u pour accompagner les familles d\u2019enfants avec tout type de trouble ou de handicap : TSA, TDAH, DYS, troubles du d\u00e9veloppement, maladies rares, etc.' },
  { q: 'Mes donn\u00e9es sont-elles s\u00e9curis\u00e9es ?', a: 'Absolument. Nous sommes conformes RGPD et h\u00e9bergeons vos donn\u00e9es de sant\u00e9 chez un h\u00e9bergeur certifi\u00e9 HDS (H\u00e9bergeur de Donn\u00e9es de Sant\u00e9). Toutes les communications sont chiffr\u00e9es.' },
  { q: 'Puis-je inviter plusieurs praticiens ?', a: 'Oui, vous pouvez inviter autant de praticiens que n\u00e9cessaire. Chacun n\u2019aura acc\u00e8s qu\u2019aux documents que vous choisissez de partager.' },
  { q: 'Le Fil fonctionne-t-il en Suisse ?', a: 'Oui. Le Fil est disponible en France et en Suisse. Les tarifs sont affich\u00e9s en CHF et nous respectons les r\u00e9glementations locales.' },
  { q: 'Puis-je changer de forfait \u00e0 tout moment ?', a: 'Bien s\u00fbr. Vous pouvez upgrader ou downgrader votre forfait \u00e0 tout moment depuis les param\u00e8tres de votre compte. Le changement prend effet imm\u00e9diatement.' },
  { q: 'Y a-t-il un engagement ?', a: 'Non. Tous nos forfaits sont sans engagement. Vous pouvez r\u00e9silier \u00e0 tout moment, sans frais ni justification.' },
]

/* ──────────────────────────────────────────────
   LANDING PAGE
   ────────────────────────────────────────────── */
export default function LandingPage() {
  const [formPrenom, setFormPrenom] = useState('')
  const [formNom, setFormNom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTelephone, setFormTelephone] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState('')
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      if (!res.ok) throw new Error('Erreur')
      setContactSuccess(true)
      setFormPrenom('')
      setFormNom('')
      setFormEmail('')
      setFormTelephone('')
      setFormSubject('')
      setFormMessage('')
    } catch {
      setContactError('Une erreur est survenue. Veuillez r\u00e9essayer.')
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface overflow-hidden">

      {/* ═══════════════════════════════════════════
          NAV
          ═══════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? 'rgba(250,250,248,0.82)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(20px) saturate(1.3)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(20px) saturate(1.3)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(232,236,240,0.6)' : '1px solid transparent',
          boxShadow: navScrolled ? '0 1px 12px rgba(45,55,72,0.05)' : 'none',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82D9] to-[#5CB89A] flex items-center justify-center shadow-sm">
              <span className="text-white font-[family-name:var(--font-heading)] font-extrabold text-sm leading-none">LF</span>
            </div>
            <span className="font-[family-name:var(--font-heading)] font-bold text-on-surface text-lg">Le Fil</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Fonctionnalit\u00e9s</a>
            <a href="#comment-ca-marche" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Comment \u00e7a marche</a>
            <a href="#tarifs" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Tarifs</a>
            <a href="#contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/connexion" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors px-4 py-2">
              Connexion
            </Link>
            <Link href="/inscription" className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-lg transition-colors shadow-sm btn-press">
              Cr\u00e9er un compte
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 cursor-pointer">
            <span className="material-symbols-outlined text-on-surface">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{
            maxHeight: mobileMenuOpen ? '400px' : '0px',
            opacity: mobileMenuOpen ? 1 : 0,
            background: 'rgba(250,250,248,0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-5 pb-6 pt-2 flex flex-col gap-4">
            <a href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors py-1">Fonctionnalit\u00e9s</a>
            <a href="#comment-ca-marche" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors py-1">Comment \u00e7a marche</a>
            <a href="#tarifs" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors py-1">Tarifs</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors py-1">Contact</a>
            <hr className="border-outline-variant/40" />
            <Link href="/connexion" className="text-on-surface-variant hover:text-primary transition-colors py-1">Connexion</Link>
            <Link href="/inscription" className="text-center text-white bg-primary hover:bg-primary-dark font-semibold py-3 rounded-lg transition-colors">Cr\u00e9er un compte</Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-dvh flex items-center pt-[100px] pb-20 sm:pt-[140px] sm:pb-32 px-5 sm:px-8 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0f4ff] via-[#e8f5f0] to-[#fdf5ed]" />
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.18]" style={{ background: 'radial-gradient(circle, #3B82D9 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #5CB89A 0%, transparent 70%)' }} />
          <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] rounded-full opacity-[0.10]" style={{ background: 'radial-gradient(circle, #E09060 0%, transparent 70%)' }} />
          {/* Noise */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '200px' }} />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — Text */}
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/[0.08] border border-primary/15 rounded-full text-sm font-medium text-primary mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Plateforme de coordination de soins
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4.5vw,3.6rem)] font-extrabold leading-[1.1] mb-6 text-on-surface">
              Coordonner les soins de votre enfant,{' '}
              <span className="gradient-text">en toute s\u00e9r\u00e9nit\u00e9</span>
            </h1>

            <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-[540px]">
              Le Fil centralise le suivi de votre enfant atypique et connecte tous ses praticiens sur une plateforme s\u00e9curis\u00e9e. TSA, TDAH, DYS, handicap &mdash; vous n&apos;\u00eates plus seul.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12">
              <Link href="/inscription" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-[0.95rem] shadow-[0_2px_16px_rgba(59,130,217,0.3)] hover:shadow-[0_4px_24px_rgba(59,130,217,0.4)] hover:translate-y-[-2px] transition-all duration-300 btn-press">
                Cr\u00e9er un compte
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <a href="#fonctionnalites" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-[1.5px] border-outline-variant text-on-surface-variant rounded-xl font-semibold text-[0.95rem] hover:border-primary hover:text-primary transition-all duration-300 btn-press">
                En savoir plus
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 sm:gap-14 pt-8 border-t border-outline-variant/30">
              {[
                { num: '250+', label: 'Familles accompagn\u00e9es' },
                { num: '98%', label: 'Satisfaction' },
                { num: '15+', label: 'Praticiens partenaires' },
              ].map((s, i) => (
                <div key={i} className="fade-in" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-primary">{s.num}</div>
                  <div className="text-xs text-outline mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating cards */}
          <div className="hidden lg:flex justify-center fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-[420px] h-[480px]">
              {/* Card 1 — Child profile */}
              <div className="absolute top-0 left-0 w-[300px] bg-surface-card rounded-2xl p-6 shadow-lg border border-outline-variant/20 float-animation hover-lift">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-sm font-bold">L</div>
                  <div>
                    <div className="font-semibold text-sm">Lucas, 7 ans</div>
                    <div className="text-[0.72rem] text-outline">Suivi pluridisciplinaire</div>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[0.7rem] font-semibold">TDAH</span>
                  <span className="px-2.5 py-0.5 bg-secondary/12 text-secondary rounded-full text-[0.7rem] font-semibold">Dyslexie</span>
                </div>
                <div className="text-[0.78rem] text-on-surface-variant mb-2">Progr\u00e8s cette semaine</div>
                <div className="w-full bg-outline-variant/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Card 2 — Sessions */}
              <div className="absolute bottom-8 right-0 w-[260px] bg-surface-card rounded-2xl p-6 shadow-lg border border-outline-variant/20 float-animation-delayed hover-lift">
                <div className="text-[0.78rem] text-outline mb-1">S\u00e9ances ce mois</div>
                <div className="font-[family-name:var(--font-heading)] text-xl font-extrabold mb-3">12 s\u00e9ances</div>
                <div className="flex items-end gap-1.5 h-12">
                  {[60,40,80,55,90,70,100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        background: i === 6 ? '#3B82D9' : i >= 4 ? '#5CB89A' : '#E8ECF0',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Card 3 — Notification */}
              <div className="absolute top-[55%] left-[-20px] w-[240px] bg-surface-card rounded-2xl p-4 shadow-lg border border-outline-variant/20 float-animation-slow hover-lift">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary/15 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                  </div>
                  <div>
                    <div className="text-[0.78rem] font-semibold text-on-surface">Bilan orthophonique</div>
                    <div className="text-[0.68rem] text-outline">Partag\u00e9 avec Dr. Martin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. TRUSTED BY
          ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-5 sm:px-8 bg-surface-warm/50">
        <Reveal className="max-w-[1200px] mx-auto text-center">
          <p className="text-sm font-medium text-outline uppercase tracking-wider mb-10">Ils nous font confiance</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {[
              { icon: 'shield', label: 'RGPD', sublabel: 'Conforme' },
              { icon: 'local_hospital', label: 'HDS', sublabel: 'Certifi\u00e9' },
              { icon: 'flag', label: 'Suisse', sublabel: 'Disponible' },
              { icon: 'encrypted', label: 'Chiffrement', sublabel: 'AES-256' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 bg-surface-card rounded-xl border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">{b.icon}</span>
                <div className="text-left">
                  <div className="font-[family-name:var(--font-heading)] font-bold text-sm text-on-surface">{b.label}</div>
                  <div className="text-[0.7rem] text-outline">{b.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════
          3. FEATURES
          ═══════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Fonctionnalit\u00e9s</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold text-on-surface mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-on-surface-variant max-w-[560px] mx-auto">
              Une plateforme pens\u00e9e pour simplifier le quotidien des familles et des professionnels.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group relative bg-surface-card rounded-2xl p-7 border border-outline-variant/25 hover:border-transparent transition-all duration-300 hover-lift card-shine h-full">
                  {/* Gradient top line */}
                  <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: f.color }} />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}12` }}>
                    <span className="material-symbols-outlined text-[24px]" style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-on-surface mb-2">{f.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-20 sm:py-28 px-5 sm:px-8 bg-gradient-to-b from-surface to-surface-warm/50">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Comment \u00e7a marche</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold text-on-surface mb-4">
              4 \u00e9tapes pour d\u00e9marrer
            </h2>
            <p className="text-on-surface-variant max-w-[560px] mx-auto">
              Un processus simple et guid\u00e9 pour commencer \u00e0 coordonner le suivi de votre enfant.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="relative bg-surface-card rounded-2xl p-7 border border-outline-variant/25 hover-lift h-full">
                  {/* Number */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 font-[family-name:var(--font-heading)] font-extrabold text-lg text-white"
                    style={{ background: s.color }}
                  >
                    {s.num}
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-on-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                  {/* Connector line (except last) */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-10 right-[-12px] w-6 h-[2px] bg-outline-variant/40" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. PRICING
          ═══════════════════════════════════════════ */}
      <section id="tarifs" className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-3">Tarifs</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold text-on-surface mb-4">
              Un forfait adapt\u00e9 \u00e0 chaque famille
            </h2>
            <p className="text-on-surface-variant max-w-[560px] mx-auto">
              Tous nos forfaits sont sans engagement. Changez ou annulez \u00e0 tout moment.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`relative bg-surface-card rounded-2xl p-8 border transition-all duration-300 hover-lift h-full ${
                    p.popular ? 'border-transparent shadow-lg ring-2' : 'border-outline-variant/25'
                  }`}
                  style={p.popular ? { '--tw-ring-color': p.color } as React.CSSProperties : {}}
                >
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ background: p.color }}>
                      Le plus populaire
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg text-on-surface mb-1">{p.name}</h3>
                    <p className="text-sm text-on-surface-variant">{p.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-[family-name:var(--font-heading)] text-4xl font-extrabold text-on-surface">{p.price}</span>
                    <span className="text-on-surface-variant ml-1">CHF/mois</span>
                  </div>
                  <Link
                    href="/inscription"
                    className="block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 mb-6 btn-press"
                    style={
                      p.popular
                        ? { background: p.color, color: '#fff', boxShadow: `0 2px 12px ${p.color}40` }
                        : { background: 'transparent', border: '1.5px solid var(--color-outline-variant)', color: 'var(--color-on-surface)' }
                    }
                  >
                    Commencer
                  </Link>
                  <ul className="space-y-3">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0" style={{ color: p.color }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-surface-warm/50">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">T\u00e9moignages</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold text-on-surface mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-surface-card rounded-2xl p-7 border border-outline-variant/25 hover-lift h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="material-symbols-outlined text-[18px]" style={{ color: '#F5C842', fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-on-surface-variant leading-relaxed mb-6 flex-1">&laquo;&nbsp;{t.text}&nbsp;&raquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: t.color }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-on-surface">{t.name}</div>
                      <div className="text-[0.72rem] text-outline">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. FAQ
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-[720px] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-on-surface mb-4">
              Questions fr\u00e9quentes
            </h2>
          </Reveal>

          <Reveal>
            <div className="bg-surface-card rounded-2xl border border-outline-variant/25 px-7 py-2">
              {faqs.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. CONTACT FORM
          ═══════════════════════════════════════════ */}
      <section id="contact" className="py-20 sm:py-28 px-5 sm:px-8 bg-gradient-to-b from-surface-warm/50 to-surface">
        <div className="max-w-[720px] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-sm font-semibold text-tertiary uppercase tracking-wider mb-3">Contact</p>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-on-surface mb-4">
              Une question ? \u00c9crivez-nous
            </h2>
            <p className="text-on-surface-variant">
              Notre \u00e9quipe vous r\u00e9pond sous 24h.
            </p>
          </Reveal>

          <Reveal>
            <form
              onSubmit={handleContactSubmit}
              className="bg-surface-card rounded-2xl border border-outline-variant/25 p-7 sm:p-10 shadow-sm"
            >
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Pr\u00e9nom</label>
                  <input
                    type="text"
                    required
                    value={formPrenom}
                    onChange={e => setFormPrenom(e.target.value)}
                    placeholder="Votre pr\u00e9nom"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Nom</label>
                  <input
                    type="text"
                    required
                    value={formNom}
                    onChange={e => setFormNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">T\u00e9l\u00e9phone</label>
                  <input
                    type="tel"
                    value={formTelephone}
                    onChange={e => setFormTelephone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Sujet</label>
                <select
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">S\u00e9lectionnez un sujet</option>
                  <option value="information">Demande d&apos;information</option>
                  <option value="devis">Demande de devis</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="support">Support technique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  placeholder="D\u00e9crivez votre demande..."
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface text-on-surface text-sm placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {contactError && (
                <div className="mb-4 px-4 py-3 bg-error-container text-error rounded-xl text-sm">{contactError}</div>
              )}
              {contactSuccess && (
                <div className="mb-4 px-4 py-3 bg-secondary-container text-secondary rounded-xl text-sm font-medium">
                  Merci ! Votre message a bien \u00e9t\u00e9 envoy\u00e9. Nous vous r\u00e9pondrons sous 24h.
                </div>
              )}

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md btn-press disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {contactLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le message'
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="bg-on-surface text-white/70 pt-16 pb-8 px-5 sm:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82D9] to-[#5CB89A] flex items-center justify-center">
                  <span className="text-white font-[family-name:var(--font-heading)] font-extrabold text-sm leading-none">LF</span>
                </div>
                <span className="font-[family-name:var(--font-heading)] font-bold text-white text-lg">Le Fil</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Coordonner les soins de votre enfant atypique, en toute s\u00e9r\u00e9nit\u00e9.
              </p>
              <a href="mailto:contact@lefil-vivre-ensemble.com" className="text-sm text-primary-light hover:text-white transition-colors">
                contact@lefil-vivre-ensemble.com
              </a>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">Plateforme</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalit\u00e9s</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment \u00e7a marche</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">Compte</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/connexion" className="hover:text-white transition-colors">Connexion</Link></li>
                <li><Link href="/inscription" className="hover:text-white transition-colors">Cr\u00e9er un compte</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-heading)] font-bold text-white text-sm mb-4">L\u00e9gal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Mentions l\u00e9gales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialit\u00e9</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Le Fil &mdash; Vivre Ensemble. Tous droits r\u00e9serv\u00e9s.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                RGPD
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                HDS
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="material-symbols-outlined text-[14px]">encrypted</span>
                SSL
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
