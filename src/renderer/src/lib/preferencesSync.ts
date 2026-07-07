import type { ThemePreference } from '../../../shared/profile'
import type { UserPreferences } from '../../../shared/sync'
import { supabase } from './supabase'

export function applyThemePreference(theme: ThemePreference): void {
  document.documentElement.dataset.theme = theme
}

export async function updateProfilePreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  if (!supabase) {
    return
  }

  const { error } = await supabase.from('profiles').update(preferences).eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function applySyncedPreferences(
  preferences: Pick<UserPreferences, 'theme_preference' | 'default_install_path'>
): Promise<void> {
  applyThemePreference(preferences.theme_preference)

  if (preferences.default_install_path) {
    const result = await window.api.game.setPath(preferences.default_install_path)
    if (!result.success && result.error) {
      console.warn('Could not apply synced install path:', result.error)
    }
  }
}
