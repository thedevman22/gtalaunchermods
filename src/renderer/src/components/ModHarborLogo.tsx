interface ModHarborLogoProps {
  size?: number
  className?: string
  variant?: 'full' | 'mark'
}

/** Original ModHarbor mark: lighthouse beacon + calm harbor wave */
export default function ModHarborLogo({
  size = 40,
  className = '',
  variant = 'mark'
}: ModHarborLogoProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={variant === 'mark'}
      aria-label={variant === 'full' ? 'ModHarbor' : undefined}
    >
      <defs>
        <linearGradient id="mh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="mh-sea" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#mh-sky)" />
      <path
        d="M0 46 C16 40 24 50 40 44 C52 40 58 46 64 42 V64 H0 Z"
        fill="url(#mh-sea)"
        opacity="0.9"
      />
      <path
        d="M0 50 C20 46 28 54 48 48 C56 46 60 50 64 48 V64 H0 Z"
        fill="#0369a1"
        opacity="0.55"
      />
      {/* Lighthouse */}
      <rect x="28" y="18" width="8" height="26" rx="1" fill="#f8fafc" />
      <rect x="26" y="30" width="12" height="3" rx="0.5" fill="#e2e8f0" />
      <rect x="26" y="36" width="12" height="3" rx="0.5" fill="#e2e8f0" />
      <path d="M26 18 L32 10 L38 18 Z" fill="#f1f5f9" />
      <circle cx="32" cy="14" r="2.5" fill="#fef08a" opacity="0.95" />
      <path
        d="M32 12 L38 8 L38 16 Z"
        fill="#fef9c3"
        opacity="0.45"
      />
      {/* Anchor accent */}
      <circle cx="32" cy="52" r="2" fill="#f0f9ff" opacity="0.8" />
    </svg>
  )
}
