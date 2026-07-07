import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateStatusPayload } from '../shared/update'

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

let mainWindow: BrowserWindow | null = null
let checkTimer: NodeJS.Timeout | null = null
let ipcRegistered = false

function sendStatus(payload: UpdateStatusPayload): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('update:status-changed', payload)
}

function schedulePeriodicChecks(): void {
  if (checkTimer) {
    clearInterval(checkTimer)
  }
  checkTimer = setInterval(() => {
    void autoUpdater.checkForUpdates()
  }, CHECK_INTERVAL_MS)
}

function bindAutoUpdaterEvents(): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowDowngrade = false

  autoUpdater.on('checking-for-update', () => {
    sendStatus({ status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    sendStatus({
      status: 'available',
      version: info.version,
      message: `Update v${info.version} is downloading…`
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
      message: `Update v${info.version} is ready. Restart to install.`
    })
  })

  autoUpdater.on('error', (error) => {
    sendStatus({
      status: 'error',
      message: error.message
    })
  })
}

export function registerUpdateIpc(): void {
  if (ipcRegistered) return
  ipcRegistered = true

  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) {
      return { success: false, error: 'Auto-update is only available in installed builds.' }
    }

    try {
      await autoUpdater.checkForUpdates()
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
}

export function startAutoUpdater(window: BrowserWindow): void {
  if (!app.isPackaged) return

  mainWindow = window
  bindAutoUpdaterEvents()

  setTimeout(() => {
    void autoUpdater.checkForUpdates()
  }, 4000)

  schedulePeriodicChecks()
}
