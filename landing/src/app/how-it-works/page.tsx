import AppScreenMockup from '@/components/AppScreenMockup'
import PageShell from '@/components/PageShell'
import ScrollReveal from '@/components/ScrollReveal'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `How It Works — ${SITE.name}`,
  description: `Step-by-step guide to modding GTA V story mode with ${SITE.name}.`
}

const STEPS: {
  title: string
  body: string
  mockup?: 'profiles' | 'catalog' | 'launch'
}[] = [
  {
    title: 'Download and install',
    body: 'Grab the free Windows installer, run it, and sign in or create a free account. Setup takes about a minute.'
  },
  {
    title: 'Locate your GTA V install',
    body: 'ModHarbor auto-detects Steam, Epic, and Rockstar installs for both Legacy and Enhanced editions — or browse to GTA5.exe manually. You can also skip this and do it later from the dashboard.'
  },
  {
    title: 'Build a mod profile',
    body: 'Create named loadouts like “Realistic Graphics” or “Chaos Mode.” Each profile keeps its own mod list, so you can switch between setups without reinstalling anything.',
    mockup: 'profiles'
  },
  {
    title: 'Add mods',
    body: 'Browse the built-in catalog or drag and drop .zip archives. Mods live in an isolated launcher library — never mixed into your game folder until you launch.',
    mockup: 'catalog'
  },
  {
    title: 'Launch story mode',
    body: 'One click cleanly removes the previous profile’s files, deploys your selected profile, and starts GTA V offline with -scOfflineOnly. Story mode only, every time.',
    mockup: 'launch'
  }
]

export default function HowItWorksPage(): React.JSX.Element {
  return (
    <PageShell
      eyebrow="How it works"
      title="From download to modded story mode"
      intro="Five steps, no manual file juggling. Here's the full flow inside the app."
    >
      <div className="mx-auto max-w-4xl space-y-14">
        {STEPS.map((step, index) => (
          <ScrollReveal
            key={step.title}
            className={
              step.mockup
                ? 'grid items-center gap-8 lg:grid-cols-2'
                : 'mx-auto max-w-2xl'
            }
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <h2 className="font-display text-xl font-bold">{step.title}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-muted lg:pl-12">{step.body}</p>
            </div>
            {step.mockup ? (
              <AppScreenMockup screen={step.mockup} className={index % 2 === 0 ? 'lg:order-first' : ''} />
            ) : null}
          </ScrollReveal>
        ))}

        <ScrollReveal className="rounded-2xl border border-accent/25 bg-accent/5 p-8 text-center">
          <h2 className="font-display text-xl font-bold">Ready to try it?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {SITE.name} is free, and mods are free forever. Paid tiers only add convenience
            features like one-click catalog installs.
          </p>
          <a
            href={SITE.downloadUrl}
            className="wave-button mt-6 inline-flex rounded-xl bg-gradient-to-r from-accent to-accent-dim px-8 py-3 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_4px_20px_rgba(56,189,248,0.3)] transition-transform hover:scale-[1.02]"
          >
            Download for Windows
          </a>
        </ScrollReveal>
      </div>
    </PageShell>
  )
}
