import { COMPARISON_ROWS, PRICING_TIERS, SITE } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

function Check({ on }: { on: boolean }): React.JSX.Element {
  return on ? (
    <span className="text-accent" aria-label="Included">
      ✓
    </span>
  ) : (
    <span className="text-border" aria-label="Not included">
      —
    </span>
  )
}

export default function Pricing(): React.JSX.Element {
  return (
    <section id="pricing" className="relative bg-surface/50 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Launcher tiers, not mod paywalls
          </h2>
          <p className="mt-4 text-muted">
            Pay for convenience features in the launcher. Every mod you download stays free.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mt-16 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={[
                'relative flex flex-col rounded-2xl border p-6 lg:p-8',
                tier.highlight
                  ? 'border-accent/50 bg-white shadow-[0_4px_30px_rgba(43,159,212,0.12)]'
                  : 'border-border bg-surface/80'
              ].join(' ')}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h3
                className={[
                  'font-display text-lg font-bold',
                  tier.id === 'pro' && 'text-pro',
                  tier.id === 'elite' && 'text-elite'
                ].join(' ')}
              >
                {tier.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-accent">✓</span>
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
                    ? 'wave-button bg-gradient-to-r from-accent to-accent-dim text-white shadow-[0_4px_20px_rgba(43,159,212,0.25)] hover:scale-[1.02]'
                    : 'border border-border bg-elevated text-text hover:border-accent/40'
                ].join(' ')}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-16 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-elevated/60">
                  <th className="px-6 py-4 font-semibold text-muted">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Free</th>
                  <th className="px-6 py-4 text-center font-semibold text-pro">Pro</th>
                  <th className="px-6 py-4 text-center font-semibold text-elite">Elite</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-3.5 text-muted">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      <Check on={row.free} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Check on={row.pro} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Check on={row.elite} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
      <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
