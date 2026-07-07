import { motion } from 'framer-motion'
import { MOTION_DURATION, MOTION_EASE } from '@renderer/lib/motion'

interface AnimatedToggleProps {
  enabled: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  label?: string
}

export default function AnimatedToggle({
  enabled,
  disabled,
  onChange,
  label
}: AnimatedToggleProps): React.JSX.Element {
  return (
    <label className="flex items-center gap-2.5">
      {label ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">
          {label}
        </span>
      ) : null}
      <motion.button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={[
          'relative h-6 w-11 rounded-full transition-colors duration-200 disabled:opacity-50',
          enabled ? 'bg-launcher-accent/30' : 'bg-launcher-border'
        ].join(' ')}
      >
        <motion.span
          animate={{
            x: enabled ? 22 : 2,
            backgroundColor: enabled ? 'rgb(0, 230, 118)' : 'var(--color-launcher-muted)'
          }}
          transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
          className="absolute top-0.5 h-5 w-5 rounded-full shadow-[0_0_8px_var(--color-launcher-glow)]"
        />
      </motion.button>
    </label>
  )
}
