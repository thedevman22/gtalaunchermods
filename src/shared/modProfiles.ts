import type { SubscriptionTier } from './profile'
import { hasTier } from './profile'

export interface ModProfileManifest {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  modIds: string[]
}

export interface ModProfileSummary {
  id: string
  name: string
  modCount: number
  createdAt: string
  updatedAt: string
}

export interface ModProfileLimits {
  tier: SubscriptionTier
  maxProfiles: number
  maxModsPerProfile: number
  autoCatalogInstall: boolean
  profileCount: number
  canCreateProfile: boolean
}

export function getProfileLimitsForTier(tier: SubscriptionTier, profileCount: number): ModProfileLimits {
  const premium = hasTier(tier, 'pro')
  const maxProfiles = premium ? 999 : 1
  const maxModsPerProfile = premium ? 999 : 3

  return {
    tier,
    maxProfiles,
    maxModsPerProfile,
    autoCatalogInstall: premium,
    profileCount,
    canCreateProfile: profileCount < maxProfiles
  }
}
