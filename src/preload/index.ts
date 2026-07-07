import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  GamePathCandidate,
  GamePathInfo,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'
import type { CatalogMeta, CatalogResult } from '../shared/catalog'
import type { ModImportResult, ModListResult } from '../shared/mods'
import type { OAuthCallbackInfo } from '../shared/profile'
import type { SetupStatus } from '../shared/dependencies'
import type { OnboardingState } from '../shared/onboarding'
import type { ModProfileLimits, ModProfileManifest, ModProfileSummary } from '../shared/modProfiles'
import type { SubscriptionTier } from '../shared/profile'
import type { UpdateSettings, UpdateStatusPayload } from '../shared/update'

const gameApi = {
  getPath: (): Promise<GamePathInfo> => ipcRenderer.invoke('game:getPath'),
  detectPaths: (edition?: string): Promise<GamePathCandidate[]> =>
    ipcRenderer.invoke('game:detectPaths', edition),
  setPath: (exePath: string): Promise<OperationResult> => ipcRenderer.invoke('game:setPath', exePath),
  browsePath: (): Promise<OperationResult> => ipcRenderer.invoke('game:browsePath'),
  launch: (): Promise<OperationResult> => ipcRenderer.invoke('game:launch'),
  getStatus: (): Promise<LaunchStatusPayload> => ipcRenderer.invoke('game:getStatus'),
  onStatusChanged: (callback: (payload: LaunchStatusPayload) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: LaunchStatusPayload): void => {
      callback(payload)
    }
    ipcRenderer.on('game:status-changed', listener)
    return () => {
      ipcRenderer.removeListener('game:status-changed', listener)
    }
  }
}

const modsApi = {
  getLibraryPath: (): Promise<string> => ipcRenderer.invoke('mods:getLibraryPath'),
  list: (gameId?: string): Promise<ModListResult> => ipcRenderer.invoke('mods:list', gameId),
  importMod: (zipPath: string): Promise<ModImportResult> => ipcRenderer.invoke('mods:import', zipPath),
  browseImport: (): Promise<ModImportResult> => ipcRenderer.invoke('mods:browseImport'),
  enableMod: (modId: string): Promise<OperationResult> => ipcRenderer.invoke('mods:enable', modId),
  disableMod: (modId: string): Promise<OperationResult> => ipcRenderer.invoke('mods:disable', modId),
  deleteMod: (modId: string): Promise<OperationResult> => ipcRenderer.invoke('mods:delete', modId),
  onChanged: (callback: (payload: ModListResult) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: ModListResult): void => {
      callback(payload)
    }
    ipcRenderer.on('mods:changed', listener)
    return () => {
      ipcRenderer.removeListener('mods:changed', listener)
    }
  }
}

const authApi = {
  startOAuthCallback: (): Promise<OAuthCallbackInfo> => ipcRenderer.invoke('auth:startOAuthCallback'),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('auth:openExternal', url),
  onOAuthCallback: (callback: (callbackUrl: string) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, callbackUrl: string): void => {
      callback(callbackUrl)
    }
    ipcRenderer.on('auth:oauth-callback', listener)
    return () => {
      ipcRenderer.removeListener('auth:oauth-callback', listener)
    }
  }
}

const setupApi = {
  getStatus: (): Promise<SetupStatus> => ipcRenderer.invoke('setup:getStatus'),
  install: (dependencyId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('setup:install', dependencyId),
  installAll: (): Promise<OperationResult> => ipcRenderer.invoke('setup:installAll'),
  onChanged: (callback: (payload: SetupStatus) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: SetupStatus): void => {
      callback(payload)
    }
    ipcRenderer.on('setup:changed', listener)
    return () => {
      ipcRenderer.removeListener('setup:changed', listener)
    }
  },
  onOpenChecklist: (callback: () => void): (() => void) => {
    const listener = (): void => {
      callback()
    }
    ipcRenderer.on('setup:openChecklist', listener)
    return () => {
      ipcRenderer.removeListener('setup:openChecklist', listener)
    }
  }
}

