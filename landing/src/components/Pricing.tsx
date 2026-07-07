import { Check } from 'lucide-react'
import { PRICING_TIERS, SITE } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function Pricing(): React.JSX.Element {
  return (
    <section id="pricing" className="relative bg-surface/50 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={[
                'relative flex flex-col rounded-2xl border p-6 lg:p-8',
                tier.highlight
                  ? 'border-accent/50 bg-elevated shadow-[0_4px_30px_rgba(56,189,248,0.15)]'
                  : 'border-border bg-surface/80'
              ].join(' ')}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bg">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted">{tier.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={
                  tier.id === 'free'
                    ? SITE.downloadUrl
                    : `/pricing${tier.id === 'pro' ? '?tier=pro' : tier.id === 'elite' ? '?tier=elite' : ''}`
                }
                className={[
                  'mt-8 block rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-all',
                  tier.highlight
                    ? 'wave-button bg-gradient-to-r from-accent to-accent-dim text-bg shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:scale-[1.02]'
                    : 'border border-border bg-elevated text-text hover:border-accent/40'
                ].join(' ')}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-12 text-center">
          <p className="text-sm text-muted">
            <span className="font-semibold text-text">Mods are free, always.</span> Paid tiers only
            unlock launcher convenience — never the mods themselves.
          </p>
        </ScrollReveal>
      </div>
      <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
