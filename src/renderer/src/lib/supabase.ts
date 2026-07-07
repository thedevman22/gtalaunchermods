import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '../../../shared/profile'

/** Inlined from .env (dev) or process.env (CI) at compile time via Vite — never read at runtime. */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const websiteUrl = import.meta.env.VITE_MODHARBOR_WEBSITE_URL ?? ''
export const billingApiUrl = import.meta.env.VITE_BILLING_API_URL ?? ''

const hasPlaceholderConfig =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project') ||
  supabaseAnonKey === 'your-anon-key' ||
  supabaseAnonKey.startsWith('your-')

export const isSupabaseConfigured = !hasPlaceholderConfig

/** True when env still has the example values from .env.example (dev diagnostics only). */
export const hasPlaceholderSupabaseConfig = hasPlaceholderConfig

export const supabaseConfigErrorMessage = import.meta.env.DEV
  ? 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.'
  : 'Connection error — please reinstall or contact support.'

/** Lets you use the launcher locally without a Supabase project during development. */
export const isOfflineDevMode = import.meta.env.DEV && !isSupabaseConfigured

export const OFFLINE_DEV_PROFILE: UserProfile = {
  id: 'offline-dev-user',
  email: 'dev@local',
  subscription_tier: 'free',
  role_badge: 'Free Member',
  created_at: new Date().toISOString(),
  sync_preferences_enabled: false,
  theme_preference: 'dark',
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
    throw new Error(supabaseConfigErrorMessage)
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (data) {
    return {
      ...(data as UserProfile),
      sync_preferences_enabled: Boolean((data as UserProfile).sync_preferences_enabled ?? false),
      theme_preference: ((data as UserProfile).theme_preference ?? 'dark') as UserProfile['theme_preference'],
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
      theme_preference: 'dark',
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
