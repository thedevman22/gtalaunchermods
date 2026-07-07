import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { get as httpGet } from 'http'
import { get as httpsGet } from 'https'
import { join } from 'path'
import { app, ipcMain, shell } from 'electron'
import type { CatalogMod, CatalogResult } from '../shared/catalog'
import { DEFAULT_GAME_ID, resolveGameId } from '../shared/games'
import type { ModImportResult } from '../shared/mods'
import { assertModsAllowed } from './dependencyManager'
import { findModByCatalogId, importMod, listMods } from './modManager'

function getCatalogPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'catalog', 'mods.json')
  }
  return join(__dirname, '../../resources/catalog/mods.json')
}

function readCatalogFile(): CatalogMod[] {
  const catalogPath = getCatalogPath()
  if (!existsSync(catalogPath)) {
    return []
  }

  try {
    const parsed = JSON.parse(readFileSync(catalogPath, 'utf-8')) as { mods?: CatalogMod[] }
    return parsed.mods ?? []
  } catch {
    return []
  }
}

export function loadCatalog(gameId?: string): CatalogResult {
  const resolvedGameId = resolveGameId(gameId)
  const mods = readCatalogFile().filter((mod) => mod.game_id === resolvedGameId)
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
