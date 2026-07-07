import { copyFileSync, existsSync } from 'fs'
import { basename, join } from 'path'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { OperationResult } from '../shared/game'
import type {
  DependencyId,
  DependencyInstallOutcome,
  DependencyStatus,
  SetupRepairResult,
  SetupStatus
} from '../shared/dependencies'
import { PERMISSION_DENIED_MESSAGE, REQUIRED_DEPENDENCIES } from '../shared/dependencies'
import { getResolvedGamePath, isOnboardingComplete, validateGamePath } from './gameLauncher'
import { getDependenciesPath } from './paths'

const lastInstallErrors = new Map<DependencyId, string>()

function isPermissionError(err: unknown): boolean {
  if (!err || typeof err !== 'object' || !('code' in err)) {
    return false
  }
  const code = (err as NodeJS.ErrnoException).code
  return code === 'EPERM' || code === 'EACCES'
}

async function showPermissionDeniedDialog(parent?: BrowserWindow | null): Promise<void> {
  const window = parent ?? BrowserWindow.getFocusedWindow()
  const options = {
    type: 'error' as const,
    buttons: ['OK'],
    title: 'Administrator access required',
    message: 'ModHarbor could not write to your GTA V folder.',
    detail: PERMISSION_DENIED_MESSAGE
  }

  if (window) {
    await dialog.showMessageBox(window, options)
  } else {
    await dialog.showMessageBox(options)
  }
}

function resolveGameInstallRoot(): { gameRoot: string; gtaExePath: string } | { error: string } {
  const gtaExePath = getResolvedGamePath().trim()
  if (!gtaExePath) {
    return { error: 'Configure your GTA V path before installing dependencies.' }
  }

  const validation = validateGamePath(gtaExePath)
  if (!validation.valid || !validation.gameRoot) {
    return { error: validation.error ?? 'GTA V path is not valid.' }
  }

  if (!existsSync(gtaExePath)) {
    return {
      error: `GTA5.exe was not found at the configured path:\n${gtaExePath}`
    }
  }

  const exeName = basename(gtaExePath).toLowerCase()
  if (exeName !== 'gta5.exe' && exeName !== 'gta5_enhanced.exe') {
    return { error: 'The configured path must point to GTA5.exe or GTA5_Enhanced.exe.' }
  }

  return { gameRoot: validation.gameRoot, gtaExePath }
}

function isBundledAvailable(fileName: string): boolean {
  return existsSync(join(getDependenciesPath(), fileName))
}

function isInstalledInGame(gameRoot: string, fileName: string): boolean {
  return existsSync(join(gameRoot, fileName))
}

function buildStatusLabel(
  installedInGame: boolean,
  bundledAvailable: boolean,
  lastInstallError?: string
): string {
  if (lastInstallError) {
    return 'Install failed'
  }
  if (installedInGame) {
    return 'Installed in game folder'
  }
  if (!bundledAvailable) {
    return 'Not bundled with launcher'
  }
  return 'Missing from game folder'
}

function buildDependencyStatus(
  gameRoot: string | undefined,
  def: (typeof REQUIRED_DEPENDENCIES)[number]
): DependencyStatus {
  const installedInGame = gameRoot ? isInstalledInGame(gameRoot, def.fileName) : false
  const bundledAvailable = isBundledAvailable(def.fileName)
  const lastInstallError = lastInstallErrors.get(def.id)

  return {
    id: def.id,
    fileName: def.fileName,
    name: def.name,
    description: def.description,
    installedInGame,
    bundledAvailable,
    gamePath: gameRoot,
    statusLabel: buildStatusLabel(installedInGame, bundledAvailable, lastInstallError),
    lastInstallError
  }
}

export function getSetupStatus(): SetupStatus {
  const gtaExePath = getResolvedGamePath()
  const validation = validateGamePath(gtaExePath)
  const gameRoot = validation.valid ? validation.gameRoot : undefined

  const dependencies = REQUIRED_DEPENDENCIES.map((def) => buildDependencyStatus(gameRoot, def))

  const gamePathConfigured = Boolean(gameRoot)
  const setupComplete =
    gamePathConfigured && dependencies.every((dependency) => dependency.installedInGame)

  return {
    gamePathConfigured,
    gameRoot,
    dependencies,
    setupComplete,
    modsAllowed: setupComplete
  }
}

