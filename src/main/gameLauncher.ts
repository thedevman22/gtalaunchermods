import { spawn, type ChildProcess } from 'child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, dirname, join, normalize } from 'path'
import { BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type OpenDialogOptions } from 'electron'
import { createRequire } from 'node:module'
import type StoreType from 'electron-store'
import type { SubscriptionTier } from '../shared/profile'
import {
  DEFAULT_GAME_ID,
  getExeFileNameForEdition,
  getEditionLabel,
  isGameEdition,
  type GameEdition,
  type GameId
} from '../shared/games'
import type {
  GamePathCandidate,
  GamePathInfo,
  GamePathSource,
  LaunchStatus,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'

const require = createRequire(import.meta.url)
const Store = require('electron-store') as typeof StoreType

interface LauncherStoreSchema {
  gta5ExePath: string
  gameId: GameId
  gameEdition: GameEdition
  onboardingComplete: boolean
  subscriptionTier: SubscriptionTier
  lastDeployedProfileId: string
}

const COMMANDLINE_CONTENT = '-scOfflineOnly'

const STEAM_GAME_FOLDERS: Record<GameEdition, string[]> = {
  legacy: ['Grand Theft Auto V'],
  enhanced: ['Grand Theft Auto V Enhanced', 'Grand Theft Auto V']
}

const EPIC_GAME_FOLDERS: Record<GameEdition, string[]> = {
  legacy: ['GTAV', 'Grand Theft Auto V'],
  enhanced: ['GTAV Enhanced', 'Grand Theft Auto V Enhanced', 'GTAV', 'Grand Theft Auto V']
}

const ROCKSTAR_GAME_FOLDERS: Record<GameEdition, string[]> = {
  legacy: ['Grand Theft Auto V'],
  enhanced: ['Grand Theft Auto V Enhanced', 'Grand Theft Auto V']
}

let store: StoreType<LauncherStoreSchema> | null = null

function getStore(): StoreType<LauncherStoreSchema> {
  if (!store) {
    store = new Store<LauncherStoreSchema>({
      name: 'modharbor',
      defaults: {
        gta5ExePath: '',
        gameId: DEFAULT_GAME_ID,
        gameEdition: 'legacy',
        onboardingComplete: false,
        subscriptionTier: 'free',
        lastDeployedProfileId: ''
      }
    })
  }
  return store
}

let currentStatus: LaunchStatus = 'idle'
let statusError: string | undefined
let gameProcess: ChildProcess | null = null

function setStatus(status: LaunchStatus, error?: string): void {
  currentStatus = status
  statusError = error
  broadcastStatus()
}

function broadcastStatus(): void {
  const payload: LaunchStatusPayload = { status: currentStatus, error: statusError }
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('game:status-changed', payload)
  }
}

function pathExists(filePath: string): boolean {
  try {
    return existsSync(filePath)
  } catch {
    return false
  }
}

function sourceLabel(source: GamePathSource, edition: GameEdition): string {
  const editionTag = getEditionLabel(edition)
  switch (source) {
    case 'steam':
      return `Steam · ${editionTag}`
    case 'epic':
      return `Epic Games · ${editionTag}`
    case 'rockstar':
      return `Rockstar Games · ${editionTag}`
    case 'saved':
      return `Saved · ${editionTag}`
    default:
      return editionTag
  }
}

export function getLaunchStatus(): LaunchStatusPayload {
  return { status: currentStatus, error: statusError }
}

export function getSavedGamePath(): string {
  return getStore().get('gta5ExePath', '') ?? ''
}

export function saveGamePath(exePath: string): void {
  getStore().set('gta5ExePath', normalize(exePath))
}

export function getGameId(): GameId {
  return getStore().get('gameId', DEFAULT_GAME_ID)
}

export function getGameEdition(): GameEdition {
  return getStore().get('gameEdition', 'legacy')
}

export function setGameSelection(gameId: GameId, edition: GameEdition): void {
  getStore().set('gameId', gameId)
  getStore().set('gameEdition', edition)
}

export function isOnboardingComplete(): boolean {
  return Boolean(getStore().get('onboardingComplete', false))
}

export function setOnboardingComplete(complete: boolean): void {
  getStore().set('onboardingComplete', complete)
}

export function resetOnboardingState(): void {
  getStore().set('onboardingComplete', false)
}

export function getSubscriptionTier(): SubscriptionTier {
  return getStore().get('subscriptionTier', 'free')
}

export function setSubscriptionTier(tier: SubscriptionTier): void {
  getStore().set('subscriptionTier', tier)
}

export function getLastDeployedProfileId(): string {
  return getStore().get('lastDeployedProfileId', '') ?? ''
}

export function setLastDeployedProfileId(profileId: string): void {
  getStore().set('lastDeployedProfileId', profileId)
}

