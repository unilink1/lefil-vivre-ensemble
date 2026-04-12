'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default')
  const [dismissed, setDismissed] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission)

    // Check if user has dismissed before
    const wasDismissed = localStorage.getItem('notif-prompt-dismissed')
    if (wasDismissed) setDismissed(true)
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    setRequesting(true)
    try {
      const result = await Notification.requestPermission()
      setStatus(result)
      if (result === 'granted') {
        // Send a test notification
        new Notification('Le Fil — Notifications activées', {
          body: 'Vous recevrez des rappels pour les rendez-vous et médicaments.',
          icon: '/icon-192.png',
        })
      }
    } catch {
      // User declined or browser issue
    }
    setRequesting(false)
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('notif-prompt-dismissed', '1')
  }

  // Don't show if: unsupported, already granted, denied, or dismissed
  if (status === 'unsupported' || status === 'granted' || status === 'denied' || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        role="complementary"
        aria-label="Activer les notifications"
        className="mb-5 bg-gradient-to-r from-[#4A90D9]/8 to-[#7EC8B0]/8 border border-[#4A90D9]/15 rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="w-10 h-10 bg-[#4A90D9]/15 rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px] text-[#4A90D9]">notifications</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">Activer les notifications</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Recevez des rappels pour les RDV et médicaments
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={dismiss}
            aria-label="Ignorer"
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <button
            onClick={requestPermission}
            disabled={requesting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4A90D9] text-white rounded-xl text-sm font-semibold hover:bg-[#3B7DD8] transition-all disabled:opacity-60"
          >
            {requesting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
            )}
            Activer
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
