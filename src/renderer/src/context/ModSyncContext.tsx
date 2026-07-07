import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import type { CatalogMod } from '../../../shared/catalog'
import type { MissingCloudMod, ModReconcileResult, UserPreferences } from '../../../shared/sync'
import { DEFAULT_GAME_ID } from '../../../shared/games'
import { useAuth } from '@renderer/context/AuthContext'
import { isOfflineDevMode } from '@renderer/lib/supabase'
import { applySyncedPreferences } from '@renderer/lib/preferencesSync'
import { fetchUserMods, removeUserMod, upsertUserMod } from '@renderer/lib/userModsSync'

interface ModSyncContextValue {
  missingMods: MissingCloudMod[]
  reconciling: boolean
  syncModInstalled: (catalogModId: string, enabled?: boolean) => Promise<void>
  syncModEnabled: (catalogModId: string, enabled: boolean) => Promise<void>
  syncModRemoved: (catalogModId: string) => Promise<void>
  downloadMissingMod: (catalogModId: string) => Promise<void>
  downloadAllMissing: () => Promise<void>
  dismissMissingMods: () => void
  reconcile: () => Promise<ModReconcileResult | null>
}

const ModSyncContext = createContext<ModSyncContextValue | null>(null)

function catalogNameForId(catalog: CatalogMod[], modId: string): string {
  return catalog.find((entry) => entry.id === modId)?.name ?? modId
}

export function ModSyncProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { user, profile, isOfflineDev } = useAuth()
  const [missingMods, setMissingMods] = useState<MissingCloudMod[]>([])
  const [reconciling, setReconciling] = useState(false)
  const lastReconciledUserId = useRef<string | null>(null)

  const reconcile = useCallback(async (): Promise<ModReconcileResult | null> => {
    if (isOfflineDevMode || isOfflineDev || !user) {
      return null
    }

    setReconciling(true)
    try {
      const [cloudMods, catalog, library] = await Promise.all([
        fetchUserMods(user.id),
        window.api.catalog.getMods(DEFAULT_GAME_ID),
        window.api.mods.list(DEFAULT_GAME_ID)
      ])

      const localByCatalogId = new Map(
        library.mods
          .filter((mod) => mod.catalogId)
          .map((mod) => [mod.catalogId as string, mod])
      )

      const missing: MissingCloudMod[] = []
      let enabledStateUpdates = 0

      for (const cloudMod of cloudMods) {
        const catalogEntry = catalog.mods.find((entry) => entry.id === cloudMod.mod_id)
        if (!catalogEntry || catalogEntry.source !== 'hosted') {
          continue
        }

        const localMod = localByCatalogId.get(cloudMod.mod_id)
        if (!localMod) {
          missing.push({
            modId: cloudMod.mod_id,
            name: catalogNameForId(catalog.mods, cloudMod.mod_id),
            enabled: cloudMod.enabled,
            installedAt: cloudMod.installed_at
          })
          continue
        }

        if (localMod.enabled !== cloudMod.enabled) {
          const result = cloudMod.enabled
            ? await window.api.mods.enableMod(localMod.id)
            : await window.api.mods.disableMod(localMod.id)
          if (result.success) {
            enabledStateUpdates += 1
          }
        }
      }

      setMissingMods(missing)
      return { missingMods: missing, enabledStateUpdates }
    } finally {
      setReconciling(false)
    }
  }, [isOfflineDev, user])

  useEffect(() => {
    if (!user || isOfflineDev) {
      setMissingMods([])
      lastReconciledUserId.current = null
      return
    }

    if (lastReconciledUserId.current === user.id) {
      return
    }

    lastReconciledUserId.current = user.id

    void (async () => {
      if (profile?.sync_preferences_enabled) {
        await applySyncedPreferences({
          theme_preference: profile.theme_preference,
          default_install_path: profile.default_install_path,
          game_id: profile.game_id as UserPreferences['game_id'],
          game_edition: profile.game_edition as UserPreferences['game_edition']
        })
      }
      await reconcile()
    })()
  }, [
    user,
    isOfflineDev,
    profile?.sync_preferences_enabled,
    profile?.theme_preference,
    profile?.default_install_path,
    profile?.game_id,
    profile?.game_edition,
    reconcile
  ])

  const syncModInstalled = useCallback(
    async (catalogModId: string, enabled = false): Promise<void> => {
      if (!user || isOfflineDev) return
      await upsertUserMod(user.id, catalogModId, enabled)
    },
    [isOfflineDev, user]
  )

  const syncModEnabled = useCallback(
    async (catalogModId: string, enabled: boolean): Promise<void> => {
      if (!user || isOfflineDev) return
      await upsertUserMod(user.id, catalogModId, enabled)
    },
    [isOfflineDev, user]
  )

  const syncModRemoved = useCallback(
    async (catalogModId: string): Promise<void> => {
      if (!user || isOfflineDev) return
      await removeUserMod(user.id, catalogModId)
    },
    [isOfflineDev, user]
  )

  const downloadMissingMod = useCallback(
    async (catalogModId: string): Promise<void> => {
      const result = await window.api.catalog.install(catalogModId, DEFAULT_GAME_ID)
      if (!result.success) {
        throw new Error(result.error ?? 'Download failed.')
      }

      const cloudMod = missingMods.find((mod) => mod.modId === catalogModId)
      if (cloudMod?.enabled && result.mod) {
        await window.api.mods.enableMod(result.mod.id)
      }

      if (user && !isOfflineDev) {
        await upsertUserMod(
          user.id,
          catalogModId,
          cloudMod?.enabled ?? false,
          cloudMod?.installedAt
        )
      }

      setMissingMods((current) => current.filter((mod) => mod.modId !== catalogModId))
    },
    [isOfflineDev, missingMods, user]
  )

  const downloadAllMissing = useCallback(async (): Promise<void> => {
    for (const mod of [...missingMods]) {
      await downloadMissingMod(mod.modId)
    }
  }, [downloadMissingMod, missingMods])

  const dismissMissingMods = useCallback((): void => {
    setMissingMods([])
  }, [])

  const value = useMemo<ModSyncContextValue>(
    () => ({
      missingMods,
      reconciling,
      syncModInstalled,
      syncModEnabled,
      syncModRemoved,
      downloadMissingMod,
      downloadAllMissing,
      dismissMissingMods,
      reconcile
    }),
    [
      missingMods,
      reconciling,
      syncModInstalled,
      syncModEnabled,
      syncModRemoved,
      downloadMissingMod,
      downloadAllMissing,
      dismissMissingMods,
      reconcile
    ]
  )

  return <ModSyncContext.Provider value={value}>{children}</ModSyncContext.Provider>
}

export function useModSync(): ModSyncContextValue {
  const context = useContext(ModSyncContext)
  if (!context) {
    throw new Error('useModSync must be used within ModSyncProvider.')
  }
  return context
}
