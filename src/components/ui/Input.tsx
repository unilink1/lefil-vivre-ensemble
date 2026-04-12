'use client'
import { useState } from 'react'

interface InputProps {
  label: string
  type?: string
  placeholder?: string
  icon?: string
  value?: string
  onChange?: (v: string) => void
  required?: boolean
  className?: string
  hint?: string
  error?: string
}

export default function Input({
  label, type = 'text', placeholder, icon, value, onChange,
  required, className = '', hint, error
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-on-surface leading-none">
        {label} {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(requis)</span>}
      </label>
      <div className={`
        relative flex items-center rounded-xl transition-all duration-300
        ${error
          ? 'bg-error/5 ring-2 ring-error/25'
          : focused
            ? 'bg-white shadow-md shadow-primary/5 ring-2 ring-primary/25'
            : 'bg-surface-low hover:bg-surface-high/60'
        }
      `}>
        {icon && (
          <span
            className={`material-symbols-outlined absolute left-4 text-[20px] transition-colors duration-300 ${focused ? 'text-primary' : error ? 'text-error' : 'text-outline'}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          aria-required={required}
          aria-describedby={hint ? `${inputId}-hint` : error ? `${inputId}-error` : undefined}
          aria-invalid={!!error}
          className={`
            w-full py-4 bg-transparent outline-none text-on-surface placeholder:text-outline/50
            font-[family-name:var(--font-body)] text-[15px] leading-relaxed
            ${icon ? 'pl-12 pr-4' : 'px-4'}
            ${isPassword ? 'pr-12' : ''}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-outline hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error flex items-center gap-1.5 mt-0.5" role="alert">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}
