import type { SubscriptionTier } from '../../../shared/profile'
import { tierBadgeLabel } from '../../../shared/profile'

interface TierBadgeProps {
  tier: SubscriptionTier
  label?: string
  size?: 'sm' | 'md'
}

const TIER_STYLES: Record<SubscriptionTier, string> = {
  free: 'border-zinc-500/40 bg-zinc-500/15 text-zinc-300',
  pro: 'border-blue-400/50 bg-blue-500/15 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
  elite:
    'border-amber-400/50 bg-amber-500/15 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
}

export default function TierBadge({
  tier,
  label,
  size = 'md'
}: TierBadgeProps): React.JSX.Element {
  const displayLabel = label ?? tierBadgeLabel(tier)

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-bold uppercase tracking-wider',
        TIER_STYLES[tier],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      ].join(' ')}
    >
      {displayLabel}
    </span>
  )
}
