'use client'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-7',
  lg: 'p-6 sm:p-9',
}

export default function Card({ children, className = '', hover = true, onClick, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100/80 shadow-sm
        transition-all duration-300 ease-out ${paddings[padding]}
        ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200/60' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
