import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, watch, writeFileSync } from 'fs'
import { get as httpGet } from 'http'
import { get as httpsGet } from 'https'
import { join } from 'path'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { CatalogMeta, CatalogMod, CatalogResult } from '../shared/catalog'
import { DEFAULT_GAME_ID, resolveGameId } from '../shared/games'
import type { ModImportResult } from '../shared/mods'
import { assertModsAllowed } from './dependencyManager'
import { findModByCatalogId, importMod, listMods } from './modManager'

const CATALOG_URL = (process.env.VITE_CATALOG_URL ?? '').trim()

function getBundledCatalogPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'catalog', 'mods.json')
  }
  return join(__dirname, '../../resources/catalog/mods.json')
}

function getCacheDir(): string {
  return join(app.getPath('userData'), 'catalog-cache')
}

function getCacheModsPath(): string {
  return join(getCacheDir(), 'mods.json')
}

function getCacheMetaPath(): string {
  return join(getCacheDir(), 'meta.json')
}

let activeMods: CatalogMod[] = []
let catalogMeta: CatalogMeta = { refreshedAt: null, source: 'bundled', minimumVersion: null }

function parseCatalogFile(text: string): { mods: CatalogMod[]; minimumVersion: string | null } {
  const parsed = JSON.parse(text) as { mods?: CatalogMod[]; minimum_version?: string }
  const minimumVersion = parsed.minimum_version?.trim() || null
  return {
    mods: parsed.mods ?? [],
    minimumVersion
  }
}

function readBundledCatalog(): { mods: CatalogMod[]; minimumVersion: string | null } {
  const catalogPath = getBundledCatalogPath()
  if (!existsSync(catalogPath)) {
    return { mods: [], minimumVersion: null }
  }

  try {
    return parseCatalogFile(readFileSync(catalogPath, 'utf-8'))
  } catch {
    return { mods: [], minimumVersion: null }
  }
}

function readDiskCache(): { mods: CatalogMod[]; meta: CatalogMeta } | null {
  const modsPath = getCacheModsPath()
  if (!existsSync(modsPath)) {
    return null
  }

  try {
    const file = parseCatalogFile(readFileSync(modsPath, 'utf-8'))
    let meta: CatalogMeta = {
      refreshedAt: null,
      source: 'cache',
      minimumVersion: file.minimumVersion
    }
    const metaPath = getCacheMetaPath()
    if (existsSync(metaPath)) {
      const stored = JSON.parse(readFileSync(metaPath, 'utf-8')) as CatalogMeta
      meta = { ...stored, source: 'cache', minimumVersion: file.minimumVersion ?? stored.minimumVersion ?? null }
    }
    return { mods: file.mods, meta }
  } catch {
    return null
  }
}

function writeDiskCache(mods: CatalogMod[], minimumVersion: string | null): CatalogMeta {
  const cacheDir = getCacheDir()
  mkdirSync(cacheDir, { recursive: true })
  const meta: CatalogMeta = {
    refreshedAt: new Date().toISOString(),
    source: 'remote',
    minimumVersion
  }
  writeFileSync(
    getCacheModsPath(),
    JSON.stringify({ mods, minimum_version: minimumVersion }, null, 2),
    'utf-8'
  )
  writeFileSync(getCacheMetaPath(), JSON.stringify(meta), 'utf-8')
  return meta
}

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = url.startsWith('https://') ? httpsGet : httpGet

    request(url, (response) => {
      const status = response.statusCode ?? 0

      if (status >= 300 && status < 400 && response.headers.location) {
        fetchText(response.headers.location).then(resolve).catch(reject)
        return
      }

      if (status !== 200) {
        reject(new Error(`Catalog fetch failed with HTTP ${status}`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      response.on('error', reject)
    }).on('error', reject)
  })
}

function notifyCatalogChanged(): void {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('catalog:changed')
  }
}

function applyCatalog(mods: CatalogMod[], meta: CatalogMeta): CatalogMeta {
  activeMods = mods
  catalogMeta = meta
  notifyCatalogChanged()
  void import('./autoUpdater').then(({ syncUpdatePolicy }) => syncUpdatePolicy())
  return meta
}

function loadFromCacheOrBundled(): CatalogMeta {
  const disk = readDiskCache()
  if (disk) {
    return applyCatalog(disk.mods, disk.meta)
  }

  const bundled = readBundledCatalog()
  return applyCatalog(bundled.mods, {
    refreshedAt: null,
    source: 'bundled',
    minimumVersion: bundled.minimumVersion
  })
}

export async function refreshCatalog(): Promise<CatalogMeta> {
  if (CATALOG_URL) {
    try {
      const text = await fetchText(CATALOG_URL)
      const file = parseCatalogFile(text)
      const meta = writeDiskCache(file.mods, file.minimumVersion)
      return applyCatalog(file.mods, meta)
    } catch (err) {
      console.warn('Remote catalog fetch failed, using cache or bundled fallback:', err)
    }
  }

  return loadFromCacheOrBundled()
}

