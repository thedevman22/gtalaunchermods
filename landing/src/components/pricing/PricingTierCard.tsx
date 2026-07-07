'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PricingTier } from '@/lib/constants'
import { SITE } from '@/lib/constants'
import type { BillingInterval } from '@/lib/pricing'
import {
  pricingCheckoutPath,
  tierAmount,
  tierPeriod,
  yearlySavingsPercent
} from '@/lib/pricing'
import AnimatedPrice from '@/components/pricing/AnimatedPrice'
import AnimatedCheck from '@/components/pricing/AnimatedCheck'
import PricingCta from '@/components/pricing/PricingCta'
import { staggerItem, transition } from '@/lib/motion'

type PricingTierCardProps = {
  tier: PricingTier
  interval: BillingInterval
  checkoutBusy?: 'pro' | 'elite' | null
  sessionReady?: boolean
  hasSession?: boolean
  onCheckout?: (tier: 'pro' | 'elite', interval: BillingInterval) => void
}

export default function PricingTierCard({
  tier,
  interval,
  checkoutBusy,
  sessionReady = true,
  hasSession = false,
  onCheckout
}: PricingTierCardProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const isPaid = tier.id === 'pro' || tier.id === 'elite'
  const amount = tierAmount(tier.id, interval)
  const period = tierPeriod(tier.id, interval)
  const savings =
    tier.id === 'pro' || tier.id === 'elite' ? yearlySavingsPercent(tier.id) : 0
  const checkoutPath =
    tier.id === 'pro' || tier.id === 'elite'
      ? pricingCheckoutPath(tier.id, interval)
      : SITE.downloadUrl

  const hoverMotion = reduced
    ? undefined
    : {
        y: tier.highlight ? -10 : -6,
        boxShadow: tier.highlight
          ? '0 28px 60px rgba(56,189,248,0.18), 0 12px 32px rgba(0,0,0,0.35)'
          : '0 20px 48px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.2)'
      }

  const cta =
    tier.id === 'free' ? (
      <PricingCta highlight={tier.highlight} href={SITE.downloadUrl}>
        Download Free
      </PricingCta>
    ) : onCheckout ? (
      tier.id === 'pro' || tier.id === 'elite' ? (
        (() => {
          const paidTier = tier.id
          return hasSession ? (
            <PricingCta
              highlight={tier.highlight}
              disabled={checkoutBusy !== null}
              busy={checkoutBusy === paidTier}
              onClick={() => onCheckout(paidTier, interval)}
            >
              {tier.cta}
            </PricingCta>
          ) : sessionReady ? (
            <PricingCta
              highlight={tier.highlight}
              href={`/sign-in?redirect=${encodeURIComponent(checkoutPath)}`}
            >
              Sign in to upgrade
            </PricingCta>
          ) : (
            <PricingCta highlight={tier.highlight} disabled>
              {tier.cta}
            </PricingCta>
          )
        })()
      ) : null
    ) : (
      <PricingCta highlight={tier.highlight} href={checkoutPath}>
        {tier.cta}
      </PricingCta>
    )

  const cardBody = (
    <>
      {tier.highlight ? (
        <motion.span
          className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-accent px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-bg shadow-[0_4px_20px_rgba(56,189,248,0.4)]"
          animate={
            reduced
              ? undefined
              : {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 4px 20px rgba(56,189,248,0.35)',
                    '0 6px 28px rgba(56,189,248,0.5)',
                    '0 4px 20px rgba(56,189,248,0.35)'
                  ]
                }
          }
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Most Popular
        </motion.span>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <h3
          className={[
            'font-display text-lg font-bold',
            tier.id === 'pro' && 'text-pro',
            tier.id === 'elite' && 'text-elite'
          ].join(' ')}
        >
          {tier.name}
        </h3>
        <AnimatePresence>
          {interval === 'yearly' && isPaid ? (
            <motion.span
              initial={reduced ? false : { opacity: 0, scale: 0.85, x: 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.85, x: 6 }}
              transition={transition(reduced ?? false, 0.26)}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400"
            >
              Save {savings}%
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatedPrice
        amount={amount}
        period={period}
        animateKey={`${tier.id}-${interval}`}
        className="mt-3"
      />

      <p className="mt-3 text-sm text-muted">{tier.description}</p>

      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
        }}
        className="mt-6 flex-1 space-y-3"
      >
        {tier.features.map((feature) => (
          <motion.li
            key={feature}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: {
                opacity: 1,
                x: 0,
                transition: transition(reduced ?? false, 0.28)
              }
            }}
            className="flex items-start gap-2.5 text-sm"
          >
            <AnimatedCheck />
            <span className="text-muted">{feature}</span>
          </motion.li>
        ))}
      </motion.ul>

      {cta}
    </>
  )

  if (tier.highlight) {
    return (
      <motion.article
        variants={staggerItem}
        whileHover={hoverMotion}
        transition={transition(reduced ?? false, 0.28)}
        className="relative h-full lg:-mt-3 lg:scale-[1.04]"
        style={{ zIndex: 10 }}
      >
        <div className="pricing-gradient-border relative h-full rounded-2xl p-[1.5px]">
          <div className="pricing-gradient-border-glow" aria-hidden />
          <div className="relative flex h-full min-h-full flex-col rounded-[calc(1rem-1.5px)] bg-elevated p-6 lg:p-8">
            {cardBody}
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      variants={staggerItem}
      whileHover={hoverMotion}
      transition={transition(reduced ?? false, 0.28)}
      className="relative flex h-full flex-col rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] lg:p-8"
    >
      {cardBody}
    </motion.article>
  )
}
