import { Lock } from 'lucide-react'
import type { SubscriptionTier } from '../../../shared/profile'
import { tierBadgeLabel } from '../../../shared/profile'
import { useAuth } from '@renderer/context/AuthContext'
import { useUpgradeFlow } from '@renderer/context/UpgradeFlowContext'

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
  const { startUpgrade } = useUpgradeFlow()
  const { isGuest, openAuthModal } = useAuth()
  const handleUpgrade = onUpgrade ?? (() => startUpgrade(requiredTier === 'elite' ? 'elite' : 'pro'))

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      ].join(' ')}
    >
      <Lock
        className={compact ? 'h-4 w-4 shrink-0 text-amber-300' : 'h-5 w-5 shrink-0 text-amber-300'}
        strokeWidth={2}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className={compact ? 'text-xs font-semibold text-launcher-text' : 'text-sm font-semibold text-launcher-text'}>
          {feature}
        </p>
        <p className="text-[10px] text-launcher-muted">
          Requires {tierBadgeLabel(requiredTier)} or higher
        </p>
      </div>
      <button
        type="button"
        onClick={isGuest ? openAuthModal : handleUpgrade}
        className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500/20"
      >
        {isGuest ? 'Sign in' : 'Upgrade'}
      </button>
    </div>
  )
}
