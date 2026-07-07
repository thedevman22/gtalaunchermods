import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  GamePathCandidate,
  GamePathInfo,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'
import type { ModImportResult, ModListResult, ModSummary } from '../shared/mods'
import type { OAuthCallbackInfo } from '../shared/profile'
import type { CatalogResult } from '../shared/catalog'
import type { DependencyId, SetupStatus } from '../shared/dependencies'

export type { LaunchStatus, GamePathSource } from '../shared/game'
export type { ModSummary, ModListResult, ModImportResult } from '../shared/mods'
export type { SubscriptionTier, UserProfile, ThemePreference, OAuthCallbackInfo } from '../shared/profile'
export type { SetupStatus, DependencyId } from '../shared/dependencies'
export type { CatalogMod, ModCategory, ModCatalogSource, CatalogResult } from '../shared/catalog'

export interface GameAPI {
  getPath: () => Promise<GamePathInfo>
  detectPaths: () => Promise<GamePathCandidate[]>
  setPath: (exePath: string) => Promise<OperationResult>
  browsePath: () => Promise<OperationResult>
  launch: () => Promise<OperationResult>
  getStatus: () => Promise<LaunchStatusPayload>
  onStatusChanged: (callback: (payload: LaunchStatusPayload) => void) => () => void
}

export interface ModsAPI {
  getLibraryPath: () => Promise<string>
  list: () => Promise<ModListResult>
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
  getMods: () => Promise<CatalogResult>
  install: (catalogId: string) => Promise<ModImportResult>
  getInstalledMap: () => Promise<Record<string, string>>
}

export interface LauncherAPI {
  platform: NodeJS.Platform
  game: GameAPI
  mods: ModsAPI
  catalog: CatalogAPI
  auth: AuthAPI
  setup: SetupAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
