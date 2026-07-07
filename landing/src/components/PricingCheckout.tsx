'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createCheckoutSession } from '@/lib/billing'
import type { BillingInterval } from '@/lib/pricing'
import PricingSection from '@/components/pricing/PricingSection'
import { getSupabaseClient } from '@/lib/supabase'

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
  interval: BillingInterval,
  onError: (message: string) => void,
  onBusy: (tier: 'pro' | 'elite' | null) => void
): Promise<void> {
  onBusy(tier)
  try {
    const checkoutUrl = await createCheckoutSession(accessToken, tier, interval)
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
  const initialInterval: BillingInterval =
    searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly'

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
              initialInterval,
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
  }, [initialInterval])

  const handleCheckout = useCallback(
    async (tier: 'pro' | 'elite', interval: BillingInterval): Promise<void> => {
      if (!session?.access_token) {
        setCheckoutError('Sign in to continue to checkout.')
        return
      }

      setCheckoutError(null)
      await startCheckout(session.access_token, tier, interval, setCheckoutError, setCheckoutBusy)
    },
    [session]
  )

  return (
    <PricingSection
      variant="page"
      showWave={false}
      initialInterval={initialInterval}
      checkoutBusy={checkoutBusy}
      sessionReady={sessionReady}
      hasSession={Boolean(session)}
      onCheckout={handleCheckout}
      alerts={
        <>
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
              <p className="text-sm text-muted">
                Sign in with the same account you use in the desktop app.
              </p>
              <Link
                href="/sign-in?redirect=/pricing"
                className="mt-4 inline-block rounded-xl bg-gradient-to-r from-accent to-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-bg"
              >
                Sign in to upgrade
              </Link>
            </div>
          ) : null}
        </>
      }
    />
  )
}
