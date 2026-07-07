import type { RealtimeChannel } from '@supabase/supabase-js'
import type { SubscriptionTier, UserProfile } from '../../../shared/profile'
import { billingApiUrl, supabase, websiteUrl } from '@renderer/lib/supabase'

const BILLING_API_URL = billingApiUrl || 'http://localhost:4242'
const WEBSITE_URL = websiteUrl || 'http://localhost:3000'

export { WEBSITE_URL }

export interface CheckoutSessionResponse {
  url: string
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2
}

export async function createCheckoutSession(
  accessToken: string,
  tier: 'pro' | 'elite',
  interval: 'monthly' | 'yearly' = 'monthly'
): Promise<string> {
  const response = await fetch(`${BILLING_API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ tier, interval })
  })

  const payload = (await response.json()) as { url?: string; error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to create checkout session.')
  }

  if (!payload.url) {
    throw new Error('Billing server did not return a checkout URL.')
  }

  return payload.url
}

export async function waitForTierUpgrade(
  refreshProfile: () => Promise<UserProfile | null>,
  previousTier: SubscriptionTier,
  options?: { intervalMs?: number; timeoutMs?: number }
): Promise<SubscriptionTier | null> {
  const intervalMs = options?.intervalMs ?? 10_000
  const timeoutMs = options?.timeoutMs ?? 600_000
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const profile = await refreshProfile()
    if (profile && TIER_RANK[profile.subscription_tier] > TIER_RANK[previousTier]) {
      return profile.subscription_tier
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  return null
}

export interface TierUpgradeWatcher {
  stop: () => void
}

export function watchForTierUpgrade(
  userId: string,
  previousTier: SubscriptionTier,
  onUpgrade: (newTier: SubscriptionTier) => void,
  refreshProfile: () => Promise<UserProfile | null>,
  options?: { pollIntervalMs?: number }
): TierUpgradeWatcher {
  const pollIntervalMs = options?.pollIntervalMs ?? 10_000
  let stopped = false
  let channel: RealtimeChannel | null = null

  const checkTier = (tier: SubscriptionTier): void => {
    if (stopped) return
    if (TIER_RANK[tier] > TIER_RANK[previousTier]) {
      onUpgrade(tier)
      stop()
    }
  }

  if (supabase) {
    channel = supabase
      .channel(`profile-tier-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const nextTier = (payload.new as { subscription_tier?: SubscriptionTier }).subscription_tier
          if (nextTier) {
            checkTier(nextTier)
          }
        }
      )
      .subscribe()
  }

  const poll = async (): Promise<void> => {
    while (!stopped) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      if (stopped) break
      const profile = await refreshProfile()
      if (profile) {
        checkTier(profile.subscription_tier)
      }
    }
  }

  void poll()

  const stop = (): void => {
    stopped = true
    if (channel) {
      void supabase?.removeChannel(channel)
      channel = null
    }
  }

  return { stop }
}
