'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { transition } from '@/lib/motion'

type PricingCtaProps = {
  highlight?: boolean
  disabled?: boolean
  busy?: boolean
  href?: string
  onClick?: () => void
  children: React.ReactNode
}

export default function PricingCta({
  highlight = false,
  disabled = false,
  busy = false,
  href,
  onClick,
  children
}: PricingCtaProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const className = [
    'pricing-cta group relative mt-8 block w-full overflow-hidden rounded-xl py-3.5 text-center text-xs font-bold uppercase tracking-wider',
    highlight
      ? 'bg-gradient-to-r from-accent to-accent-dim text-bg shadow-[0_4px_24px_rgba(56,189,248,0.35)]'
      : 'border border-border bg-elevated text-text',
    disabled ? 'cursor-not-allowed opacity-50' : ''
  ].join(' ')

  const motionProps = {
    whileHover: reduced || disabled ? undefined : { y: -2, scale: 1.02 },
    whileTap: reduced || disabled ? undefined : { scale: 0.98 },
    transition: transition(reduced ?? false, 0.22)
  }

  const label = busy ? 'Opening Stripe…' : children

  if (href && !disabled) {
    return (
      <motion.a href={href} className={className} {...motionProps}>
        <span className="pricing-cta-shine" aria-hidden />
        <span className="relative z-10">{label}</span>
      </motion.a>
    )
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...motionProps}
    >
      <span className="pricing-cta-shine" aria-hidden />
      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}
