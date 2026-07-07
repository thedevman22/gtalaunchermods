import { randomUUID } from 'crypto'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'fs'
import { copyFile, symlink, unlink } from 'fs/promises'
import { basename, dirname, extname, join, relative } from 'path'
import AdmZip from 'adm-zip'
import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type OpenDialogOptions } from 'electron'
import type { OperationResult } from '../shared/game'
import type {
  ModDeployedFile,
  ModImportResult,
  ModListResult,
  ModManifest,
  ModSummary
} from '../shared/mods'
import { getResolvedGamePath, validateGamePath } from './gameLauncher'
import { assertModsAllowed } from './dependencyManager'

const LIBRARY_DIR_NAME = 'mods-library'
const MANIFEST_FILE = 'manifest.json'
const SOURCE_DIR = 'source'
const THUMBNAIL_FILE = 'thumbnail.png'

const SKIP_DEPLOY_FILES = new Set(
  [
    'manifest.json',
    'mod.json',
    'meta.json',
    'readme.txt',
    'readme.md',
    'thumbnail.png',
    'icon.png',
    'preview.jpg',
    'preview.png',
    '.ds_store',
    'thumbs.db'
  ].map((name) => name.toLowerCase())
)

const THUMBNAIL_CANDIDATES = [
  'thumbnail.png',
  'thumbnail.jpg',
  'icon.png',
  'preview.jpg',
  'preview.png',
  'thumb.png'
]

function getLibraryRoot(): string {
  const root = join(app.getPath('userData'), LIBRARY_DIR_NAME)
  if (!existsSync(root)) {
    mkdirSync(root, { recursive: true })
  }
  return root
}

function getModDir(modId: string): string {
  return join(getLibraryRoot(), modId)
}

function getManifestPath(modId: string): string {
  return join(getModDir(modId), MANIFEST_FILE)
}

function readManifest(modId: string): ModManifest | null {
  const manifestPath = getManifestPath(modId)
  if (!existsSync(manifestPath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8')) as ModManifest
  } catch {
    return null
  }
}

function writeManifest(modId: string, manifest: ModManifest): void {
  const modDir = getModDir(modId)
  if (!existsSync(modDir)) {
    mkdirSync(modDir, { recursive: true })
  }
  writeFileSync(getManifestPath(modId), JSON.stringify(manifest, null, 2), 'utf-8')
}

function listModIds(): string[] {
  const libraryRoot = getLibraryRoot()
  return readdirSync(libraryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => existsSync(getManifestPath(id)))
}

function shouldSkipDeploy(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, '/')
  const parts = normalized.split('/')

  if (parts.some((part) => part === '__MACOSX' || part.startsWith('.'))) {
    return true
  }

  const fileName = basename(normalized).toLowerCase()
  return SKIP_DEPLOY_FILES.has(fileName)
}

function walkFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    const relPath = relative(baseDir, fullPath).replace(/\\/g, '/')

    if (entry.isDirectory()) {
      if (entry.name === '__MACOSX') continue
      files.push(...walkFiles(fullPath, baseDir))
    } else if (entry.isFile()) {
      if (!shouldSkipDeploy(relPath)) {
        files.push(relPath)
      }
    }
  }

  return files
}

function flattenSingleRootFolder(sourceDir: string): void {
  const entries = readdirSync(sourceDir, { withFileTypes: true }).filter(
    (entry) => entry.name !== '__MACOSX'
  )
  const directories = entries.filter((entry) => entry.isDirectory())
  const files = entries.filter((entry) => entry.isFile())

  if (directories.length !== 1 || files.length > 0) {
    return
  }

  const nestedDir = join(sourceDir, directories[0].name)
  cpSync(nestedDir, sourceDir, { recursive: true })
  rmSync(nestedDir, { recursive: true, force: true })
}

function parseModMetadata(sourceDir: string, fallbackName: string): Omit<ModManifest, 'id' | 'enabled' | 'importedAt' | 'deployedFiles'> {
  const metaFiles = ['mod.json', 'meta.json']
  for (const metaFile of metaFiles) {
    const metaPath = join(sourceDir, metaFile)
    if (!existsSync(metaPath)) continue

    try {
      const parsed = JSON.parse(readFileSync(metaPath, 'utf-8')) as Record<string, unknown>
      return {
        name: String(parsed.name ?? parsed.title ?? fallbackName),
        author: String(parsed.author ?? parsed.creator ?? 'Unknown'),
        version: String(parsed.version ?? '1.0.0'),
        description: String(parsed.description ?? '')
      }
    } catch {
      // Fall through to defaults
    }
  }

  return {
    name: fallbackName,
    author: 'Unknown',
    version: '1.0.0',
    description: ''
  }
}

function extractThumbnail(sourceDir: string, modDir: string): void {
  for (const candidate of THUMBNAIL_CANDIDATES) {
    const candidatePath = join(sourceDir, candidate)
    if (!existsSync(candidatePath)) continue

    copyFileSync(candidatePath, join(modDir, THUMBNAIL_FILE))
    return
  }
}

