import { randomUUID } from 'crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain, type IpcMainInvokeEvent, type OpenDialogOptions } from 'electron'
import type { OperationResult } from '../shared/game'
import { DEFAULT_GAME_ID } from '../shared/games'
import {
  getProfileLimitsForTier,
  type ModProfileLimits,
  type ModProfileManifest,
  type ModProfileSummary
} from '../shared/modProfiles'
import type { ModImportResult } from '../shared/mods'
import type { SubscriptionTier } from '../shared/profile'
import { installCatalogMod } from './catalogManager'
import {
  getLastDeployedProfileId,
  getSubscriptionTier,
  launchGame,
  setLastDeployedProfileId,
  setSubscriptionTier
} from './gameLauncher'
import { enableMod, importMod, readManifest, undeployAllMods } from './modManager'

const PROFILES_DIR_NAME = 'mod-profiles'
const PROFILE_MANIFEST = 'profile.json'

function getProfilesRoot(): string {
  const root = join(app.getPath('userData'), PROFILES_DIR_NAME)
  if (!existsSync(root)) {
    mkdirSync(root, { recursive: true })
  }
  return root
}

function getProfileDir(profileId: string): string {
  return join(getProfilesRoot(), profileId)
}

function getProfileManifestPath(profileId: string): string {
  return join(getProfileDir(profileId), PROFILE_MANIFEST)
}

function readProfile(profileId: string): ModProfileManifest | null {
  const manifestPath = getProfileManifestPath(profileId)
  if (!existsSync(manifestPath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8')) as ModProfileManifest
  } catch {
    return null
  }
}

function writeProfile(manifest: ModProfileManifest): void {
  const dir = getProfileDir(manifest.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(getProfileManifestPath(manifest.id), JSON.stringify(manifest, null, 2), 'utf-8')
}

function listProfileIds(): string[] {
  const root = getProfilesRoot()
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => existsSync(getProfileManifestPath(id)))
}

function profileToSummary(manifest: ModProfileManifest): ModProfileSummary {
  return {
    id: manifest.id,
    name: manifest.name,
    modCount: manifest.modIds.length,
    createdAt: manifest.createdAt,
    updatedAt: manifest.updatedAt
  }
}

function getLimits(): ModProfileLimits {
  const profiles = listProfiles()
  return getProfileLimitsForTier(getSubscriptionTier(), profiles.length)
}

function assertCanCreateProfile(): OperationResult | null {
  const limits = getLimits()
  if (!limits.canCreateProfile) {
    return {
      success: false,
      error: 'Free tier allows 1 mod profile. Upgrade to Pro for unlimited profiles.'
    }
  }
  return null
}

function assertCanAddMod(profile: ModProfileManifest): OperationResult | null {
  const limits = getLimits()
  if (profile.modIds.length >= limits.maxModsPerProfile) {
    return {
      success: false,
      error: `Free tier allows up to ${limits.maxModsPerProfile} mods per profile. Upgrade to Pro for unlimited mod stacking.`
    }
  }
  return null
}

function broadcastProfilesChanged(): void {
  const payload = listProfiles()
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('profiles:changed', payload)
  }
}

export function listProfiles(): ModProfileSummary[] {
  return listProfileIds()
    .map((id) => readProfile(id))
    .filter((profile): profile is ModProfileManifest => profile !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(profileToSummary)
}

export function createProfile(name: string): { success: boolean; error?: string; profile?: ModProfileSummary } {
  const blocked = assertCanCreateProfile()
  if (blocked) {
    return blocked
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: 'Profile name is required.' }
  }

  const now = new Date().toISOString()
  const manifest: ModProfileManifest = {
    id: randomUUID(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    modIds: []
  }

  writeProfile(manifest)
  broadcastProfilesChanged()
  return { success: true, profile: profileToSummary(manifest) }
}

export async function deleteProfile(profileId: string): Promise<OperationResult> {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  if (getLastDeployedProfileId() === profileId) {
    const undeploy = await undeployAllMods()
    if (!undeploy.success) {
      return undeploy
    }
    setLastDeployedProfileId('')
  }

  rmSync(getProfileDir(profileId), { recursive: true, force: true })
  broadcastProfilesChanged()
  return { success: true }
}

export function renameProfile(profileId: string, name: string): OperationResult {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: 'Profile name is required.' }
  }

  profile.name = trimmed
  profile.updatedAt = new Date().toISOString()
  writeProfile(profile)
  broadcastProfilesChanged()
  return { success: true }
}

