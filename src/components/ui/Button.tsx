'use client'
import { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

const variants: Record<ButtonVariant, string> = {
  primary: 'gradient-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
  secondary: 'bg-secondary-container text-secondary hover:bg-secondary-container/80',
  ghost: 'bg-transparent text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5',
  danger: 'bg-error/10 text-error hover:bg-error/20',
  outline: 'bg-surface-card text-on-surface border border-outline-variant/30 hover:border-primary/40 hover:bg-primary-fixed/20',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 text-sm rounded-xl min-h-[40px]',
  md: 'px-6 py-3 text-base rounded-xl min-h-[44px]',
  lg: 'px-8 py-4 text-base rounded-2xl min-h-[52px]',
  xl: 'px-10 py-5 text-lg rounded-2xl min-h-[56px]',
}

export default function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth, onClick, type = 'button', disabled, className = ''
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2.5 font-semibold
        font-[family-name:var(--font-heading)] leading-none
        transition-all duration-300 ease-out cursor-pointer
        hover:scale-[1.02] hover:-translate-y-px active:scale-[0.98]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icon}</span>}
      {children}
      {iconRight && <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{iconRight}</span>}
    </button>
  )
}
