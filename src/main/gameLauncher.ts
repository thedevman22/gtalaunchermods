import { spawn, type ChildProcess } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { basename, dirname, join, normalize } from 'path'
import { BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type OpenDialogOptions } from 'electron'
import { PersistentStore } from './persistentStore'
import type {
  GamePathCandidate,
  GamePathInfo,
  GamePathSource,
  LaunchStatus,
  LaunchStatusPayload,
  OperationResult
} from '../shared/game'

interface LauncherStoreSchema extends Record<string, unknown> {
  gta5ExePath: string
}

const COMMANDLINE_CONTENT = '-scOfflineOnly'
const GTA_EXE_NAME = 'GTA5.exe'

let store: PersistentStore<LauncherStoreSchema> | null = null

function getStore(): PersistentStore<LauncherStoreSchema> {
  if (!store) {
    store = new PersistentStore<LauncherStoreSchema>('gta-mod-launcher', {
      gta5ExePath: ''
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

export function getLaunchStatus(): LaunchStatusPayload {
  return { status: currentStatus, error: statusError }
}

export function getSavedGamePath(): string {
  return getStore().get('gta5ExePath', '') ?? ''
}

export function saveGamePath(exePath: string): void {
  getStore().set('gta5ExePath', normalize(exePath))
}

export function validateGamePath(exePath: string): {
  valid: boolean
  error?: string
  gameRoot?: string
} {
  if (!exePath?.trim()) {
    return { valid: false, error: 'No GTA V path configured.' }
  }

  const normalized = normalize(exePath.trim())

  if (basename(normalized).toLowerCase() !== GTA_EXE_NAME.toLowerCase()) {
    return { valid: false, error: `Selected file must be ${GTA_EXE_NAME}.` }
  }

  if (!pathExists(normalized)) {
    return { valid: false, error: `GTA V executable not found at: ${normalized}` }
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
    'E:\\Steam'
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

export function detectGamePaths(): GamePathCandidate[] {
  const candidates: GamePathCandidate[] = []
  const seen = new Set<string>()

  const addCandidate = (exePath: string, source: GamePathSource): void => {
    const normalized = normalize(exePath)
    const key = normalized.toLowerCase()

    if (seen.has(key) || !pathExists(normalized)) {
      return
    }

    seen.add(key)
    candidates.push({ path: normalized, source })
  }

  if (process.platform === 'win32') {
    for (const libraryRoot of getSteamLibraryRoots()) {
      addCandidate(
        join(libraryRoot, 'steamapps', 'common', 'Grand Theft Auto V', GTA_EXE_NAME),
        'steam'
      )
    }

    const epicBases = [
      join(process.env.ProgramFiles || 'C:\\Program Files', 'Epic Games'),
      join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Epic Games'),
      'D:\\Epic Games',
      'E:\\Epic Games'
    ]

    for (const epicBase of epicBases) {
      addCandidate(join(epicBase, 'GTAV', GTA_EXE_NAME), 'epic')
      addCandidate(join(epicBase, 'Grand Theft Auto V', GTA_EXE_NAME), 'epic')
    }

    const rockstarBases = [
      join(process.env.ProgramFiles || 'C:\\Program Files', 'Rockstar Games', 'Grand Theft Auto V'),
      join(
        process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
        'Rockstar Games',
        'Grand Theft Auto V'
      )
    ]

    for (const rockstarBase of rockstarBases) {
      addCandidate(join(rockstarBase, GTA_EXE_NAME), 'rockstar')
    }
  }

  const saved = getSavedGamePath()
  if (saved) {
    addCandidate(saved, 'saved')
  }

  return candidates
}

export function getResolvedGamePath(): string {
  const saved = getSavedGamePath()
  if (validateGamePath(saved).valid) {
    return saved
  }

  const detected = detectGamePaths()
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

  let exePath = getSavedGamePath()

  if (!validateGamePath(exePath).valid) {
    const detected = detectGamePaths()
    if (detected.length === 0) {
      const error = 'GTA V not found. Browse to GTA5.exe or install the game.'
      setStatus('error', error)
      return { success: false, error }
    }

    exePath = detected[0].path
    saveGamePath(exePath)
  }

  const validation = validateGamePath(exePath)
  if (!validation.valid || !validation.gameRoot) {
    const error = validation.error ?? 'Invalid GTA V path.'
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
  const parentWindow = BrowserWindow.fromWebContents(event.sender)
  const dialogOptions: OpenDialogOptions = {
    title: 'Select GTA5.exe',
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
  const validation = validateGamePath(selected)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  saveGamePath(selected)
  void import('./dependencyManager').then(({ emitSetupChanged }) => emitSetupChanged())
  return { success: true, path: selected }
}

export function registerGameLauncherIpc(): void {
  ipcMain.handle('game:getPath', () => getGamePathInfo())
  ipcMain.handle('game:detectPaths', () => detectGamePaths())
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
}
