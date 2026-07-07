import type { UserModRecord } from '../../../shared/sync'
import { supabase } from './supabase'

function normalizeProfileRow(data: Record<string, unknown>): UserModRecord {
  return {
    user_id: String(data.user_id),
    mod_id: String(data.mod_id),
    enabled: Boolean(data.enabled),
    installed_at: String(data.installed_at)
  }
}

export async function fetchUserMods(userId: string): Promise<UserModRecord[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('user_mods')
    .select('user_id, mod_id, enabled, installed_at')
    .eq('user_id', userId)
    .order('installed_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => normalizeProfileRow(row as Record<string, unknown>))
}

export async function upsertUserMod(
  userId: string,
  modId: string,
  enabled: boolean,
  installedAt?: string
): Promise<void> {
  if (!supabase) {
    return
  }

  const { error } = await supabase.from('user_mods').upsert(
    {
      user_id: userId,
      mod_id: modId,
      enabled,
      installed_at: installedAt ?? new Date().toISOString()
    },
    { onConflict: 'user_id,mod_id' }
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function removeUserMod(userId: string, modId: string): Promise<void> {
  if (!supabase) {
    return
  }

  const { error } = await supabase.from('user_mods').delete().eq('user_id', userId).eq('mod_id', modId)

  if (error) {
    throw new Error(error.message)
  }
}
