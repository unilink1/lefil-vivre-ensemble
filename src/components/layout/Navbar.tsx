'use client'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20))

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 transition-all duration-400 ${
          scrolled
            ? 'glass border-b border-outline-variant/30 shadow-[0_2px_8px_rgba(45,55,72,0.04)]'
            : 'bg-[rgba(250,250,248,0.8)] backdrop-blur-[20px]'
        }`}
      >
        <div className="max-w-[1200px] mx-auto h-[72px] flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {[
              { label: 'Accompagnements', href: '#accompagnements' },
              { label: 'Comment ça marche', href: '#comment-ca-marche' },
              { label: 'Tarifs', href: '#tarifs' },
              { label: 'Témoignages', href: '#temoignages' },
              { label: 'Contact', href: '#contact' },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="relative text-sm text-on-surface-variant font-medium hover:text-primary transition-colors group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/connexion">
              <motion.span whileHover={{ borderColor: 'rgb(74,144,217)', color: 'rgb(74,144,217)' }}
                className="inline-flex items-center px-5 py-2.5 bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant rounded-[10px] text-sm font-semibold cursor-pointer transition-all">
                Se connecter
              </motion.span>
            </Link>
            <Link href="/inscription">
              <motion.span whileHover={{ y: -1, boxShadow: '0 4px 20px rgba(74,144,217,0.35)' }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[10px] text-sm font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] cursor-pointer transition-all">
                Commencer
              </motion.span>
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-[5px] p-3 min-w-[44px] min-h-[44px] items-center justify-center bg-transparent border-none cursor-pointer">
            <span className={`w-[22px] h-0.5 bg-on-surface rounded transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-[22px] h-0.5 bg-on-surface rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-[22px] h-0.5 bg-on-surface rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className={`fixed top-[72px] left-0 right-0 z-40 bg-surface-card border-b border-outline-variant shadow-lg p-6 flex flex-col ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {['Accompagnements', 'Comment ça marche', 'Tarifs', 'Témoignages', 'Contact'].map(label => (
          <Link key={label} href={`#${label.toLowerCase().replace(/[^a-z]/g, '-')}`} onClick={() => setMenuOpen(false)}
            className="py-3 min-h-[44px] flex items-center text-on-surface font-medium border-b border-outline-variant/20 last:border-0 hover:text-primary transition-colors">
            {label}
          </Link>
        ))}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-outline-variant/20">
          <Link href="/connexion" onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center px-5 py-3 bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant rounded-[10px] text-sm font-semibold transition-all">
            Se connecter
          </Link>
          <Link href="/inscription" onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-[10px] text-sm font-semibold shadow-[0_2px_12px_rgba(74,144,217,0.25)] transition-all">
            Commencer
          </Link>
        </div>
      </motion.div>
    </>
  )
}
