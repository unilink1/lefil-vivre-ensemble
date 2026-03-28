interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'gold' | 'outline'
  size?: 'sm' | 'md'
  icon?: string
}

const variants = {
  primary: 'bg-primary-fixed text-primary',
  secondary: 'bg-secondary-container text-secondary',
  tertiary: 'bg-tertiary-fixed text-tertiary',
  error: 'bg-error-container text-error',
  gold: 'bg-gold-container text-amber-700',
  outline: 'bg-transparent border border-outline-variant text-on-surface-variant',
}

export default function Badge({ children, variant = 'primary', size = 'sm', icon }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full
      ${variants[variant]}
      ${size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'}
    `}>
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  )
}
