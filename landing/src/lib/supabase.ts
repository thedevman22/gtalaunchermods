import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile } from '@shared/profile'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasPlaceholderConfig =
  supabaseUrl?.includes('your-project') || supabaseAnonKey === 'your-anon-key'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !hasPlaceholderConfig
)

let browserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null

  if (typeof window === 'undefined') {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }

  return browserClient
}

export async function fetchUserProfile(userId: string, email: string): Promise<UserProfile> {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (data) {
    return {
      ...(data as UserProfile),
      sync_preferences_enabled: Boolean((data as UserProfile).sync_preferences_enabled ?? false),
      theme_preference: ((data as UserProfile).theme_preference ?? 'dark') as UserProfile['theme_preference'],
      default_install_path: (data as UserProfile).default_install_path ?? null
    }
  }

  if (error) {
    console.warn('Profile fetch failed, creating default:', error.message)
  }

  const { data: created, error: insertError } = await client
    .from('profiles')
    .upsert({
      id: userId,
      email,
      subscription_tier: 'free',
      role_badge: 'Free Member',
      sync_preferences_enabled: false,
      theme_preference: 'dark',
      default_install_path: null
    })
    .select('*')
    .single()

  if (insertError || !created) {
    throw new Error(insertError?.message ?? 'Failed to load user profile.')
  }

  return created as UserProfile
}

export function getAuthCallbackUrl(): string {
  if (typeof window === 'undefined') return '/auth/callback'
  return `${window.location.origin}/auth/callback`
}
