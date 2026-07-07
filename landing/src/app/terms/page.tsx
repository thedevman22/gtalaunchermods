import Link from 'next/link'
import PageShell from '@/components/PageShell'
import { SITE } from '@/lib/constants'

export const metadata = {
  title: `Terms of Service — ${SITE.name}`,
  description: `Terms of Service for ${SITE.name}.`
}

export default function TermsPage(): React.JSX.Element {
  return (
    <PageShell eyebrow="Legal" title="Terms of Service">
      <article className="mx-auto max-w-3xl space-y-8 text-muted">
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
            We grant you a personal, non-exclusive, non-transferable license to use the launcher
            for managing Grand Theft Auto V single-player mods. You must own a legitimate copy of
            GTA V.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">3. Mods are free — no paywalls</h2>
          <p>
            {SITE.name} never charges for mods, locks mod downloads behind a subscription, or takes
            a cut from mod creators. All payments are for launcher convenience features only (such
            as one-click catalog installs and unlimited profiles). Mods remain free third-party
            content from their respective creators. See our{' '}
            <Link href={SITE.legalUrl} className="text-accent hover:underline">
              Safety &amp; Fair Play
            </Link>{' '}
            page for more.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">4. Subscriptions, billing & cancellation</h2>
          <p>
            Pro and Elite subscriptions are billed monthly through Stripe, our payment processor.
            We never see or store your card details. You can cancel at any time from your account;
            cancellation stops future billing and your paid features remain active until the end of
            the current billing period. Refunds are handled per our billing policy and applicable
            consumer law. Prices may change with advance notice — changes never apply retroactively
            to an active billing period.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">5. Story mode only</h2>
          <p>
            The launcher is designed for offline single-player play and always launches GTA V in
            story mode. Using mods in GTA Online may violate Rockstar&apos;s terms and result in
            account action; {SITE.name} does not support or enable online modding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">6. Third-party mods</h2>
          <p>
            {SITE.name} does not create or distribute mods and is not responsible for third-party
            content. You are solely responsible for the mods you install. Mods may affect game
            stability or save data — back up your saves.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">7. Disclaimer of warranty</h2>
          <p>
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
            WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. TO THE MAXIMUM EXTENT PERMITTED
            BY LAW, WE ARE NOT LIABLE FOR DAMAGES ARISING FROM USE OF THE SOFTWARE OR THIRD-PARTY
            MODS.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">8. Account termination for abuse</h2>
          <p>
            We may suspend or terminate accounts that abuse the service — including payment fraud,
            attempts to use the launcher to enable online modding or cheating, harassment of other
            users or creators, redistributing paid features, or attacking our infrastructure. Where
            reasonable, we&apos;ll warn you first. Termination for abuse does not entitle you to a
            refund of the current billing period.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">9. Not affiliated with Rockstar</h2>
          <p>
            {SITE.name} is not affiliated with, endorsed by, or sponsored by Rockstar Games or
            Take-Two Interactive. GTA V is a trademark of its respective owner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text">10. Contact</h2>
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
    </PageShell>
  )
}