export async function initCatalog(): Promise<CatalogMeta> {
  return refreshCatalog()
}

export function getCatalogMeta(): CatalogMeta {
  return catalogMeta
}

export function getCatalogMinimumVersion(): string | null {
  return catalogMeta.minimumVersion
}

function getActiveMods(): CatalogMod[] {
  if (activeMods.length === 0) {
    loadFromCacheOrBundled()
  }
  return activeMods
}

export function loadCatalog(gameId?: string): CatalogResult {
  const resolvedGameId = resolveGameId(gameId)
  const mods = getActiveMods().filter((mod) => mod.game_id === resolvedGameId)
  return { game_id: resolvedGameId, mods }
}

function findCatalogMod(catalogId: string, gameId?: string): CatalogMod | undefined {
  return loadCatalog(gameId).mods.find((mod) => mod.id === catalogId)
}

function downloadFile(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = url.startsWith('https://') ? httpsGet : httpGet

    request(url, (response) => {
      const status = response.statusCode ?? 0

      if (status >= 300 && status < 400 && response.headers.location) {
        downloadFile(response.headers.location, destination).then(resolve).catch(reject)
        return
      }

      if (status !== 200) {
        reject(new Error(`Download failed with HTTP ${status}`))
        return
      }

      const fileStream = createWriteStream(destination)
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })
      fileStream.on('error', reject)
    }).on('error', reject)
  })
}

export async function installCatalogMod(
  catalogId: string,
  gameId?: string
): Promise<ModImportResult> {
  const blocked = assertModsAllowed()
  if (blocked) {
    return blocked
  }

  const resolvedGameId = resolveGameId(gameId)
  const catalogMod = findCatalogMod(catalogId, resolvedGameId)
  if (!catalogMod) {
    return { success: false, error: 'Catalog mod not found.' }
  }

  if (catalogMod.source === 'external_link') {
    await shell.openExternal(catalogMod.download_url)
    return { success: true }
  }

  if (catalogMod.status === 'coming_soon') {
    return { success: false, error: 'This mod is not available yet.' }
  }

  const existing = findModByCatalogId(catalogId)
  if (existing) {
    return {
      success: true,
      mod: {
        id: existing.id,
        name: existing.name,
        author: existing.author,
        version: existing.version,
        description: existing.description,
        enabled: existing.enabled,
        importedAt: existing.importedAt,
        catalogId: existing.catalogId,
        gameId: existing.gameId
      }
    }
  }

  const downloadsDir = join(app.getPath('userData'), 'catalog-downloads')
  mkdirSync(downloadsDir, { recursive: true })

  const zipPath = join(downloadsDir, `${catalogId}.zip`)

  try {
    await downloadFile(catalogMod.download_url, zipPath)
    const result = await importMod(zipPath, {
      catalogId: catalogMod.id,
      gameId: catalogMod.game_id,
      name: catalogMod.name,
      author: catalogMod.author,
      description: catalogMod.description,
      version: catalogMod.version ?? '1.0.0'
    })
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to download mod: ${message}` }
  } finally {
    if (existsSync(zipPath)) {
      rmSync(zipPath, { force: true })
    }
  }
}

export function registerCatalogIpc(): void {
  ipcMain.handle('catalog:getMods', (_event, gameId: unknown) => {
    if (gameId !== undefined && typeof gameId !== 'string') {
      return loadCatalog(DEFAULT_GAME_ID)
    }
    return loadCatalog(typeof gameId === 'string' ? gameId : DEFAULT_GAME_ID)
  })

  ipcMain.handle('catalog:getMeta', () => getCatalogMeta())

  ipcMain.handle('catalog:refresh', () => refreshCatalog())

  ipcMain.handle('catalog:install', (_event, catalogId: unknown, gameId: unknown) => {
    if (typeof catalogId !== 'string') {
      return { success: false, error: 'Catalog id must be a string.' } satisfies ModImportResult
    }
    const resolvedGameId = typeof gameId === 'string' ? gameId : DEFAULT_GAME_ID
    return installCatalogMod(catalogId, resolvedGameId)
  })

  ipcMain.handle('catalog:getInstalledMap', (_event, gameId: unknown) => {
    const resolvedGameId = typeof gameId === 'string' ? resolveGameId(gameId) : DEFAULT_GAME_ID
    const installed: Record<string, string> = {}
    for (const mod of listMods(resolvedGameId).mods) {
      if (mod.catalogId) {
        installed[mod.catalogId] = mod.id
      }
    }
    return installed
  })
}

export function registerCatalogWatcher(): void {
  if (!is.dev || CATALOG_URL) return

  const catalogPath = getBundledCatalogPath()
  if (!existsSync(catalogPath)) return

  watch(catalogPath, () => {
    const bundled = readBundledCatalog()
    activeMods = bundled.mods
    catalogMeta = { refreshedAt: null, source: 'bundled', minimumVersion: bundled.minimumVersion }
    notifyCatalogChanged()
  })
}
