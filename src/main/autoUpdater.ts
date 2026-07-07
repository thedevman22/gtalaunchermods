import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateSettings, UpdateStatusPayload } from '../shared/update'
import { isVersionBelow } from '../shared/version'
import { getCatalogMinimumVersion, refreshCatalog } from './catalogManager'
import { getAutoUpdateEnabled, setAutoUpdateEnabled } from './gameLauncher'

const CHECK_INTERVAL_MS = 30 * 60 * 1000
const INITIAL_CHECK_DELAY_MS = 4000

let mainWindow: BrowserWindow | null = null
let checkTimer: NodeJS.Timeout | null = null
let ipcRegistered = false
let lastStatus: UpdateStatusPayload = { status: 'idle' }
let manualCheckInFlight = false
let installAfterDownload = false
let latestAvailableVersion: string | undefined

function isUpdateRequired(): boolean {
  const minimum = getCatalogMinimumVersion()
  if (!minimum) return false
  return isVersionBelow(app.getVersion(), minimum)
}

function enrichStatus(payload: UpdateStatusPayload): UpdateStatusPayload {
  const minimumVersion = getCatalogMinimumVersion()
  const appVersion = app.getVersion()
  const required = isUpdateRequired()

  return {
    ...payload,
    appVersion,
    minimumVersion,
    required,
    autoUpdate: required || getAutoUpdateEnabled()
  }
}

function sendStatus(payload: UpdateStatusPayload): void {
  lastStatus = enrichStatus(payload)
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('update:status-changed', lastStatus)
}

function applyAutoUpdatePreference(): void {
  const force = isUpdateRequired()
  const enabled = force || getAutoUpdateEnabled()
  autoUpdater.autoDownload = enabled
  autoUpdater.autoInstallOnAppQuit = enabled
}

async function checkInBackground(): Promise<void> {
  if (!app.isPackaged) return

  try {
    await refreshCatalog()
  } catch {
    // Catalog refresh must never block update checks.
  }

  applyAutoUpdatePreference()
  recomputeIdleRequiredState()

  try {
    await autoUpdater.checkForUpdates()
  } catch {
    // Silent failure: no internet or GitHub unreachable must never block the app.
  }
}

function recomputeIdleRequiredState(): void {
  if (!isUpdateRequired()) return

  if (lastStatus.status === 'idle' || lastStatus.status === 'error') {
    sendStatus({
      status: lastStatus.status,
      message:
        lastStatus.status === 'error'
          ? lastStatus.message
          : 'An update is required before you can continue using ModHarbor.'
    })
  }
}

export function syncUpdatePolicy(): void {
  if (!app.isPackaged) return
  applyAutoUpdatePreference()
  recomputeIdleRequiredState()
  if (isUpdateRequired() && lastStatus.status === 'available') {
    maybeAutoDownload()
  } else {
    sendStatus(lastStatus)
  }
}

function schedulePeriodicChecks(): void {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
  checkTimer = setInterval(() => {
    void checkInBackground()
  }, CHECK_INTERVAL_MS)
}

function maybeAutoDownload(): void {
  if (!isUpdateRequired()) return
  if (lastStatus.status !== 'available') return

  installAfterDownload = true
  void autoUpdater.downloadUpdate().catch(() => {
    installAfterDownload = false
  })
}

function bindAutoUpdaterEvents(): void {
  autoUpdater.allowDowngrade = false
  applyAutoUpdatePreference()

  autoUpdater.on('checking-for-update', () => {
    sendStatus({ status: 'checking', upToDate: false })
  })

  autoUpdater.on('update-available', (info) => {
    latestAvailableVersion = info.version
    const required = isUpdateRequired()
    const auto = required || getAutoUpdateEnabled()

    sendStatus({
      status: 'available',
      version: info.version,
      upToDate: false,
      message: required
        ? `Required update v${info.version} — download starting…`
        : auto
          ? `Update v${info.version} is downloading in the background…`
          : `Update available — v${info.version}`
    })

    if (required) {
      maybeAutoDownload()
    }
  })

  autoUpdater.on('update-not-available', () => {
    latestAvailableVersion = undefined
    const required = isUpdateRequired()

    sendStatus({
      status: required ? 'error' : 'idle',
      upToDate: !required,
      message: required
        ? 'You must update ModHarbor, but no update could be found. Check your connection and try again.'
        : 'You are on the latest version.'
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendStatus({
      status: 'downloading',
      version: latestAvailableVersion,
      progress: Math.round(progress.percent),
      upToDate: false,
      message: `Downloading update… ${Math.round(progress.percent)}%`
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus({
      status: 'ready',
      version: info.version,
      upToDate: false,
      message: `Update v${info.version} ready — restart to apply.`
    })

    if (installAfterDownload) {
      installAfterDownload = false
      autoUpdater.quitAndInstall(false, true)
    }
  })

  autoUpdater.on('error', (error) => {
    const required = isUpdateRequired()
    if (manualCheckInFlight || required) {
      sendStatus({
        status: 'error',
        upToDate: false,
        message: error.message
      })
    } else {
      sendStatus({
        status: 'idle',
        upToDate: lastStatus.upToDate
      })
    }
  })
}

export function registerUpdateIpc(): void {
  if (ipcRegistered) return
  ipcRegistered = true

  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) {
      return { success: false, error: 'Auto-update is only available in installed builds.' }
    }

    manualCheckInFlight = true
    try {
      await checkInBackground()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sendStatus({ status: 'error', message, upToDate: false })
      return { success: false, error: message }
    } finally {
      manualCheckInFlight = false
    }
  })

  ipcMain.handle('update:download', async () => {
    if (!app.isPackaged) {
      return { success: false, error: 'Auto-update is only available in installed builds.' }
    }

    try {
      applyAutoUpdatePreference()
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sendStatus({ status: 'error', message, upToDate: false })
      return { success: false, error: message }
    }
  })

  ipcMain.handle('update:downloadAndInstall', async () => {
    if (!app.isPackaged) {
      return { success: false, error: 'Auto-update is only available in installed builds.' }
    }

    try {
      applyAutoUpdatePreference()

      if (lastStatus.status === 'ready') {
        autoUpdater.quitAndInstall(false, true)
        return { success: true }
      }

      installAfterDownload = true
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      installAfterDownload = false
      const message = err instanceof Error ? err.message : String(err)
      sendStatus({ status: 'error', message, upToDate: false })
      return { success: false, error: message }
    }
  })

  ipcMain.handle('update:install', () => {
    if (!app.isPackaged) return
    autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('update:getAppVersion', () => app.getVersion())

  ipcMain.handle('update:getSettings', (): UpdateSettings => {
    return { autoUpdate: getAutoUpdateEnabled() }
  })

  ipcMain.handle('update:setAutoUpdate', (_event, enabled: unknown) => {
    setAutoUpdateEnabled(Boolean(enabled))
    applyAutoUpdatePreference()
    sendStatus(lastStatus)
    return { success: true }
  })

  ipcMain.handle('update:getStatus', () => enrichStatus(lastStatus))
}

export function startAutoUpdater(window: BrowserWindow): void {
  if (!app.isPackaged) return

  mainWindow = window
  bindAutoUpdaterEvents()

  setTimeout(() => {
    void checkInBackground()
  }, INITIAL_CHECK_DELAY_MS)
  schedulePeriodicChecks()
}
