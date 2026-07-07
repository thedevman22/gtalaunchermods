export type BillingInterval = 'monthly' | 'yearly'
export type PaidTierId = 'pro' | 'elite'

export const PRICING_AMOUNTS: Record<
  'free' | PaidTierId,
  { monthly: number; yearly: number }
> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 7, yearly: 70 },
  elite: { monthly: 15, yearly: 150 }
}

export function tierAmount(
  tier: 'free' | PaidTierId,
  interval: BillingInterval
): number {
  return interval === 'yearly' ? PRICING_AMOUNTS[tier].yearly : PRICING_AMOUNTS[tier].monthly
}

export function tierPeriod(tier: 'free' | PaidTierId, interval: BillingInterval): string {
  if (tier === 'free') return 'forever'
  return interval === 'yearly' ? '/year' : '/month'
}

export function yearlySavingsPercent(tier: PaidTierId): number {
  const { monthly, yearly } = PRICING_AMOUNTS[tier]
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
}

export function maxYearlySavingsPercent(): number {
  return Math.max(yearlySavingsPercent('pro'), yearlySavingsPercent('elite'))
}

export function pricingCheckoutPath(
  tier: PaidTierId,
  interval: BillingInterval
): string {
  return `/pricing?tier=${tier}&billing=${interval}`
}
