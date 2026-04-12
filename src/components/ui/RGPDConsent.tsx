'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RGPDConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('lefil-rgpd-consent')
    if (!consent) {
      // Small delay for better UX
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('lefil-rgpd-consent', JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      version: '1.0',
    }))
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('lefil-rgpd-consent', JSON.stringify({
      accepted: false,
      date: new Date().toISOString(),
      version: '1.0',
    }))
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="dialog"
          aria-label="Consentement RGPD"
          aria-modal="false"
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#4A90D9]/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px] text-[#4A90D9]">shield</span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 text-base">
                  Protection de vos donnees de sante
                </h2>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  Le Fil traite des donnees medicales sensibles. Conformement au RGPD et aux
                  reglementations relatives aux donnees de sante, vos informations sont chiffrees
                  et stockees de maniere securisee. Aucune donnee n&apos;est partagee avec des tiers
                  sans votre consentement explicite.
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-symbols-outlined text-[14px] text-[#7EC8B0]">check_circle</span>
                    Chiffrement des donnees de bout en bout
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-symbols-outlined text-[14px] text-[#7EC8B0]">check_circle</span>
                    Hebergement conforme HDS (Hebergeur de Donnees de Sante)
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-symbols-outlined text-[14px] text-[#7EC8B0]">check_circle</span>
                    Droit d&apos;acces, de rectification et de suppression a tout moment
                  </li>
                </ul>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={accept}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#4A90D9] text-white rounded-xl text-sm font-semibold hover:bg-[#3B7DD8] transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    J&apos;accepte
                  </button>
                  <button
                    onClick={decline}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    Refuser les non-essentiels
                  </button>
                  <a
                    href="/politique-confidentialite"
                    className="px-5 py-2.5 text-[#4A90D9] text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    En savoir plus
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
