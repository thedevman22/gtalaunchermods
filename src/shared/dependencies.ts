export type DependencyId = 'scripthookv' | 'asi_loader'

export interface DependencyDefinition {
  id: DependencyId
  fileName: string
  name: string
  description: string
}

export interface DependencyStatus {
  id: DependencyId
  fileName: string
  name: string
  description: string
  installedInGame: boolean
  bundledAvailable: boolean
  gamePath?: string
  /** Human-readable result for the checklist UI. */
  statusLabel: string
  /** Set when the most recent install attempt for this file failed. */
  lastInstallError?: string
}

export interface SetupStatus {
  gamePathConfigured: boolean
  gameRoot?: string
  dependencies: DependencyStatus[]
  setupComplete: boolean
  modsAllowed: boolean
}

export interface DependencyInstallOutcome {
  id: DependencyId
  fileName: string
  success: boolean
  error?: string
  path?: string
  permissionDenied?: boolean
}

export interface SetupRepairResult {
  success: boolean
  error?: string
  outcomes: DependencyInstallOutcome[]
}

export const PERMISSION_DENIED_MESSAGE =
  'ModHarbor could not write to your GTA V folder. If the game is installed under Program Files, close ModHarbor, right-click it, and choose "Run as administrator", then try again.'

export const REQUIRED_DEPENDENCIES: DependencyDefinition[] = [
  {
    id: 'scripthookv',
    fileName: 'ScriptHookV.dll',
    name: 'Script Hook V',
    description: 'Core framework required by most GTA V story-mode mods and trainers.'
  },
  {
    id: 'asi_loader',
    fileName: 'dinput8.dll',
    name: 'ASI Loader',
    description: 'Loads ASI plugins from your GTA V root folder (OpenIV ASI Loader).'
  }
]
