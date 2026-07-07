import type { GameEdition, GameId } from './games'

export interface UserModRecord {
  user_id: string
  mod_id: string
  enabled: boolean
  installed_at: string
}

export type ThemePreference = 'dark' | 'light'

export interface UserPreferences {
  sync_preferences_enabled: boolean
  theme_preference: ThemePreference
  default_install_path: string | null
  game_id: GameId | null
  game_edition: GameEdition | null
}

export interface MissingCloudMod {
  modId: string
  name: string
  enabled: boolean
  installedAt: string
}

export interface ModReconcileResult {
  missingMods: MissingCloudMod[]
  enabledStateUpdates: number
}