export function addModToProfile(profileId: string, modId: string): OperationResult {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  if (!readManifest(modId)) {
    return { success: false, error: 'Mod not found in library.' }
  }

  if (profile.modIds.includes(modId)) {
    return { success: true }
  }

  const blocked = assertCanAddMod(profile)
  if (blocked) {
    return blocked
  }

  profile.modIds.push(modId)
  profile.updatedAt = new Date().toISOString()
  writeProfile(profile)
  broadcastProfilesChanged()
  return { success: true }
}

export function removeModFromProfile(profileId: string, modId: string): OperationResult {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  profile.modIds = profile.modIds.filter((id) => id !== modId)
  profile.updatedAt = new Date().toISOString()
  writeProfile(profile)
  broadcastProfilesChanged()
  return { success: true }
}

export function removeModFromAllProfiles(modId: string): void {
  for (const profileId of listProfileIds()) {
    const profile = readProfile(profileId)
    if (!profile || !profile.modIds.includes(modId)) continue
    profile.modIds = profile.modIds.filter((id) => id !== modId)
    profile.updatedAt = new Date().toISOString()
    writeProfile(profile)
  }
  broadcastProfilesChanged()
}

export async function applyModProfile(profileId: string): Promise<OperationResult> {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  const undeployResult = await undeployAllMods()
  if (!undeployResult.success) {
    return undeployResult
  }

  for (const modId of profile.modIds) {
    const manifest = readManifest(modId)
    if (!manifest) {
      await undeployAllMods()
      return { success: false, error: `Mod "${modId}" is missing from your library.` }
    }

    const result = await enableMod(modId)
    if (!result.success) {
      await undeployAllMods()
      return {
        success: false,
        error: result.error ?? `Failed to deploy "${manifest.name}" for this profile.`
      }
    }
  }

  setLastDeployedProfileId(profileId)
  broadcastProfilesChanged()
  return { success: true }
}

export async function launchModProfile(profileId: string): Promise<OperationResult> {
  const applyResult = await applyModProfile(profileId)
  if (!applyResult.success) {
    return applyResult
  }

  return launchGame()
}

export async function importZipToProfile(
  profileId: string,
  zipPath: string
): Promise<ModImportResult> {
  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  const blocked = assertCanAddMod(profile)
  if (blocked) {
    return blocked
  }

  const importResult = await importMod(zipPath, { gameId: DEFAULT_GAME_ID })
  if (!importResult.success || !importResult.mod) {
    return importResult
  }

  const addResult = addModToProfile(profileId, importResult.mod.id)
  if (!addResult.success) {
    return { success: false, error: addResult.error }
  }

  return importResult
}

export async function installCatalogModToProfile(
  catalogId: string,
  profileId: string,
  gameId?: string
): Promise<ModImportResult> {
  const limits = getLimits()
  if (!limits.autoCatalogInstall) {
    return {
      success: false,
      error: 'One-click catalog install requires Pro. Upgrade or import mods manually via drag-and-drop.'
    }
  }

  const profile = readProfile(profileId)
  if (!profile) {
    return { success: false, error: 'Profile not found.' }
  }

  const blocked = assertCanAddMod(profile)
  if (blocked) {
    return blocked
  }

  const importResult = await installCatalogMod(catalogId, gameId)
  if (!importResult.success || !importResult.mod) {
    return importResult
  }

  const addResult = addModToProfile(profileId, importResult.mod.id)
  if (!addResult.success) {
    return { success: false, error: addResult.error }
  }

  return importResult
}

