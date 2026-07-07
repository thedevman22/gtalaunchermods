'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { BillingInterval } from '@/lib/pricing'
import { maxYearlySavingsPercent } from '@/lib/pricing'
import { MOTION_DURATION_FAST, transition } from '@/lib/motion'

type BillingToggleProps = {
  value: BillingInterval
  onChange: (interval: BillingInterval) => void
}

export default function BillingToggle({ value, onChange }: BillingToggleProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const isYearly = value === 'yearly'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-surface/80 p-1.5 shadow-inner"
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={[
            'relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
            !isYearly ? 'text-text' : 'text-muted hover:text-text'
          ].join(' ')}
          aria-pressed={!isYearly}
        >
          {!isYearly ? (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-elevated shadow-sm"
              transition={transition(reduced ?? false, MOTION_DURATION_FAST)}
            />
          ) : null}
          <span className="relative z-10">Monthly</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('yearly')}
          className={[
            'relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
            isYearly ? 'text-text' : 'text-muted hover:text-text'
          ].join(' ')}
          aria-pressed={isYearly}
        >
          {isYearly ? (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 rounded-full bg-elevated shadow-sm"
              transition={transition(reduced ?? false, MOTION_DURATION_FAST)}
            />
          ) : null}
          <span className="relative z-10">Yearly</span>
        </button>
      </div>

      <motion.p
        key={isYearly ? 'yearly' : 'monthly'}
        initial={reduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition(reduced ?? false, 0.24)}
        className="text-xs text-muted"
      >
        {isYearly ? (
          <span>
            Save up to{' '}
            <span className="font-semibold text-emerald-400">{maxYearlySavingsPercent()}%</span> with
            annual billing
          </span>
        ) : (
          'Switch to yearly and save on Pro & Elite'
        )}
      </motion.p>
    </div>
  )
}
