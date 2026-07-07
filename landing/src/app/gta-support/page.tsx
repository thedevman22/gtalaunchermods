import { Check } from 'lucide-react'
import GameCover from '@/components/GameCover'
import PageShell from '@/components/PageShell'
import ScrollReveal from '@/components/ScrollReveal'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `GTA Support — ${SITE.name}`,
  description: `${SITE.name} supports GTA V today, with GTA VI support planned after release.`
}

export default function GtaSupportPage(): React.JSX.Element {
  return (
    <PageShell
      eyebrow="GTA support"
      title="One game at a time, done properly"
      intro="ModHarbor isn't a general-purpose mod manager. It's built around how Grand Theft Auto installs, mods, and launches."
    >
      <div className="mx-auto max-w-4xl space-y-10">
        <ScrollReveal className="relative overflow-hidden rounded-2xl border border-accent/30 bg-surface">
          <div className="relative h-48 sm:h-56">
            <GameCover gameId="gta5" alt="Grand Theft Auto V" />
          </div>
          <div className="relative p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Supported Now
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold">Grand Theft Auto V</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Full support today, for both the Legacy and Enhanced editions across Steam, Epic
            Games, and Rockstar Games Launcher installs.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Auto-detects your install path from Steam libraries, Epic manifests, and Rockstar folders',
              'Edition-aware validation, so the launcher always targets the right GTA5.exe',
              'Script Hook V and ASI loader checks built into first-run setup',
              'Every launch is offline story mode via -scOfflineOnly — GTA Online is never touched'
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal className="overflow-hidden rounded-2xl border border-border/70 bg-surface/60">
          <div className="relative h-48 sm:h-56">
            <GameCover gameId="gta6" alt="Grand Theft Auto VI" locked />
          </div>
          <div className="p-8">
          <span className="rounded-full border border-border bg-elevated px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Coming Soon
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold">Grand Theft Auto VI</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Support is planned after the game releases and a stable single-player modding scene
            forms around it. We&apos;ll follow the same principles: story mode only, clean profile
            deployment, and free mods. Join{' '}
            <a
              href={SITE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Discord
            </a>{' '}
            for updates — there is no ETA yet.
          </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="rounded-2xl border border-border bg-surface/60 p-8">
          <h2 className="font-display text-xl font-bold">Why GTA specifically?</h2>
          <p className="mt-3 leading-relaxed text-muted">
            GTA modding has sharp edges: two game editions with different executables, three
            storefronts with different install layouts, framework dependencies like Script Hook V,
            and a hard line between single-player modding and GTA Online. A generic mod manager
            treats those as your problem. {SITE.name} treats them as the product — every feature,
            from onboarding to the launch button, exists to make story-mode modding safe and
            repeatable for this specific game.
          </p>
        </ScrollReveal>
      </div>
    </PageShell>
  )
}
