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
import type { SetupStatus, DependencyId } from '../shared/dependencies'
import type { UpdateStatusPayload } from '../shared/update'

export type { LaunchStatus, GamePathSource } from '../shared/game'
export type { ModSummary, ModListResult, ModImportResult } from '../shared/mods'
export type { SubscriptionTier, UserProfile, ThemePreference, OAuthCallbackInfo } from '../shared/profile'
export type { SetupStatus, DependencyId } from '../shared/dependencies'
export type { UpdateStatus, UpdateStatusPayload } from '../shared/update'
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
}

export interface UpdateAPI {
  check: () => Promise<OperationResult>
  install: () => Promise<void>
  getAppVersion: () => Promise<string>
  onStatusChanged: (callback: (payload: UpdateStatusPayload) => void) => () => void
}

export interface LauncherAPI {
  platform: NodeJS.Platform
  game: GameAPI
  mods: ModsAPI
  catalog: CatalogAPI
  auth: AuthAPI
  setup: SetupAPI
  update: UpdateAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: LauncherAPI
  }
}
