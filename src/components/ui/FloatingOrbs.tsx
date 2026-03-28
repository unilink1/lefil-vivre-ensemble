'use client'
import { motion } from 'framer-motion'

interface FloatingOrbsProps {
  variant?: 'hero' | 'auth' | 'subtle'
}

export default function FloatingOrbs({ variant = 'hero' }: FloatingOrbsProps) {
  if (variant === 'subtle') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: 'rgba(74,144,217,0.06)' }}
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[80px]"
          style={{ background: 'rgba(126,200,176,0.06)' }}
        />
      </div>
    )
  }

  if (variant === 'auth') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{ background: 'rgba(74,144,217,0.12)' }}
        />
        <motion.div
          animate={{ y: [15, -15, 15], x: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[60px]"
          style={{ background: 'rgba(126,200,176,0.1)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[50px]"
          style={{ background: 'rgba(232,168,124,0.08)' }}
        />
      </div>
    )
  }

  // Hero — matches the site's 3 orbs
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full blur-[80px]"
        style={{ background: 'rgba(74,144,217,0.12)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-[50px] -left-[100px] w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{ background: 'rgba(126,200,176,0.1)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{ background: 'rgba(232,168,124,0.08)' }}
      />
    </div>
  )
}
