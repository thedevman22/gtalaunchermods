import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { get as httpGet } from 'http'
import { get as httpsGet } from 'https'
import { join } from 'path'
import { app, ipcMain, shell } from 'electron'
import type { CatalogMod, CatalogResult } from '../shared/catalog'
import type { ModImportResult } from '../shared/mods'
import { assertModsAllowed } from './dependencyManager'
import { findModByCatalogId, importMod, listMods } from './modManager'

function getCatalogPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'catalog', 'mods.json')
  }
  return join(__dirname, '../../resources/catalog/mods.json')
}

export function loadCatalog(): CatalogResult {
  const catalogPath = getCatalogPath()
  if (!existsSync(catalogPath)) {
    return { mods: [] }
  }

  try {
    const parsed = JSON.parse(readFileSync(catalogPath, 'utf-8')) as CatalogResult
    return { mods: parsed.mods ?? [] }
  } catch {
    return { mods: [] }
  }
}

function findCatalogMod(catalogId: string): CatalogMod | undefined {
  return loadCatalog().mods.find((mod) => mod.id === catalogId)
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

export async function installCatalogMod(catalogId: string): Promise<ModImportResult> {
  const blocked = assertModsAllowed()
  if (blocked) {
    return blocked
  }

  const catalogMod = findCatalogMod(catalogId)
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
        catalogId: existing.catalogId
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
  ipcMain.handle('catalog:getMods', () => loadCatalog())
  ipcMain.handle('catalog:install', (_event, catalogId: unknown) => {
    if (typeof catalogId !== 'string') {
      return { success: false, error: 'Catalog id must be a string.' } satisfies ModImportResult
    }
    return installCatalogMod(catalogId)
  })
  ipcMain.handle('catalog:getInstalledMap', () => {
    const installed: Record<string, string> = {}
    for (const mod of listMods().mods) {
      if (mod.catalogId) {
        installed[mod.catalogId] = mod.id
      }
    }
    return installed
  })
}
