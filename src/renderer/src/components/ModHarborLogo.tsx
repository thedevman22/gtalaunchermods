import mark from '@renderer/assets/brand/modharbor-mark.png'
import wordmark from '@renderer/assets/brand/modharbor-wordmark.png'

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
      <img
        src={wordmark}
        alt="ModHarbor"
        draggable={false}
        style={{ height: size, width: 'auto' }}
        className={['select-none object-contain', className].join(' ')}
      />
    )
  }
  return (
    <img
      src={mark}
      alt=""
      aria-hidden
      draggable={false}
      style={{ width: size, height: size }}
      className={['select-none object-contain', className].join(' ')}
    />
  )
}