const catalogApi = {
  getMods: (gameId: string): Promise<CatalogResult> => ipcRenderer.invoke('catalog:getMods', gameId),
  getMeta: (): Promise<CatalogMeta> => ipcRenderer.invoke('catalog:getMeta'),
  refresh: (): Promise<CatalogMeta> => ipcRenderer.invoke('catalog:refresh'),
  install: (catalogId: string, gameId: string): Promise<ModImportResult> =>
    ipcRenderer.invoke('catalog:install', catalogId, gameId),
  getInstalledMap: (gameId: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke('catalog:getInstalledMap', gameId),
  onChanged: (callback: () => void): (() => void) => {
    const listener = (): void => {
      callback()
    }
    ipcRenderer.on('catalog:changed', listener)
    return () => {
      ipcRenderer.removeListener('catalog:changed', listener)
    }
  }
}

const onboardingApi = {
  getState: (): Promise<OnboardingState> => ipcRenderer.invoke('onboarding:getState'),
  setGameSetup: (gameId: string, edition: string): Promise<OperationResult> =>
    ipcRenderer.invoke('onboarding:setGameSetup', gameId, edition),
  complete: (): Promise<OperationResult> => ipcRenderer.invoke('onboarding:complete'),
  skip: (): Promise<OperationResult> => ipcRenderer.invoke('onboarding:skip'),
  reset: (): Promise<OperationResult> => ipcRenderer.invoke('onboarding:reset'),
  onChanged: (callback: (payload: OnboardingState) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: OnboardingState): void => {
      callback(payload)
    }
    ipcRenderer.on('onboarding:changed', listener)
    return () => {
      ipcRenderer.removeListener('onboarding:changed', listener)
    }
  }
}

const profilesApi = {
  list: (): Promise<ModProfileSummary[]> => ipcRenderer.invoke('profiles:list'),
  getLimits: (): Promise<ModProfileLimits> => ipcRenderer.invoke('profiles:getLimits'),
  get: (profileId: string): Promise<ModProfileManifest | null> =>
    ipcRenderer.invoke('profiles:get', profileId),
  create: (name: string): Promise<{ success: boolean; error?: string; profile?: ModProfileSummary }> =>
    ipcRenderer.invoke('profiles:create', name),
  delete: (profileId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:delete', profileId),
  rename: (profileId: string, name: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:rename', profileId, name),
  addMod: (profileId: string, modId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:addMod', profileId, modId),
  removeMod: (profileId: string, modId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:removeMod', profileId, modId),
  apply: (profileId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:apply', profileId),
  launch: (profileId: string): Promise<OperationResult> =>
    ipcRenderer.invoke('profiles:launch', profileId),
  importZip: (profileId: string, zipPath: string): Promise<ModImportResult> =>
    ipcRenderer.invoke('profiles:importZip', profileId, zipPath),
  browseImport: (profileId: string): Promise<ModImportResult> =>
    ipcRenderer.invoke('profiles:browseImport', profileId),
  installCatalog: (catalogId: string, profileId: string, gameId?: string): Promise<ModImportResult> =>
    ipcRenderer.invoke('profiles:installCatalog', catalogId, profileId, gameId),
  getActiveId: (): Promise<string> => ipcRenderer.invoke('profiles:getActiveId'),
  onChanged: (callback: (profiles: ModProfileSummary[]) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: ModProfileSummary[]): void => {
      callback(payload)
    }
    ipcRenderer.on('profiles:changed', listener)
    return () => {
      ipcRenderer.removeListener('profiles:changed', listener)
    }
  }
}

const appApi = {
  setSubscriptionTier: (tier: SubscriptionTier): Promise<OperationResult> =>
    ipcRenderer.invoke('app:setSubscriptionTier', tier)
}

const updateApi = {
  check: (): Promise<OperationResult> => ipcRenderer.invoke('update:check'),
  download: (): Promise<OperationResult> => ipcRenderer.invoke('update:download'),
  install: (): Promise<void> => ipcRenderer.invoke('update:install'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('update:getAppVersion'),
  getSettings: (): Promise<UpdateSettings> => ipcRenderer.invoke('update:getSettings'),
  setAutoUpdate: (enabled: boolean): Promise<OperationResult> =>
    ipcRenderer.invoke('update:setAutoUpdate', enabled),
  getStatus: (): Promise<UpdateStatusPayload> => ipcRenderer.invoke('update:getStatus'),
  onStatusChanged: (callback: (payload: UpdateStatusPayload) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: UpdateStatusPayload): void => {
      callback(payload)
    }
    ipcRenderer.on('update:status-changed', listener)
    return () => {
      ipcRenderer.removeListener('update:status-changed', listener)
    }
  }
}

const api = {
  platform: process.platform,
  game: gameApi,
  mods: modsApi,
  catalog: catalogApi,
  auth: authApi,
  setup: setupApi,
  onboarding: onboardingApi,
  profiles: profilesApi,
  app: appApi,
  update: updateApi
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error exposed on window for non-isolated contexts
  window.electron = electronAPI
  // @ts-expect-error exposed on window for non-isolated contexts
  window.api = api
}
