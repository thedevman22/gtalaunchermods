import { Check, Minus } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ScrollReveal from '@/components/ScrollReveal'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `Why ${SITE.name} — vs manual modding & other managers`,
  description: `How ${SITE.name} compares to manual GTA V modding and generic mod managers.`
}

type Support = boolean | 'partial'

const COMPARISON: { feature: string; manual: Support; managers: Support; modharbor: Support }[] = [
  { feature: 'Mod profiles (switchable loadouts)', manual: false, managers: 'partial', modharbor: true },
  { feature: 'Story-mode-only safety (-scOfflineOnly)', manual: false, managers: false, modharbor: true },
  { feature: 'One-click catalog installs', manual: false, managers: 'partial', modharbor: true },
  { feature: 'Clean undeploy before every switch', manual: false, managers: 'partial', modharbor: true },
  { feature: 'Auto-detect Steam / Epic / Rockstar installs', manual: false, managers: 'partial', modharbor: true },
  { feature: 'Automatic app updates', manual: false, managers: 'partial', modharbor: true }
]

function Cell({ value }: { value: Support }): React.JSX.Element {
  if (value === true) {
    return (
      <span className="inline-flex" aria-label="Yes">
        <Check className="h-4 w-4 text-accent" strokeWidth={2.5} aria-hidden />
      </span>
    )
  }
  if (value === 'partial') {
    return (
      <span className="text-sm text-muted" aria-label="Sometimes">
        Varies
      </span>
    )
  }
  return (
    <span className="inline-flex" aria-label="No">
      <Minus className="h-4 w-4 text-border" strokeWidth={2} aria-hidden />
    </span>
  )
}

export default function WhyModHarborPage(): React.JSX.Element {
  return (
    <PageShell
      eyebrow="Why ModHarbor"
      title="Built for GTA story mode, not adapted to it"
      intro="Manual modding means hand-copying files into your game folder and hoping nothing breaks. Generic mod managers weren't built for GTA. Here's the difference."
    >
      <div className="mx-auto max-w-4xl space-y-14">
        <ScrollReveal className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-elevated/60">
                  <th className="px-6 py-4 font-semibold text-muted">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-muted">
                    Manual modding
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-muted">
                    Other mod managers
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-accent">
                    {SITE.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-3.5 text-muted">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      <Cell value={row.manual} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Cell value={row.managers} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Cell value={row.modharbor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <ScrollReveal className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Profiles, not folders',
              body: 'Manual modding leaves stray files behind when you change setups. ModHarbor tracks every deployed file per mod and removes the old profile completely before applying the next one.'
            },
            {
              title: 'Safety by design',
              body: 'Generic managers launch the game however you configured it. ModHarbor always launches offline story mode — there is no online mode to misconfigure.'
            },
            {
              title: 'GTA-specific setup',
              body: 'Edition-aware path detection, Script Hook V and ASI loader checks built into onboarding — things a general-purpose manager leaves for you to figure out.'
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface/60 p-6">
              <h2 className="font-display font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal className="text-center">
          <a
            href={SITE.downloadUrl}
            className="wave-button inline-flex rounded-xl bg-gradient-to-r from-accent to-accent-dim px-8 py-3 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_4px_20px_rgba(56,189,248,0.3)] transition-transform hover:scale-[1.02]"
          >
            Download for Windows
          </a>
        </ScrollReveal>
      </div>
    </PageShell>
  )
}
