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
}

export interface SetupStatus {
  gamePathConfigured: boolean
  gameRoot?: string
  dependencies: DependencyStatus[]
  setupComplete: boolean
  modsAllowed: boolean
}

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
