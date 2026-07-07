import { existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

/**
 * Bundled Script Hook V / ASI Loader DLLs.
 * - Packaged: `process.resourcesPath/dependencies` (electron-builder extraResources)
 * - Dev: project `resources/dependencies`
 */
export function getDependenciesPath(): string {
  if (app.isPackaged) {
    const extraResourcesDir = join(process.resourcesPath, 'dependencies')
    if (existsSync(extraResourcesDir)) {
      return extraResourcesDir
    }

    // Fallback for older builds that only unpacked into asar.
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'dependencies')
  }

  const fromAppPath = join(app.getAppPath(), 'resources', 'dependencies')
  if (existsSync(fromAppPath)) {
    return fromAppPath
  }

  return join(__dirname, '../../resources/dependencies')
}
