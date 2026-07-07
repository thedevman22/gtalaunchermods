import type { SubscriptionTier } from '../../../shared/profile'

const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL ?? 'http://localhost:4242'

export interface CheckoutSessionResponse {
  url: string
}

export async function createCheckoutSession(
  accessToken: string,
  tier: 'pro' | 'elite'
): Promise<string> {
  const response = await fetch(`${BILLING_API_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ tier })
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
  refreshProfile: () => Promise<{ subscription_tier: SubscriptionTier } | null>,
  targetTier: SubscriptionTier,
  options?: { intervalMs?: number; timeoutMs?: number }
): Promise<boolean> {
  const intervalMs = options?.intervalMs ?? 2000
  const timeoutMs = options?.timeoutMs ?? 120_000
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const profile = await refreshProfile()
    if (profile && profile.subscription_tier === targetTier) {
      return true
    }
    if (profile && targetTier === 'pro' && profile.subscription_tier === 'elite') {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  return false
}
