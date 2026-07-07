interface WaveDividerProps {
  className?: string
  flip?: boolean
  variant?: 'subtle' | 'accent'
}

export default function WaveDivider({
  className = '',
  flip = false,
  variant = 'subtle'
}: WaveDividerProps): React.JSX.Element {
  const fillA = variant === 'accent' ? 'var(--color-accent)' : 'var(--color-elevated)'
  const fillB = variant === 'accent' ? 'var(--color-accent-dim)' : 'var(--color-border)'

  return (
    <div
      className={[
        'wave-divider pointer-events-none w-full overflow-hidden leading-[0]',
        flip ? 'rotate-180' : '',
        className
      ].join(' ')}
      aria-hidden
    >
      <svg
        className="wave-divider-svg block h-8 w-[200%] sm:h-10"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-layer-a"
          fill={fillA}
          fillOpacity={variant === 'accent' ? 0.15 : 0.7}
          d="M0 30 C200 50 400 10 600 30 C800 50 1000 10 1200 30 V60 H0 Z"
        />
        <path
          className="wave-layer-b"
          fill={fillB}
          fillOpacity={variant === 'accent' ? 0.1 : 0.45}
          d="M0 38 C150 22 350 48 550 34 C750 20 950 46 1200 36 V60 H0 Z"
        />
      </svg>
    </div>
  )
}
