import Link from 'next/link'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `Terms of Service — ${SITE.name}`,
  description: `Terms of Service for ${SITE.name}.`
}

export default function TermsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-bg/80 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-bold text-accent hover:underline">
            ← Back to {SITE.name}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-muted sm:px-6">
        <h1 className="text-3xl font-bold text-text">Terms of Service</h1>
        <p>
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">1. Acceptance</h2>
          <p>
            By downloading or using {SITE.name}, you agree to these Terms. If you do not agree, do
            not use the software.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">2. Software license</h2>
          <p>
            We grant you a personal, non-exclusive license to use the launcher for managing Grand
            Theft Auto V single-player mods. You must own a legitimate copy of GTA V.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">3. Mods & third-party content</h2>
          <p>
            {SITE.name} does not distribute mods. You are solely responsible for mods you install.
            Mods may affect game stability or save data. We are not liable for damages arising from
            third-party mod use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">4. Story mode only</h2>
          <p>
            The launcher is designed for offline story-mode play. Using mods in GTA Online may
            violate Rockstar&apos;s terms and result in account action. We do not support or
            encourage online modding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">5. Subscriptions</h2>
          <p>
            Pro and Elite subscriptions bill through Stripe and unlock launcher features only — never
            mod access. Refunds are handled per our billing policy and applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">6. Disclaimer</h2>
          <p>
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY. {SITE.name} is not
            affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">7. Contact</h2>
          <p>
            Questions? Join our{' '}
            <a
              href={SITE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Discord
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  )
}