export function validateGamePath(
  exePath: string,
  edition: GameEdition = getGameEdition()
): {
  valid: boolean
  error?: string
  gameRoot?: string
} {
  if (!exePath?.trim()) {
    return { valid: false, error: 'No game path configured.' }
  }

  const normalized = normalize(exePath.trim())
  const expectedExe = getExeFileNameForEdition(edition)

  if (basename(normalized).toLowerCase() !== expectedExe.toLowerCase()) {
    return { valid: false, error: `Selected file must be ${expectedExe}.` }
  }

  if (!pathExists(normalized)) {
    return { valid: false, error: `Game executable not found at: ${normalized}` }
  }

  return { valid: true, gameRoot: dirname(normalized) }
}

function getSteamLibraryRoots(): string[] {
  if (process.platform !== 'win32') {
    return []
  }

  const roots = new Set<string>()
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files'

  const steamCandidates = [
    join(programFilesX86, 'Steam'),
    join(programFiles, 'Steam'),
    'C:\\Steam',
    'D:\\Steam',
    'E:\\Steam',
    'F:\\Steam'
  ]

  for (const steamRoot of steamCandidates) {
    if (!pathExists(steamRoot)) continue

    roots.add(steamRoot)

    const libraryVdf = join(steamRoot, 'steamapps', 'libraryfolders.vdf')
    if (!pathExists(libraryVdf)) continue

    try {
      const content = readFileSync(libraryVdf, 'utf-8')
      for (const match of content.matchAll(/"path"\s+"([^"]+)"/g)) {
        roots.add(match[1].replace(/\\\\/g, '\\'))
      }
    } catch {
      // Ignore unreadable or malformed libraryfolders.vdf
    }
  }

  return [...roots]
}

