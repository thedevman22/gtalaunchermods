import type { SubscriptionTier } from '../../../shared/profile'
import { tierBadgeLabel } from '../../../shared/profile'

interface UpgradePromptProps {
  feature: string
  requiredTier?: SubscriptionTier
  onUpgrade?: () => void
  compact?: boolean
}

export default function UpgradePrompt({
  feature,
  requiredTier = 'pro',
  onUpgrade,
  compact = false
}: UpgradePromptProps): React.JSX.Element {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      ].join(' ')}
    >
      <span className={compact ? 'text-base' : 'text-xl'} aria-hidden>
        🔒
      </span>
      <div className="min-w-0 flex-1">
        <p className={compact ? 'text-xs font-semibold text-launcher-text' : 'text-sm font-semibold text-launcher-text'}>
          {feature}
        </p>
        <p className="text-[10px] text-launcher-muted">
          Requires {tierBadgeLabel(requiredTier)} or higher
        </p>
      </div>
      {onUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500/20"
        >
          Upgrade
        </button>
      )}
    </div>
  )
}
