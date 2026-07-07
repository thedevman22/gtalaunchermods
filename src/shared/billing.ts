import type { Session } from '@supabase/supabase-js'
import type { SubscriptionTier } from './profile'

export const TIER_PERKS: Record<SubscriptionTier, string[]> = {
  free: [
    '1 mod profile with up to 3 mods',
    'Manual drag-and-drop import',
    'Story-mode offline launch'
  ],
  pro: [
    'Unlimited mod profiles',
    'Unlimited mods per profile (stacking)',
    'One-click catalog auto-install',
    'Pro role badge',
    'Priority support'
  ],
  elite: [
    'Everything in Pro',
    'Early access features',
    'Elite gold badge',
    'Dedicated support channel',
    'Vote on roadmap features'
  ]
}

export interface PricingUrlOptions {
  tier?: 'pro' | 'elite'
}

export function buildWebsitePricingUrl(
  websiteBaseUrl: string,
  session: Session,
  options?: PricingUrlOptions
): string {
  const base = websiteBaseUrl.replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('access_token', session.access_token)
  params.set('refresh_token', session.refresh_token)
  params.set('expires_at', String(session.expires_at ?? ''))
  params.set('from', 'desktop')

  if (options?.tier) {
    params.set('tier', options.tier)
  }

  return `${base}/pricing#${params.toString()}`
}