function getEpicInstallLocations(): string[] {
  if (process.platform !== 'win32') {
    return []
  }

  const locations = new Set<string>()
  const manifestDir = join(
    process.env.ProgramData || 'C:\\ProgramData',
    'Epic',
    'EpicGamesLauncher',
    'Data',
    'Manifests'
  )

  if (!pathExists(manifestDir)) {
    return []
  }

  try {
    for (const entry of readdirSync(manifestDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.item') && !entry.name.endsWith('.manifest')) continue

      try {
        const raw = readFileSync(join(manifestDir, entry.name), 'utf-8')
        const parsed = JSON.parse(raw) as {
          InstallLocation?: string
          DisplayName?: string
          AppName?: string
        }

        if (!parsed.InstallLocation) continue

        const haystack = `${parsed.DisplayName ?? ''} ${parsed.AppName ?? ''}`.toLowerCase()
        if (
          haystack.includes('grand theft auto') ||
          haystack.includes('gtav') ||
          haystack.includes('gta v')
        ) {
          locations.add(parsed.InstallLocation)
        }
      } catch {
        // Skip malformed manifest entries
      }
    }
  } catch {
    return []
  }

  return [...locations]
}

function getRockstarInstallBases(): string[] {
  if (process.platform !== 'win32') {
    return []
  }

  const bases = new Set<string>()
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'

  for (const root of [programFiles, programFilesX86]) {
    bases.add(join(root, 'Rockstar Games'))
  }

  const userProfile = process.env.USERPROFILE
  if (userProfile) {
    bases.add(join(userProfile, 'Documents', 'Rockstar Games'))
  }

  return [...bases]
}

export function detectGamePaths(edition: GameEdition = getGameEdition()): GamePathCandidate[] {
  const candidates: GamePathCandidate[] = []
  const seen = new Set<string>()
  const exeName = getExeFileNameForEdition(edition)

  const addCandidate = (exePath: string, source: GamePathSource): void => {
    const normalized = normalize(exePath)
    const key = normalized.toLowerCase()

    if (seen.has(key) || !pathExists(normalized)) {
      return
    }

    seen.add(key)
    candidates.push({
      path: normalized,
      source,
      label: sourceLabel(source, edition)
    })
  }

  const scanFolderForExe = (folder: string, source: GamePathSource): void => {
    if (!pathExists(folder)) return
    addCandidate(join(folder, exeName), source)
  }

  if (process.platform === 'win32') {
    for (const libraryRoot of getSteamLibraryRoots()) {
      for (const folderName of STEAM_GAME_FOLDERS[edition]) {
        scanFolderForExe(join(libraryRoot, 'steamapps', 'common', folderName), 'steam')
      }
    }

    const epicBases = [
      join(process.env.ProgramFiles || 'C:\\Program Files', 'Epic Games'),
      join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Epic Games'),
      'D:\\Epic Games',
      'E:\\Epic Games',
      'F:\\Epic Games',
      ...getEpicInstallLocations()
    ]

    for (const epicBase of epicBases) {
      if (pathExists(epicBase) && basename(epicBase).toLowerCase().includes('gta')) {
        scanFolderForExe(epicBase, 'epic')
      }

      for (const folderName of EPIC_GAME_FOLDERS[edition]) {
        scanFolderForExe(join(epicBase, folderName), 'epic')
      }
    }

    for (const rockstarBase of getRockstarInstallBases()) {
      for (const folderName of ROCKSTAR_GAME_FOLDERS[edition]) {
        scanFolderForExe(join(rockstarBase, folderName), 'rockstar')
      }
    }
  }

  const saved = getSavedGamePath()
  if (saved && validateGamePath(saved, edition).valid) {
    addCandidate(saved, 'saved')
  }

  return candidates
}

export function getResolvedGamePath(): string {
  const edition = getGameEdition()
  const saved = getSavedGamePath()
  if (validateGamePath(saved, edition).valid) {
    return saved
  }

  const detected = detectGamePaths(edition)
  return detected[0]?.path ?? ''
}

export function getGamePathInfo(): GamePathInfo {
  return {
    savedPath: getSavedGamePath(),
    resolvedPath: getResolvedGamePath(),
    candidates: detectGamePaths()
  }
}

function writeCommandLineFile(gameRoot: string): OperationResult {
  try {
    writeFileSync(join(gameRoot, 'commandline.txt'), COMMANDLINE_CONTENT, 'utf-8')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to write commandline.txt: ${message}` }
  }
}

export async function launchGame(): Promise<OperationResult> {
  if (currentStatus === 'launching' || currentStatus === 'running') {
    return { success: false, error: 'Game is already launching or running.' }
  }

  const edition = getGameEdition()
  const exeName = getExeFileNameForEdition(edition)
  let exePath = getSavedGamePath()

  if (!validateGamePath(exePath, edition).valid) {
    const detected = detectGamePaths(edition)
    if (detected.length === 0) {
      const error = `GTA V not found. Browse to ${exeName} or install the game.`
      setStatus('error', error)
      return { success: false, error }
    }

    exePath = detected[0].path
    saveGamePath(exePath)
  }

  const validation = validateGamePath(exePath, edition)
  if (!validation.valid || !validation.gameRoot) {
    const error = validation.error ?? 'Invalid game path.'
    setStatus('error', error)
    return { success: false, error }
  }

  const writeResult = writeCommandLineFile(validation.gameRoot)
  if (!writeResult.success) {
    setStatus('error', writeResult.error)
    return writeResult
  }

  setStatus('launching')

  try {
    gameProcess = spawn(exePath, [], {
      cwd: validation.gameRoot,
      detached: false,
      stdio: 'ignore',
      windowsHide: false
    })

    gameProcess.once('error', (err) => {
      gameProcess = null
      setStatus('error', `Failed to launch GTA V: ${err.message}`)
    })

    gameProcess.once('spawn', () => {
      setStatus('running')
    })

    gameProcess.once('exit', () => {
      gameProcess = null
      if (currentStatus !== 'error') {
        setStatus('closed')
      }
    })

    if (gameProcess.pid) {
      setStatus('running')
    }

    return { success: true, path: exePath }
  } catch (err) {
    gameProcess = null
    const message = err instanceof Error ? err.message : String(err)
    setStatus('error', `Failed to launch GTA V: ${message}`)
    return { success: false, error: message }
  }
}

async function browseGamePath(event: IpcMainInvokeEvent): Promise<OperationResult> {
  const edition = getGameEdition()
  const exeName = getExeFileNameForEdition(edition)
  const parentWindow = BrowserWindow.fromWebContents(event.sender)
  const dialogOptions: OpenDialogOptions = {
    title: `Select ${exeName}`,
    properties: ['openFile'],
    filters: [{ name: 'GTA V Executable', extensions: ['exe'] }]
  }

  const result = parentWindow
    ? await dialog.showOpenDialog(parentWindow, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions)

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true }
  }

  const selected = result.filePaths[0]
  const validation = validateGamePath(selected, edition)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  saveGamePath(selected)
  void import('./dependencyManager').then(({ emitSetupChanged }) => emitSetupChanged())
  return { success: true, path: selected }
}

export function registerGameLauncherIpc(): void {
  ipcMain.handle('game:getPath', () => getGamePathInfo())
  ipcMain.handle('game:detectPaths', (_event, edition: unknown) => {
    if (edition === undefined) {
      return detectGamePaths()
    }
    if (typeof edition === 'string' && isGameEdition(edition)) {
      return detectGamePaths(edition)
    }
    return []
  })
  ipcMain.handle('game:getStatus', () => getLaunchStatus())
  ipcMain.handle('game:launch', () => launchGame())
  ipcMain.handle('game:browsePath', (event) => browseGamePath(event))
  ipcMain.handle('game:setPath', (_event, exePath: unknown) => {
    if (typeof exePath !== 'string') {
      return { success: false, error: 'Path must be a string.' } satisfies OperationResult
    }

    const validation = validateGamePath(exePath)
    if (!validation.valid) {
      return { success: false, error: validation.error } satisfies OperationResult
    }

    saveGamePath(exePath)
    void import('./dependencyManager').then(({ emitSetupChanged }) => emitSetupChanged())
    return { success: true, path: exePath } satisfies OperationResult
  })
  ipcMain.handle('game:getConfig', () => ({
    gameId: getGameId(),
    edition: getGameEdition()
  }))
}
