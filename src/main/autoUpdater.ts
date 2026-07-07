import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateSettings, UpdateStatusPayload } from '../shared/update'
import { getAutoUpdateEnabled, setAutoUpdateEnabled } from './gameLauncher'

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000
const INITIAL_CHECK_DELAY_MS = 4000

let mainWindow: BrowserWindow | null = null
let checkTimer: NodeJS.Timeout | null = null
let ipcRegistered = false
let lastStatus: UpdateStatusPayload = { status: 'idle' }
/** True while a user-initiated check is in flight — errors surface only then. */
let manualCheckInFlight = false

function sendStatus(payload: UpdateStatusPayload): void {
  lastStatus = { ...payload, autoUpdate: getAutoUpdateEnabled() }
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('update:status-changed', lastStatus)
}

function applyAutoUpdatePreference(): void {
  const enabled = getAutoUpdateEnabled()
  autoUpdater.autoDownload = enabled
  autoUpdater.autoInstallOnAppQuit = enabled
}

function checkInBackground(): void {
  if (!app.isPackaged) return
  applyAutoUpdatePreference()
  autoUpdater.checkForUpdates().catch(() => {
    // Silent failure: no internet or GitHub unreachable must never block the app.
  })
}

function schedulePeriodicChecks(): void {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
  checkTimer = setInterval(checkInBackground, CHECK_INTERVAL_MS)
}

function bindAutoUpdaterEvents(): void {
  autoUpdater.allowDowngrade = false
  applyAutoUpdatePreference()

  autoUpdater.on('checking-for-update', () => {
    sendStatus({ status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    const auto = getAutoUpdateEnabled()
    sendStatus({
      status: 'available',
      version: info.version,
      message: auto
        ? `Update v${info.version} is downloading in the background…`
        : `Update available — v${info.version}`
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendStatus({ status: 'idle' })
  })

  autoUpdater.on('download-progress', (progress) => {
    sendStatus({
      status: 'downloading',
      progress: Math.round(progress.percent),
      message: `Downloading update… ${Math.round(progress.percent)}%`
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus({
      status: 'ready',
      version: info.version,
      message: `Update v${info.version} ready — restart to apply.`
    })
  })

  autoUpdater.on('error', (error) => {
    // Background failures stay silent; only surface errors for manual checks.
    if (manualCheckInFlight) {
      sendStatus({ status: 'error', message: error.message })
    } else {
      sendStatus({ status: 'idle' })
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
      applyAutoUpdatePreference()
      await autoUpdater.checkForUpdates()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sendStatus({ status: 'error', message })
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
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      sendStatus({ status: 'error', message })
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
    // Re-broadcast so open UI reflects the new mode immediately.
    sendStatus(lastStatus)
    return { success: true }
  })

  ipcMain.handle('update:getStatus', () => lastStatus)
}

export function startAutoUpdater(window: BrowserWindow): void {
  if (!app.isPackaged) return

  mainWindow = window
  bindAutoUpdaterEvents()

  setTimeout(checkInBackground, INITIAL_CHECK_DELAY_MS)
  schedulePeriodicChecks()
}