async function browseImportToProfile(
  event: IpcMainInvokeEvent,
  profileId: string
): Promise<ModImportResult> {
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

  return importZipToProfile(profileId, result.filePaths[0])
}

export function registerModProfileIpc(): void {
  ipcMain.handle('profiles:list', () => listProfiles())
  ipcMain.handle('profiles:getLimits', () => getLimits())
  ipcMain.handle('profiles:get', (_event, profileId: unknown) => {
    if (typeof profileId !== 'string') return null
    return readProfile(profileId)
  })
  ipcMain.handle('profiles:create', (_event, name: unknown) => {
    if (typeof name !== 'string') {
      return { success: false, error: 'Profile name must be a string.' }
    }
    return createProfile(name)
  })
  ipcMain.handle('profiles:delete', (_event, profileId: unknown) => {
    if (typeof profileId !== 'string') {
      return { success: false, error: 'Profile id must be a string.' } satisfies OperationResult
    }
    return deleteProfile(profileId)
  })
  ipcMain.handle('profiles:rename', (_event, profileId: unknown, name: unknown) => {
    if (typeof profileId !== 'string' || typeof name !== 'string') {
      return { success: false, error: 'Invalid rename request.' } satisfies OperationResult
    }
    return renameProfile(profileId, name)
  })
  ipcMain.handle('profiles:addMod', (_event, profileId: unknown, modId: unknown) => {
    if (typeof profileId !== 'string' || typeof modId !== 'string') {
      return { success: false, error: 'Invalid add mod request.' } satisfies OperationResult
    }
    return addModToProfile(profileId, modId)
  })
  ipcMain.handle('profiles:removeMod', (_event, profileId: unknown, modId: unknown) => {
    if (typeof profileId !== 'string' || typeof modId !== 'string') {
      return { success: false, error: 'Invalid remove mod request.' } satisfies OperationResult
    }
    return removeModFromProfile(profileId, modId)
  })
  ipcMain.handle('profiles:apply', (_event, profileId: unknown) => {
    if (typeof profileId !== 'string') {
      return { success: false, error: 'Profile id must be a string.' } satisfies OperationResult
    }
    return applyModProfile(profileId)
  })
  ipcMain.handle('profiles:launch', (_event, profileId: unknown) => {
    if (typeof profileId !== 'string') {
      return { success: false, error: 'Profile id must be a string.' } satisfies OperationResult
    }
    return launchModProfile(profileId)
  })
  ipcMain.handle('profiles:importZip', (_event, profileId: unknown, zipPath: unknown) => {
    if (typeof profileId !== 'string' || typeof zipPath !== 'string') {
      return { success: false, error: 'Invalid import request.' } satisfies ModImportResult
    }
    return importZipToProfile(profileId, zipPath)
  })
  ipcMain.handle('profiles:browseImport', (event, profileId: unknown) => {
    if (typeof profileId !== 'string') {
      return { success: false, error: 'Profile id must be a string.' } satisfies ModImportResult
    }
    return browseImportToProfile(event, profileId)
  })
  ipcMain.handle('profiles:installCatalog', (_event, catalogId: unknown, profileId: unknown, gameId: unknown) => {
    if (typeof catalogId !== 'string' || typeof profileId !== 'string') {
      return { success: false, error: 'Invalid catalog install request.' } satisfies ModImportResult
    }
    return installCatalogModToProfile(
      catalogId,
      profileId,
      typeof gameId === 'string' ? gameId : undefined
    )
  })
  ipcMain.handle('profiles:getActiveId', () => getLastDeployedProfileId())
  ipcMain.handle('app:setSubscriptionTier', (_event, tier: unknown) => {
    if (tier !== 'free' && tier !== 'pro' && tier !== 'elite') {
      return { success: false, error: 'Invalid subscription tier.' } satisfies OperationResult
    }
    setSubscriptionTier(tier as SubscriptionTier)
    broadcastProfilesChanged()
    return { success: true }
  })
}
