'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({ children, className = '', hover = true, onClick, padding = 'md' }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(26,28,27,0.08)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        bg-surface-card rounded-2xl shadow-[0_8px_32px_rgba(26,28,27,0.04)]
        transition-all duration-300 ${paddings[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
