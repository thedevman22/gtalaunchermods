'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createCheckoutSession } from '@/lib/billing'
import { PRICING_TIERS, SITE } from '@/lib/constants'
import { getSupabaseClient } from '@/lib/supabase'
import ScrollReveal from '@/components/ScrollReveal'
import Link from 'next/link'

function parseDesktopSessionFromHash(): {
  access_token: string
  refresh_token: string
  expires_at?: string
  tier?: 'pro' | 'elite'
} | null {
  if (typeof window === 'undefined') return null

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (!access_token || !refresh_token) return null

  const tierParam = params.get('tier')
  const tier = tierParam === 'elite' ? 'elite' : tierParam === 'pro' ? 'pro' : undefined

  return {
    access_token,
    refresh_token,
    expires_at: params.get('expires_at') ?? undefined,
    tier
  }
}

async function startCheckout(
  accessToken: string,
  tier: 'pro' | 'elite',
  onError: (message: string) => void,
  onBusy: (tier: 'pro' | 'elite' | null) => void
): Promise<void> {
  onBusy(tier)
  try {
    const checkoutUrl = await createCheckoutSession(accessToken, tier)
    window.location.href = checkoutUrl
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Checkout failed.')
    onBusy(null)
  }
}

export default function PricingCheckout(): React.JSX.Element {
  const { session, loading, authError } = useAuth()
  const searchParams = useSearchParams()
  const [sessionReady, setSessionReady] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState<'pro' | 'elite' | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const checkoutSuccess = searchParams.get('checkout') === 'success'

  useEffect(() => {
    let cancelled = false

    const bootstrap = async (): Promise<void> => {
      const client = getSupabaseClient()
      if (!client) {
        return
      }

      const desktopSession = parseDesktopSessionFromHash()
      if (!desktopSession) {
        return
      }

      try {
        await client.auth.setSession({
          access_token: desktopSession.access_token,
          refresh_token: desktopSession.refresh_token
        })
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)

        if (desktopSession.tier && !cancelled) {
          const { data } = await client.auth.getSession()
          if (data.session?.access_token) {
            await startCheckout(
              data.session.access_token,
              desktopSession.tier,
              (message) => {
                if (!cancelled) setCheckoutError(message)
              },
              (tier) => {
                if (!cancelled) setCheckoutBusy(tier)
              }
            )
          }
        }
      } catch {
        // Session handoff failed — user can still sign in manually.
      }
    }

    void bootstrap().finally(() => {
      if (!cancelled) {
        setSessionReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleCheckout = useCallback(
    async (tier: 'pro' | 'elite'): Promise<void> => {
      if (!session?.access_token) {
        setCheckoutError('Sign in to continue to checkout.')
        return
      }

      setCheckoutError(null)
      await startCheckout(session.access_token, tier, setCheckoutError, setCheckoutBusy)
    },
    [session]
  )

  return (
    <section className="border-t border-border/60 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Pricing</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Upgrade your ModHarbor experience
          </h1>
          <p className="mt-4 text-muted">
            Pay for launcher convenience — mods stay free. Checkout is powered by Stripe; your desktop app
            updates automatically when payment completes.
          </p>
        </ScrollReveal>

        {checkoutSuccess ? (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-accent/40 bg-accent/10 px-6 py-4 text-center text-sm text-accent">
            Payment successful. Return to ModHarbor — your tier will unlock shortly.
          </div>
        ) : null}

        {(authError || checkoutError) && (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-sm text-red-300">
            {checkoutError ?? authError}
          </div>
        )}

        {!session && sessionReady && !loading ? (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-border bg-surface/50 px-6 py-5 text-center">
            <p className="text-sm text-muted">Sign in with the same account you use in the desktop app.</p>
            <Link
              href="/sign-in?redirect=/pricing"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-accent to-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-bg"
            >
              Sign in to upgrade
            </Link>
          </div>
        ) : null}

        <ScrollReveal delay={0.06} className="mt-16 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={[
                'relative flex flex-col rounded-2xl border p-6 lg:p-8',
                tier.highlight
                  ? 'border-accent/50 bg-accent/5 shadow-[0_4px_30px_rgba(56,189,248,0.15)]'
                  : 'border-border bg-surface/40'
              ].join(' ')}
            >
              {tier.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bg">
                  Most popular
                </span>
              ) : null}
              <h2
                className={[
                  'font-display text-lg font-bold',
                  tier.id === 'pro' && 'text-pro',
                  tier.id === 'elite' && 'text-elite'
                ].join(' ')}
              >
                {tier.name}
              </h2>
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

              {tier.id === 'free' ? (
                <a
                  href={SITE.downloadUrl}
                  className="mt-8 block rounded-xl border border-border bg-elevated py-3 text-center text-xs font-bold uppercase tracking-wider text-text transition-all hover:border-accent/40"
                >
                  {tier.cta}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={!session || checkoutBusy !== null}
                  onClick={() => void handleCheckout(tier.id as 'pro' | 'elite')}
                  className={[
                    'mt-8 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50',
                    tier.highlight
                      ? 'wave-button bg-gradient-to-r from-accent to-accent-dim text-bg shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:scale-[1.02]'
                      : 'border border-border bg-elevated text-text hover:border-accent/40'
                  ].join(' ')}
                >
                  {checkoutBusy === tier.id ? 'Opening Stripe…' : tier.cta}
                </button>
              )}
            </article>
          ))}
        </ScrollReveal>
      </div>
    </section>
  )
}