function loadThumbnailDataUrl(modId: string): string | undefined {
  const thumbnailPath = join(getModDir(modId), THUMBNAIL_FILE)
  if (!existsSync(thumbnailPath)) {
    return undefined
  }

  const ext = extname(thumbnailPath).toLowerCase()
  const mime =
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png'
  const data = readFileSync(thumbnailPath)
  return `data:${mime};base64,${data.toString('base64')}`
}

function manifestToSummary(manifest: ModManifest): ModSummary {
  return {
    id: manifest.id,
    name: manifest.name,
    author: manifest.author,
    version: manifest.version,
    description: manifest.description,
    enabled: manifest.enabled,
    importedAt: manifest.importedAt,
    thumbnailDataUrl: loadThumbnailDataUrl(manifest.id)
  }
}

function resolveDeployTarget(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  const fileName = parts[parts.length - 1]
  const ext = extname(fileName).toLowerCase()
  const rootFolder = parts[0]?.toLowerCase()

  const preservedFolders = ['mods', 'scripts', 'update', 'x64']
  if (rootFolder && preservedFolders.includes(rootFolder)) {
    return normalized
  }

  if (ext === '.asi' || ext === '.dll') {
    return fileName
  }

  return normalized
}

async function deployFile(sourcePath: string, targetPath: string): Promise<'copy' | 'symlink'> {
  const targetDir = dirname(targetPath)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  if (process.platform === 'win32') {
    try {
      await symlink(sourcePath, targetPath, 'file')
      return 'symlink'
    } catch {
      await copyFile(sourcePath, targetPath)
      return 'copy'
    }
  }

  try {
    await symlink(sourcePath, targetPath)
    return 'symlink'
  } catch {
    await copyFile(sourcePath, targetPath)
    return 'copy'
  }
}

async function removeDeployedFile(gameRoot: string, file: ModDeployedFile): Promise<void> {
  const targetPath = join(gameRoot, file.target)
  if (!existsSync(targetPath)) {
    return
  }

  await unlink(targetPath)

  let dir = dirname(targetPath)
  while (dir.startsWith(gameRoot) && dir !== gameRoot) {
    try {
      const entries = readdirSync(dir)
      if (entries.length > 0) break
      rmSync(dir)
      dir = dirname(dir)
    } catch {
      break
    }
  }
}

async function rollbackDeploy(gameRoot: string, deployedFiles: ModDeployedFile[]): Promise<void> {
  for (const file of [...deployedFiles].reverse()) {
    try {
      await removeDeployedFile(gameRoot, file)
    } catch {
      // Best-effort rollback
    }
  }
}

function getGameRootOrError(): { gameRoot: string } | { error: string } {
  const gtaExePath = getResolvedGamePath()
  const validation = validateGamePath(gtaExePath)
  if (!validation.valid || !validation.gameRoot) {
    return { error: validation.error ?? 'GTA V path is not configured.' }
  }
  return { gameRoot: validation.gameRoot }
}

export function getModsLibraryPath(): string {
  return getLibraryRoot()
}

export function listMods(): ModListResult {
  const mods = listModIds()
    .map((id) => readManifest(id))
    .filter((manifest): manifest is ModManifest => manifest !== null)
    .sort((a, b) => b.importedAt.localeCompare(a.importedAt))
    .map((manifest) => manifestToSummary(manifest))

  return {
    libraryPath: getLibraryRoot(),
    mods
  }
}

