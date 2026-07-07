import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '../../../shared/profile'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

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
    return data as UserProfile
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
      role_badge: 'Free Member'
    })
    .select('*')
    .single()

  if (insertError || !created) {
    throw new Error(insertError?.message ?? 'Failed to load user profile.')
  }

  return created as UserProfile
}
