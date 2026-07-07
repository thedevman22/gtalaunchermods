interface ModHarborLogoProps {
  /** Mark: square box size. Full: rendered height (width scales). */
  size?: number
  className?: string
  variant?: 'full' | 'mark'
}

export default function ModHarborLogo({
  size = 40,
  className = '',
  variant = 'mark'
}: ModHarborLogoProps): React.JSX.Element {
  if (variant === 'full') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
      <img
        src="/brand/modharbor-wordmark.png"
        alt="ModHarbor"
        draggable={false}
        style={{ height: size, width: 'auto' }}
        className={`select-none object-contain ${className}`}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
    <img
      src="/brand/modharbor-mark.png"
      alt=""
      aria-hidden
      draggable={false}
      style={{ width: size, height: size }}
      className={`select-none object-contain ${className}`}
    />
  )
}