export function areModsAllowed(): boolean {
  return getSetupStatus().modsAllowed
}

function broadcastSetupChanged(): void {
  const payload = getSetupStatus()
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('setup:changed', payload)
  }
}

interface CopyDependencyOptions {
  repair?: boolean
  showPermissionDialog?: boolean
  parentWindow?: BrowserWindow | null
}

function copyDependencyToGame(
  definition: (typeof REQUIRED_DEPENDENCIES)[number],
  gameRoot: string,
  options: CopyDependencyOptions = {}
): DependencyInstallOutcome {
  const bundledPath = join(getDependenciesPath(), definition.fileName)
  const targetPath = join(gameRoot, definition.fileName)

  if (!existsSync(bundledPath)) {
    const error = `${definition.fileName} is not bundled with this launcher build (expected at ${bundledPath}).`
    lastInstallErrors.set(definition.id, error)
    return {
      id: definition.id,
      fileName: definition.fileName,
      success: false,
      error
    }
  }

  const alreadyInstalled = existsSync(targetPath)
  if (alreadyInstalled && !options.repair) {
    lastInstallErrors.delete(definition.id)
    return {
      id: definition.id,
      fileName: definition.fileName,
      success: true,
      path: targetPath
    }
  }

  try {
    copyFileSync(bundledPath, targetPath)
  } catch (err) {
    const permissionDenied = isPermissionError(err)
    const message = permissionDenied
      ? PERMISSION_DENIED_MESSAGE
      : `Failed to install ${definition.fileName}: ${err instanceof Error ? err.message : String(err)}`

    lastInstallErrors.set(definition.id, message)

    if (permissionDenied && options.showPermissionDialog) {
      void showPermissionDeniedDialog(options.parentWindow)
    }

    return {
      id: definition.id,
      fileName: definition.fileName,
      success: false,
      error: message,
      permissionDenied
    }
  }

  if (!existsSync(targetPath)) {
    const error = `${definition.fileName} could not be verified in your GTA V folder after copying.`
    lastInstallErrors.set(definition.id, error)
    return {
      id: definition.id,
      fileName: definition.fileName,
      success: false,
      error
    }
  }

  lastInstallErrors.delete(definition.id)
  return {
    id: definition.id,
    fileName: definition.fileName,
    success: true,
    path: targetPath
  }
}

export function installDependency(
  dependencyId: DependencyId,
  options: CopyDependencyOptions = {}
): OperationResult {
  const definition = REQUIRED_DEPENDENCIES.find((item) => item.id === dependencyId)

  if (!definition) {
    return { success: false, error: 'Unknown dependency.' }
  }

  const gamePathResult = resolveGameInstallRoot()
  if ('error' in gamePathResult) {
    return { success: false, error: gamePathResult.error }
  }

  const outcome = copyDependencyToGame(definition, gamePathResult.gameRoot, {
    ...options,
    repair: options.repair ?? false
  })

  broadcastSetupChanged()

  if (!outcome.success) {
    return { success: false, error: outcome.error }
  }

  return { success: true, path: outcome.path }
}

