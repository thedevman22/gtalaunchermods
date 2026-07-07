import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '../../../shared/profile'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const hasPlaceholderConfig =
  supabaseUrl?.includes('your-project') || supabaseAnonKey === 'your-anon-key'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !hasPlaceholderConfig
)

/** Lets you use the launcher locally without a Supabase project during development. */
export const isOfflineDevMode = import.meta.env.DEV && !isSupabaseConfigured

export const OFFLINE_DEV_PROFILE: UserProfile = {
  id: 'offline-dev-user',
  email: 'dev@local',
  subscription_tier: 'free',
  role_badge: 'Free Member',
  created_at: new Date().toISOString(),
  sync_preferences_enabled: false,
  theme_preference: 'light',
  default_install_path: null,
  game_id: 'gta5',
  game_edition: 'legacy'
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null

export async function fetchUserProfile(userId: string, email: string): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (data) {
    return {
      ...(data as UserProfile),
      sync_preferences_enabled: Boolean((data as UserProfile).sync_preferences_enabled ?? false),
      theme_preference: ((data as UserProfile).theme_preference ?? 'light') as UserProfile['theme_preference'],
      default_install_path: (data as UserProfile).default_install_path ?? null,
      game_id: (data as UserProfile).game_id ?? 'gta5',
      game_edition: (data as UserProfile).game_edition ?? 'legacy'
    }
  }

  if (error) {
    console.warn('Profile fetch failed, creating default:', error.message)
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      subscription_tier: 'free',
      role_badge: 'Free Member',
      sync_preferences_enabled: false,
      theme_preference: 'light',
      default_install_path: null,
      game_id: 'gta5',
      game_edition: 'legacy'
    })
    .select('*')
    .single()

  if (insertError || !created) {
    throw new Error(insertError?.message ?? 'Failed to load user profile.')
  }

  return created as UserProfile
}
