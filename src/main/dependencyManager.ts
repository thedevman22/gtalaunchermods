import { copyFileSync, existsSync } from 'fs'
import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import type { OperationResult } from '../shared/game'
import type { DependencyId, DependencyStatus, SetupStatus } from '../shared/dependencies'
import { REQUIRED_DEPENDENCIES } from '../shared/dependencies'
import { getResolvedGamePath, isOnboardingComplete, validateGamePath } from './gameLauncher'

function getBundledDependenciesDir(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'dependencies')
  }
  return join(__dirname, '../../resources/dependencies')
}

function getGameRoot(): { gameRoot: string } | { error: string } {
  const gtaExePath = getResolvedGamePath()
  const validation = validateGamePath(gtaExePath)
  if (!validation.valid || !validation.gameRoot) {
    return { error: validation.error ?? 'GTA V path is not configured.' }
  }
  return { gameRoot: validation.gameRoot }
}

function isBundledAvailable(fileName: string): boolean {
  return existsSync(join(getBundledDependenciesDir(), fileName))
}

function isInstalledInGame(gameRoot: string, fileName: string): boolean {
  return existsSync(join(gameRoot, fileName))
}

function buildDependencyStatus(
  gameRoot: string | undefined,
  def: (typeof REQUIRED_DEPENDENCIES)[number]
): DependencyStatus {
  return {
    id: def.id,
    fileName: def.fileName,
    name: def.name,
    description: def.description,
    installedInGame: gameRoot ? isInstalledInGame(gameRoot, def.fileName) : false,
    bundledAvailable: isBundledAvailable(def.fileName),
    gamePath: gameRoot
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

export function installDependency(dependencyId: DependencyId): OperationResult {
  const definition = REQUIRED_DEPENDENCIES.find((item) => item.id === dependencyId)

  if (!definition) {
    return { success: false, error: 'Unknown dependency.' }
  }

  const gamePathResult = getGameRoot()
  if ('error' in gamePathResult) {
    return { success: false, error: gamePathResult.error }
  }

  const { gameRoot } = gamePathResult
  const bundledPath = join(getBundledDependenciesDir(), definition.fileName)
  const targetPath = join(gameRoot, definition.fileName)

  if (!existsSync(bundledPath)) {
    return {
      success: false,
      error: `${definition.fileName} is not bundled. Place it in resources/dependencies/ and restart the launcher.`
    }
  }

  if (existsSync(targetPath)) {
    return {
      success: false,
      error: `${definition.fileName} already exists in your GTA V folder.`
    }
  }

  try {
    copyFileSync(bundledPath, targetPath)
    broadcastSetupChanged()
    return { success: true, path: targetPath }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to install ${definition.fileName}: ${message}` }
  }
}

export function installAllMissingDependencies(): OperationResult {
  const status = getSetupStatus()

  if (!status.gamePathConfigured) {
    return { success: false, error: 'Configure your GTA V path before installing dependencies.' }
  }

  const missing = status.dependencies.filter(
    (dependency) => !dependency.installedInGame && dependency.bundledAvailable
  )

  if (missing.length === 0) {
    const notBundled = status.dependencies.filter(
      (dependency) => !dependency.installedInGame && !dependency.bundledAvailable
    )
    if (notBundled.length > 0) {
      return {
        success: false,
        error: `Missing bundled files: ${notBundled.map((d) => d.fileName).join(', ')}`
      }
    }
    return { success: true }
  }

  for (const dependency of missing) {
    const result = installDependency(dependency.id)
    if (!result.success) {
      return result
    }
  }

  broadcastSetupChanged()
  return { success: true }
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
    window.webContents.send('setup:openChecklist')
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
    const result = installAllMissingDependencies()
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
  ipcMain.handle('setup:install', (_event, dependencyId: unknown) => {
    if (dependencyId !== 'scripthookv' && dependencyId !== 'asi_loader') {
      return { success: false, error: 'Invalid dependency id.' } satisfies OperationResult
    }
    return installDependency(dependencyId)
  })
  ipcMain.handle('setup:installAll', () => installAllMissingDependencies())
}