export function installAllMissingDependencies(
  options: CopyDependencyOptions = {}
): OperationResult {
  const result = repairDependencies({ ...options, onlyMissing: true })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export function repairDependencies(
  options: CopyDependencyOptions & { onlyMissing?: boolean } = {}
): SetupRepairResult {
  lastInstallErrors.clear()

  const gamePathResult = resolveGameInstallRoot()
  if ('error' in gamePathResult) {
    return {
      success: false,
      error: gamePathResult.error,
      outcomes: []
    }
  }

  const { gameRoot } = gamePathResult
  const outcomes: DependencyInstallOutcome[] = []

  for (const definition of REQUIRED_DEPENDENCIES) {
    if (options.onlyMissing && isInstalledInGame(gameRoot, definition.fileName)) {
      outcomes.push({
        id: definition.id,
        fileName: definition.fileName,
        success: true,
        path: join(gameRoot, definition.fileName)
      })
      continue
    }

    if (!isBundledAvailable(definition.fileName)) {
      if (isInstalledInGame(gameRoot, definition.fileName)) {
        outcomes.push({
          id: definition.id,
          fileName: definition.fileName,
          success: true,
          path: join(gameRoot, definition.fileName)
        })
        continue
      }

      const error = `${definition.fileName} is not bundled with this launcher build.`
      lastInstallErrors.set(definition.id, error)
      outcomes.push({
        id: definition.id,
        fileName: definition.fileName,
        success: false,
        error
      })
      continue
    }

    outcomes.push(
      copyDependencyToGame(definition, gameRoot, {
        repair: true,
        showPermissionDialog: options.showPermissionDialog,
        parentWindow: options.parentWindow
      })
    )
  }

  broadcastSetupChanged()

  const allSucceeded = outcomes.every((outcome) => outcome.success)
  const firstFailure = outcomes.find((outcome) => !outcome.success)

  return {
    success: allSucceeded,
    error: allSucceeded ? undefined : firstFailure?.error,
    outcomes
  }
}

export function emitSetupChanged(): void {
  broadcastSetupChanged()
}

export async function promptMissingDependenciesInstall(window: BrowserWindow): Promise<void> {
  if (!isOnboardingComplete()) {
    return
  }

  const status = getSetupStatus()
  if (status.setupComplete) {
    return
  }

  const missing = status.dependencies.filter((dependency) => !dependency.installedInGame)
  if (missing.length === 0) {
    return
  }

  if (!status.gamePathConfigured) {
    return
  }

  const installable = missing.filter((dependency) => dependency.bundledAvailable)
  if (installable.length === 0) {
    const missingNames = missing.map((dependency) => dependency.fileName).join(', ')
    await dialog.showMessageBox(window, {
      type: 'warning',
      buttons: ['Open setup checklist'],
      title: 'Setup required',
      message: 'Modding prerequisites are missing from your GTA V folder.',
      detail: `${missingNames} were not found and are not bundled with this launcher build. Complete the setup checklist in the Mods tab or add the files to resources/dependencies/ before rebuilding.`
    })
    window.webContents.send('setup:openChecklist')
    return
  }

  const names = installable.map((dependency) => dependency.fileName).join(', ')
  const { response } = await dialog.showMessageBox(window, {
    type: 'question',
    buttons: ['Install automatically', 'Open setup checklist', 'Later'],
    defaultId: 0,
    cancelId: 2,
    title: 'Install modding prerequisites?',
    message: 'Required framework files are missing from your GTA V folder.',
    detail: `These files can be copied from the launcher bundle into your game directory:\n\n${names}\n\nMod import and enable stay locked until setup is complete.`
  })

  if (response === 0) {
    const result = repairDependencies({
      onlyMissing: true,
      showPermissionDialog: true,
      parentWindow: window
    })
    if (result.success) {
      await dialog.showMessageBox(window, {
        type: 'info',
        buttons: ['OK'],
        title: 'Setup complete',
        message: 'Prerequisites installed successfully.',
        detail: 'You can now import and enable mods from the Mods tab.'
      })
    } else {
      await dialog.showErrorBox('Installation failed', result.error ?? 'Unknown error')
      window.webContents.send('setup:openChecklist')
    }
    return
  }

  if (response === 1) {
    window.webContents.send('setup:openChecklist')
  }
}

export function assertModsAllowed(): OperationResult | null {
  if (!areModsAllowed()) {
    return {
      success: false,
      error: 'Complete the setup checklist before installing or enabling mods.'
    }
  }
  return null
}

export function registerDependencyManagerIpc(): void {
  ipcMain.handle('setup:getStatus', () => getSetupStatus())

  ipcMain.handle('setup:install', (event, dependencyId: unknown) => {
    if (dependencyId !== 'scripthookv' && dependencyId !== 'asi_loader') {
      return { success: false, error: 'Invalid dependency id.' } satisfies OperationResult
    }
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    return installDependency(dependencyId, {
      showPermissionDialog: true,
      parentWindow
    })
  })

  ipcMain.handle('setup:installAll', (event) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    return installAllMissingDependencies({
      showPermissionDialog: true,
      parentWindow
    })
  })

  ipcMain.handle('setup:repair', (event) => {
    const parentWindow = BrowserWindow.fromWebContents(event.sender)
    return repairDependencies({
      showPermissionDialog: true,
      parentWindow
    })
  })
}
