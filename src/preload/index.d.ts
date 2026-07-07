import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  GamePathCandidate,
  GamePathInfo,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'
import type { ModImportResult, ModListResult } from '../shared/mods'
import type { OAuthCallbackInfo } from '../shared/profile'
import type { CatalogResult } from '../shared/catalog'
import type { SetupStatus, DependencyId } from '../shared/dependencies'
import type { UpdateSettings, UpdateStatusPayload } from '../shared/update'
import type { ModProfileLimits, ModProfileManifest, ModProfileSummary } from '../shared/modProfiles'
import type { GameEdition } from '../shared/games'

export type { LaunchStatus, GamePathSource } from '../shared/game'
export type { ModSummary, ModListResult, ModImportResult } from '../shared/mods'
export type { SubscriptionTier, UserProfile, ThemePreference, OAuthCallbackInfo } from '../shared/profile'
export type { SetupStatus, DependencyId } from '../shared/dependencies'
export type { UpdateStatus, UpdateStatusPayload, UpdateSettings } from '../shared/update'
export type { GameEdition, GameId } from '../shared/games'
export type { ModProfileSummary, ModProfileManifest, ModProfileLimits } from '../shared/modProfiles'
export type { OnboardingState } from '../shared/onboarding'

export interface GameAPI {
  getPath: () => Promise<GamePathInfo>
  detectPaths: (edition?: GameEdition) => Promise<GamePathCandidate[]>
  setPath: (exePath: string) => Promise<OperationResult>
  browsePath: () => Promise<OperationResult>
  launch: () => Promise<OperationResult>
  getStatus: () => Promise<LaunchStatusPayload>
  onStatusChanged: (callback: (payload: LaunchStatusPayload) => void) => () => void
}

export interface ModsAPI {
  getLibraryPath: () => Promise<string>
  list: (gameId?: string) => Promise<ModListResult>
  importMod: (zipPath: string) => Promise<ModImportResult>
  browseImport: () => Promise<ModImportResult>
  enableMod: (modId: string) => Promise<OperationResult>
  disableMod: (modId: string) => Promise<OperationResult>
  deleteMod: (modId: string) => Promise<OperationResult>
  onChanged: (callback: (payload: ModListResult) => void) => () => void
}

export interface AuthAPI {
  startOAuthCallback: () => Promise<OAuthCallbackInfo>
  openExternal: (url: string) => Promise<void>
  onOAuthCallback: (callback: (callbackUrl: string) => void) => () => void
}

export interface SetupAPI {
  getStatus: () => Promise<SetupStatus>
  install: (dependencyId: DependencyId) => Promise<OperationResult>
  installAll: () => Promise<OperationResult>
  onChanged: (callback: (payload: SetupStatus) => void) => () => void
  onOpenChecklist: (callback: () => void) => () => void
}

export interface CatalogAPI {
  getMods: (gameId: string) => Promise<CatalogResult>
  install: (catalogId: string, gameId: string) => Promise<ModImportResult>
  getInstalledMap: (gameId: string) => Promise<Record<string, string>>
  onChanged: (callback: () => void) => () => void
}

export interface UpdateAPI {
  check: () => Promise<OperationResult>
  download: () => Promise<OperationResult>
  install: () => Promise<void>
  getAppVersion: () => Promise<string>
  getSettings: () => Promise<UpdateSettings>
  setAutoUpdate: (enabled: boolean) => Promise<OperationResult>
  getStatus: () => Promise<UpdateStatusPayload>
  onStatusChanged: (callback: (payload: UpdateStatusPayload) => void) => () => void
}

export interface OnboardingAPI {
  getState: () => Promise<OnboardingState>
  setGameSetup: (gameId: string, edition: GameEdition) => Promise<OperationResult>
  complete: () => Promise<OperationResult>
  skip: () => Promise<OperationResult>
  reset: () => Promise<OperationResult>
  onChanged: (callback: (payload: OnboardingState) => void) => () => void
}

export interface ProfilesAPI {
  list: () => Promise<ModProfileSummary[]>
  getLimits: () => Promise<ModProfileLimits>
  get: (profileId: string) => Promise<ModProfileManifest | null>
  create: (name: string) => Promise<{ success: boolean; error?: string; profile?: ModProfileSummary }>
  delete: (profileId: string) => Promise<OperationResult>
  rename: (profileId: string, name: string) => Promise<OperationResult>
  addMod: (profileId: string, modId: string) => Promise<OperationResult>
  removeMod: (profileId: string, modId: string) => Promise<OperationResult>
  apply: (profileId: string) => Promise<OperationResult>
  launch: (profileId: string) => Promise<OperationResult>
  importZip: (profileId: string, zipPath: string) => Promise<ModImportResult>
  browseImport: (profileId: string) => Promise<ModImportResult>
  installCatalog: (catalogId: string, profileId: string, gameId?: string) => Promise<ModImportResult>
  getActiveId: () => Promise<string>
  onChanged: (callback: (profiles: ModProfileSummary[]) => void) => () => void
}

export interface AppAPI {
  setSubscriptionTier: (tier: SubscriptionTier) => Promise<OperationResult>
}

export interface LauncherAPI {
  platform: NodeJS.Platform
  game: GameAPI
  mods: ModsAPI
  catalog: CatalogAPI
  auth: AuthAPI
  setup: SetupAPI
  onboarding: OnboardingAPI
  profiles: ProfilesAPI
  app: AppAPI
  update: UpdateAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
