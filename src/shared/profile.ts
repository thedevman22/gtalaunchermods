export type SubscriptionTier = 'free' | 'pro' | 'elite'

export interface UserProfile {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  role_badge: string
  created_at: string
}

export interface OAuthCallbackInfo {
  port: number
  redirectTo: string
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2
}

export function hasTier(userTier: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required]
}

export function isPremiumTier(tier: SubscriptionTier): boolean {
  return hasTier(tier, 'pro')
}

export function tierBadgeLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case 'elite':
      return 'Elite'
    case 'pro':
      return 'Pro'
    default:
      return 'Free'
  }
}

export function tierRoleBadge(tier: SubscriptionTier): string {
  switch (tier) {
    case 'elite':
      return 'Elite Member'
    case 'pro':
      return 'Pro Member'
    default:
      return 'Free Member'
  }
}
