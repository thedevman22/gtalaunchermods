import Link from 'next/link'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: `Privacy Policy for ${SITE.name}.`
}

export default function PrivacyPage(): React.JSX.Element {
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
        <h1 className="text-3xl font-bold text-text">Privacy Policy</h1>
        <p>
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">1. What we collect</h2>
          <p>
            If you create an account, we store your email address and subscription tier. The
            launcher stores your mod library, profiles, and preferences locally on your PC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">2. What we don&apos;t collect</h2>
          <p>
            We do not collect gameplay data, track the mods you install, or sell any personal
            information to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">3. Payments</h2>
          <p>
            Subscriptions are processed by Stripe. We never see or store your card details —
            billing information is handled entirely by Stripe under their privacy policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">4. Third-party services</h2>
          <p>
            Authentication and account data are managed through Supabase. App updates are
            downloaded from GitHub Releases. Both services only receive the minimum data required
            to function.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">5. Data deletion</h2>
          <p>
            You can request account deletion at any time via our{' '}
            <a
              href={SITE.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Discord
            </a>
            . Uninstalling the launcher removes all locally stored data.
          </p>
        </section>
      </article>
    </div>
  )
}
