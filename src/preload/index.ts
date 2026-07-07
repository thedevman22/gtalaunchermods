import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  GamePathCandidate,
  GamePathInfo,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'
import type { CatalogResult } from '../shared/catalog'
import type { ModImportResult, ModListResult } from '../shared/mods'
import type { OAuthCallbackInfo } from '../shared/profile'
import type { SetupStatus } from '../shared/dependencies'
import type { UpdateStatusPayload } from '../shared/update'

const gameApi = {
  getPath: (): Promise<GamePathInfo> => ipcRenderer.invoke('game:getPath'),
  detectPaths: (): Promise<GamePathCandidate[]> => ipcRenderer.invoke('game:detectPaths'),
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
  install: (catalogId: string, gameId: string): Promise<ModImportResult> =>
    ipcRenderer.invoke('catalog:install', catalogId, gameId),
  getInstalledMap: (gameId: string): Promise<Record<string, string>> =>
    ipcRenderer.invoke('catalog:getInstalledMap', gameId)
}

const updateApi = {
  check: (): Promise<OperationResult> => ipcRenderer.invoke('update:check'),
  install: (): Promise<void> => ipcRenderer.invoke('update:install'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('update:getAppVersion'),
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
