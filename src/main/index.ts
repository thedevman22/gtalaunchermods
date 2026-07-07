import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerGameLauncherIpc } from './gameLauncher'
import { registerModManagerIpc } from './modManager'
import { registerAuthBridgeIpc } from './authBridge'
import { registerCatalogIpc, registerCatalogWatcher, initCatalog } from './catalogManager'
import { registerDependencyManagerIpc } from './dependencyManager'
import { registerUpdateIpc, startAutoUpdater } from './autoUpdater'
import { registerOnboardingIpc } from './onboardingManager'
import { registerModProfileIpc } from './modProfileManager'

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#16181c',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  window.on('ready-to-show', () => {
    window.show()
    void import('./dependencyManager').then(({ promptMissingDependenciesInstall }) => {
      void promptMissingDependenciesInstall(window)
    })
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (app.isPackaged) {
    startAutoUpdater(window)
  }

  return window
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.modharbor.app')
  registerGameLauncherIpc()
  registerModManagerIpc()
  registerCatalogIpc()
  await initCatalog()
  registerCatalogWatcher()
  registerAuthBridgeIpc()
  registerDependencyManagerIpc()
  registerOnboardingIpc()
  registerModProfileIpc()
  registerUpdateIpc()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
