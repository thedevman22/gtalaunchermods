'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { PRICING_TIERS } from '@/lib/constants'
import type { BillingInterval } from '@/lib/pricing'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import BillingToggle from '@/components/pricing/BillingToggle'
import PricingTierCard from '@/components/pricing/PricingTierCard'
import PricingFaq from '@/components/pricing/PricingFaq'
import { staggerContainer } from '@/lib/motion'

type PricingSectionProps = {
  /** Homepage embed vs full checkout page */
  variant?: 'home' | 'page'
  showWave?: boolean
  checkoutBusy?: 'pro' | 'elite' | null
  sessionReady?: boolean
  hasSession?: boolean
  initialInterval?: BillingInterval
  onCheckout?: (tier: 'pro' | 'elite', interval: BillingInterval) => void
  header?: React.ReactNode
  alerts?: React.ReactNode
}

export default function PricingSection({
  variant = 'home',
  showWave = true,
  checkoutBusy = null,
  sessionReady = true,
  hasSession = false,
  initialInterval = 'monthly',
  onCheckout,
  header,
  alerts
}: PricingSectionProps): React.JSX.Element {
  const [interval, setInterval] = useState<BillingInterval>(initialInterval)

  const handleIntervalChange = useCallback((next: BillingInterval) => {
    setInterval(next)
  }, [])

  const isHome = variant === 'home'

  return (
    <section
      id="pricing"
      className={[
        'relative px-4 sm:px-6',
        isHome ? 'bg-surface/50 py-24 lg:py-32' : 'border-t border-border/60 py-20 lg:py-28'
      ].join(' ')}
    >
      <div className="mx-auto max-w-6xl">
        {header ?? (
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            {isHome ? (
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Simple pricing,{' '}
                <span className="bg-gradient-to-r from-accent to-cyan-300 bg-clip-text text-transparent">
                  free mods forever
                </span>
              </h2>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Pricing
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Upgrade your ModHarbor experience
                </h1>
              </>
            )}
            <p className="mt-4 text-muted">
              {isHome
                ? 'Pay for launcher convenience — every mod stays free. Cancel anytime.'
                : 'Pay for launcher convenience — mods stay free. Checkout is powered by Stripe; your desktop app updates automatically when payment completes.'}
            </p>
          </ScrollReveal>
        )}

        {alerts}

        <ScrollReveal delay={0.05} className="mt-10 flex justify-center">
          <BillingToggle value={interval} onChange={handleIntervalChange} />
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-12 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-5 lg:pt-2"
        >
          {PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.id}
              tier={tier}
              interval={interval}
              checkoutBusy={checkoutBusy}
              sessionReady={sessionReady}
              hasSession={hasSession}
              onCheckout={onCheckout}
            />
          ))}
        </motion.div>

        <ScrollReveal delay={0.08} className="mt-10 text-center">
          <p className="text-sm text-muted">
            <span className="font-semibold text-text">Mods are free, always.</span> Paid tiers only
            unlock launcher convenience — never the mods themselves.
          </p>
        </ScrollReveal>

        <PricingFaq />
      </div>

      {showWave ? (
        <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
      ) : null}
    </section>
  )
}
