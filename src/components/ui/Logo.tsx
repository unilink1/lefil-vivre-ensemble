interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  white?: boolean
  showText?: boolean
}

const sizes = {
  sm: { icon: 36, text: 'text-[1rem]', sub: 'text-[0.7rem]' },
  md: { icon: 42, text: 'text-[1.15rem]', sub: 'text-[0.78rem]' },
  lg: { icon: 52, text: 'text-[1.4rem]', sub: 'text-[0.85rem]' },
  xl: { icon: 64, text: 'text-[1.8rem]', sub: 'text-[0.95rem]' },
}

export default function Logo({ size = 'md', white = false, showText = true }: LogoProps) {
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      <svg className="shrink-0 transition-transform duration-300 hover:scale-105" width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Heartbeat line */}
        <path
          d="M5 55 L25 55 L30 40 L38 70 L46 30 L54 65 L58 50 L65 55 L95 55"
          stroke={white ? 'white' : 'url(#logoGrad)'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Child head */}
        <circle cx="50" cy="22" r="7" fill={white ? 'white' : 'url(#logoGrad)'} />
        {/* Child body */}
        <path
          d="M50 29 C50 29 42 32 42 42 L42 52 C42 52 44 54 50 54 C56 54 58 52 58 52 L58 42 C58 32 50 29 50 29Z"
          fill={white ? 'white' : 'url(#logoGrad)'}
          opacity="0.85"
        />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#5BA8C8" />
            <stop offset="50%" stopColor="#7EC8B0" />
            <stop offset="100%" stopColor="#4A90D9" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-[family-name:var(--font-heading)] ${s.text} font-bold tracking-[-0.02em] ${white ? 'text-white' : 'text-on-surface'}`}>
            Le Fil
          </span>
          <span className={`${s.sub} font-normal ${white ? 'text-white/50' : 'text-outline'} mt-[-2px]`}>
            Vivre Ensemble
          </span>
        </div>
      )}
    </div>
  )
}
