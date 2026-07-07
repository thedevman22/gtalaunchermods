import { ShieldCheck } from 'lucide-react'
import PageShell from '@/components/PageShell'
import ScrollReveal from '@/components/ScrollReveal'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `Safety & Fair Play — ${SITE.name}`,
  description: `${SITE.name}'s commitments on story-mode-only modding, third-party content, and fair play.`
}

const COMMITMENTS = [
  {
    title: 'Story mode only, by design',
    body: `${SITE.name} launches GTA V exclusively in offline story mode using Rockstar's -scOfflineOnly flag. It never launches, connects to, or modifies GTA Online, and there is no setting that changes this. Keeping single-player modding separate from online play is the foundation of the product.`
  },
  {
    title: 'Not affiliated with Rockstar Games',
    body: `${SITE.name} is an independent tool. It is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA are trademarks of their respective owners, used here only to describe compatibility.`
  },
  {
    title: 'On single-player modding',
    body: 'Rockstar has publicly stated that it generally does not take action against players for single-player modding, while reserving its rights regarding online services and infringing content. We do not claim that modding is authorized by Rockstar\u2019s terms — we build for the single-player use Rockstar has said it tolerates, and we stay away from everything else.'
  },
  {
    title: 'Mods are third-party content',
    body: `All mods are created by and belong to their respective creators. ${SITE.name} does not make, own, or sell mods — they are provided free, and our paid tiers only unlock launcher convenience features. Credit and control always stay with the creator.`
  },
  {
    title: 'Creators can request removal any time',
    body: `If you created a mod listed in our catalog and want it removed or credited differently, contact us and we'll act promptly — no process to fight through, no questions about why.`
  },
  {
    title: 'Users mod at their own discretion',
    body: 'Installing mods is your choice and your responsibility. Mods can affect game stability or save files, so back up your saves and only install content you trust.'
  }
]

export default function LegalPage(): React.JSX.Element {
  return (
    <PageShell
      eyebrow="Safety & Fair Play"
      title="Where we stand"
      intro="Plain-language commitments about how ModHarbor works and what it will never do."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {COMMITMENTS.map((item, index) => (
          <ScrollReveal
            key={item.title}
            delay={Math.min(index * 0.03, 0.12)}
            className="rounded-2xl border border-border bg-surface/60 p-6 sm:p-8"
          >
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShieldCheck className="h-5 w-5 shrink-0 text-accent" strokeWidth={2} aria-hidden />
              {item.title}
            </h2>
            <p className="mt-3 leading-relaxed text-muted">{item.body}</p>
          </ScrollReveal>
        ))}

        <ScrollReveal className="rounded-2xl border border-accent/25 bg-accent/5 p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold">Takedown contact</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Creators and rights holders can request removal of content at any time by emailing{' '}
            <a href={`mailto:${SITE.takedownEmail}`} className="text-accent hover:underline">
              {SITE.takedownEmail}
            </a>{' '}
            or messaging the moderators on our{' '}
            <a
              href={SITE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Discord
            </a>
            . Include a link or description of the content and proof of ownership, and we&apos;ll
            handle it promptly.
          </p>
        </ScrollReveal>
      </div>
    </PageShell>
  )
}
