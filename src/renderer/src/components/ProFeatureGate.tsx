import { useAuth } from '@renderer/context/AuthContext'
import UpgradePrompt from '@renderer/components/UpgradePrompt'
import type { SubscriptionTier } from '../../../shared/profile'

interface ProFeatureGateProps {
  feature: string
  requiredTier?: SubscriptionTier
  onUpgrade?: () => void
  children: React.ReactNode
}

export default function ProFeatureGate({
  feature,
  requiredTier = 'pro',
  onUpgrade,
  children
}: ProFeatureGateProps): React.JSX.Element {
  const { hasTier } = useAuth()

  if (hasTier(requiredTier)) {
    return <>{children}</>
  }

  return <UpgradePrompt feature={feature} requiredTier={requiredTier} onUpgrade={onUpgrade} compact />
}
