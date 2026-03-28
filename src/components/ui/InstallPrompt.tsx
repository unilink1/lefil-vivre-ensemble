'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-surface-card border border-outline-variant/30 rounded-full shadow-[0_8px_40px_rgba(45,55,72,0.15)]">
            <span className="material-symbols-outlined text-primary text-[20px]">download</span>
            <button
              onClick={handleInstall}
              className="text-sm font-semibold text-on-surface whitespace-nowrap cursor-pointer"
            >
              Installer l&apos;application
            </button>
            <button
              onClick={() => setShow(false)}
              className="text-outline hover:text-on-surface transition-colors cursor-pointer ml-1"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
