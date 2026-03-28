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
}

export default function Input({
  label, type = 'text', placeholder, icon, value, onChange, required, className = ''
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className={`
        relative flex items-center rounded-xl transition-all duration-300
        ${focused
          ? 'bg-white shadow-md shadow-primary/5 ring-2 ring-primary/20'
          : 'bg-surface-low hover:bg-surface-high/50'
        }
      `}>
        {icon && (
          <span className={`material-symbols-outlined absolute left-4 text-[20px] transition-colors duration-300 ${focused ? 'text-primary' : 'text-outline'}`}>
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={`
            w-full py-3.5 bg-transparent outline-none text-on-surface placeholder:text-outline/60
            font-[family-name:var(--font-body)] text-[15px]
            ${icon ? 'pl-12 pr-4' : 'px-4'}
            ${isPassword ? 'pr-12' : ''}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