export async function importMod(zipPath: string): Promise<ModImportResult> {
  const blocked = assertModsAllowed()
  if (blocked) {
    return blocked
  }

  if (!zipPath?.trim()) {
    return { success: false, error: 'No zip file path provided.' }
  }

  if (!existsSync(zipPath)) {
    return { success: false, error: `Zip file not found: ${zipPath}` }
  }

  if (!zipPath.toLowerCase().endsWith('.zip')) {
    return { success: false, error: 'Only .zip mod archives are supported.' }
  }

  const modId = randomUUID()
  const modDir = getModDir(modId)
  const sourceDir = join(modDir, SOURCE_DIR)

  try {
    mkdirSync(sourceDir, { recursive: true })

    const zip = new AdmZip(zipPath)
    zip.extractAllTo(sourceDir, true)
    flattenSingleRootFolder(sourceDir)

    const deployableFiles = walkFiles(sourceDir)
    if (deployableFiles.length === 0) {
      throw new Error('Zip archive contains no deployable mod files.')
    }

    const fallbackName = basename(zipPath, extname(zipPath))
    const metadata = parseModMetadata(sourceDir, fallbackName)
    extractThumbnail(sourceDir, modDir)

    const manifest: ModManifest = {
      id: modId,
      ...metadata,
      enabled: false,
      importedAt: new Date().toISOString(),
      deployedFiles: []
    }

    writeManifest(modId, manifest)
    broadcastModsChanged()

    return { success: true, mod: manifestToSummary(manifest) }
  } catch (err) {
    rmSync(modDir, { recursive: true, force: true })
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to import mod: ${message}` }
  }
}

export async function enableMod(modId: string): Promise<OperationResult> {
  const blocked = assertModsAllowed()
  if (blocked) {
    return blocked
  }

  const manifest = readManifest(modId)
  if (!manifest) {
    return { success: false, error: 'Mod not found.' }
  }

  if (manifest.enabled) {
    return { success: true }
  }

  const gamePathResult = getGameRootOrError()
  if ('error' in gamePathResult) {
    return { success: false, error: gamePathResult.error }
  }

  const { gameRoot } = gamePathResult
  const sourceRoot = join(getModDir(modId), SOURCE_DIR)
  if (!existsSync(sourceRoot)) {
    return { success: false, error: 'Mod source files are missing from the library.' }
  }

  const relativeFiles = walkFiles(sourceRoot)
  const deployedFiles: ModDeployedFile[] = []

  try {
    for (const relFile of relativeFiles) {
      const sourceFile = join(sourceRoot, relFile)
      const targetRel = resolveDeployTarget(relFile)
      const targetFile = join(gameRoot, targetRel)

      if (existsSync(targetFile)) {
        throw new Error(`Cannot enable mod: "${targetRel}" already exists in the GTA V directory.`)
      }

      const method = await deployFile(sourceFile, targetFile)
      deployedFiles.push({ source: relFile, target: targetRel.replace(/\\/g, '/'), method })
    }

    manifest.deployedFiles = deployedFiles
    manifest.enabled = true
    writeManifest(modId, manifest)
    broadcastModsChanged()

    return { success: true }
  } catch (err) {
    await rollbackDeploy(gameRoot, deployedFiles)
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

export async function disableMod(modId: string): Promise<OperationResult> {
  const manifest = readManifest(modId)
  if (!manifest) {
    return { success: false, error: 'Mod not found.' }
  }

  if (!manifest.enabled) {
    return { success: true }
  }

  const gamePathResult = getGameRootOrError()
  if ('error' in gamePathResult) {
    return { success: false, error: gamePathResult.error }
  }

  const { gameRoot } = gamePathResult

  try {
    for (const file of [...manifest.deployedFiles].reverse()) {
      await removeDeployedFile(gameRoot, file)
    }

    manifest.deployedFiles = []
    manifest.enabled = false
    writeManifest(modId, manifest)
    broadcastModsChanged()

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to disable mod: ${message}` }
  }
}

export async function deleteMod(modId: string): Promise<OperationResult> {
  const manifest = readManifest(modId)
  if (!manifest) {
    return { success: false, error: 'Mod not found.' }
  }

  if (manifest.enabled) {
    const disableResult = await disableMod(modId)
    if (!disableResult.success) {
      return disableResult
    }
  }

  try {
    rmSync(getModDir(modId), { recursive: true, force: true })
    broadcastModsChanged()
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `Failed to delete mod: ${message}` }
  }
}

function broadcastModsChanged(): void {
  const payload = listMods()
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('mods:changed', payload)
  }
}

async function browseImportMod(event: IpcMainInvokeEvent): Promise<ModImportResult> {
  const parentWindow = BrowserWindow.fromWebContents(event.sender)
  const dialogOptions: OpenDialogOptions = {
    title: 'Import Mod Archive',
    properties: ['openFile'],
    filters: [{ name: 'Mod Archive', extensions: ['zip'] }]
  }

  const result = parentWindow
    ? await dialog.showOpenDialog(parentWindow, dialogOptions)
    : await dialog.showOpenDialog(dialogOptions)

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, error: 'Import canceled.' }
  }

  return importMod(result.filePaths[0])
}

export function registerModManagerIpc(): void {
  ipcMain.handle('mods:getLibraryPath', () => getModsLibraryPath())
  ipcMain.handle('mods:list', () => listMods())
  ipcMain.handle('mods:import', (_event, zipPath: unknown) => {
    if (typeof zipPath !== 'string') {
      return { success: false, error: 'Zip path must be a string.' } satisfies ModImportResult
    }
    return importMod(zipPath)
  })
  ipcMain.handle('mods:browseImport', (event) => browseImportMod(event))
  ipcMain.handle('mods:enable', (_event, modId: unknown) => {
    if (typeof modId !== 'string') {
      return { success: false, error: 'Mod id must be a string.' } satisfies OperationResult
    }
    return enableMod(modId)
  })
  ipcMain.handle('mods:disable', (_event, modId: unknown) => {
    if (typeof modId !== 'string') {
      return { success: false, error: 'Mod id must be a string.' } satisfies OperationResult
    }
    return disableMod(modId)
  })
  ipcMain.handle('mods:delete', (_event, modId: unknown) => {
    if (typeof modId !== 'string') {
      return { success: false, error: 'Mod id must be a string.' } satisfies OperationResult
    }
    return deleteMod(modId)
  })
}
