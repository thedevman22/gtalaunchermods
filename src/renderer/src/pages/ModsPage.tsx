import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CatalogModCard from '@renderer/components/CatalogModCard'
import CatalogSidebar from '@renderer/components/CatalogSidebar'
import InstalledModRow from '@renderer/components/InstalledModRow'
import MissingModsDialog from '@renderer/components/MissingModsDialog'
import ModDropZone from '@renderer/components/ModDropZone'
import MotionButton from '@renderer/components/MotionButton'
import SetupChecklist from '@renderer/components/SetupChecklist'
import { useModSync } from '@renderer/context/ModSyncContext'
import { useProfiles } from '@renderer/context/ProfileContext'
import { useAuth } from '@renderer/context/AuthContext'
import { staggerContainer } from '@renderer/lib/motion'
import type { CatalogMod, ModCategory } from '../../../shared/catalog'
import { DEFAULT_GAME_ID, getGameDefinition } from '../../../shared/games'
import type { ModSummary } from '../../../preload/index.d'
import type { SetupStatus } from '../../../shared/dependencies'

type ModsTab = 'browse' | 'my-mods'

interface ModsPageProps {
  onNavigateSettings?: () => void
}

export default function ModsPage({ onNavigateSettings }: ModsPageProps): React.JSX.Element {
  const activeGameId = DEFAULT_GAME_ID
  const game = getGameDefinition(activeGameId)
  const { isPremium } = useAuth()
  const { profiles, selectedProfileId, selectedProfile, refreshProfiles } = useProfiles()
  const {
    missingMods,
    reconciling,
    syncModInstalled,
    syncModEnabled,
    syncModRemoved,
    downloadMissingMod,
    downloadAllMissing,
    dismissMissingMods
  } = useModSync()
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [activeTab, setActiveTab] = useState<ModsTab>('browse')
  const [catalogMods, setCatalogMods] = useState<CatalogMod[]>([])
  const [installedMods, setInstalledMods] = useState<ModSummary[]>([])
  const [installedMap, setInstalledMap] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState<ModCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [busyCatalogId, setBusyCatalogId] = useState<string | null>(null)
  const [busyModId, setBusyModId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [syncBusy, setSyncBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileModIds, setProfileModIds] = useState<Set<string>>(new Set())

  const loadProfileMods = useCallback(async (profileId: string): Promise<void> => {
    const profile = await window.api.profiles.get(profileId)
    setProfileModIds(new Set(profile?.modIds ?? []))
  }, [])

  const loadSetup = useCallback(async (): Promise<void> => {
    setSetupStatus(await window.api.setup.getStatus())
  }, [])

  const loadCatalog = useCallback(async (): Promise<void> => {
    const [catalog, map, library] = await Promise.all([
      window.api.catalog.getMods(activeGameId),
      window.api.catalog.getInstalledMap(activeGameId),
      window.api.mods.list(activeGameId)
    ])
    setCatalogMods(catalog.mods)
    setInstalledMap(map)
    setInstalledMods(library.mods)
  }, [activeGameId])

  useEffect(() => {
    void loadSetup()
    return window.api.setup.onChanged(setSetupStatus)
  }, [loadSetup])

  useEffect(() => {
    if (!selectedProfileId) {
      setProfileModIds(new Set())
      return
    }
    void loadProfileMods(selectedProfileId)
  }, [selectedProfileId, profiles, loadProfileMods])

  const profileMode = Boolean(selectedProfileId)
  const gamePathMissing = setupStatus !== null && !setupStatus.gamePathConfigured

  useEffect(() => {
    if (!setupStatus) return
    void loadCatalog()
    const unsubMods = window.api.mods.onChanged((payload) => {
      setInstalledMods(
        payload.mods.filter(
          (mod) => mod.gameId === activeGameId || (!mod.gameId && activeGameId === DEFAULT_GAME_ID)
        )
      )
      void window.api.catalog.getInstalledMap(activeGameId).then(setInstalledMap)
    })
    const unsubCatalog = window.api.catalog.onChanged(() => {
      void loadCatalog()
    })
    return () => {
      unsubMods()
      unsubCatalog()
    }
  }, [activeGameId, loadCatalog, setupStatus])

  const modById = useMemo(() => {
    return new Map(installedMods.map((mod) => [mod.id, mod]))
  }, [installedMods])

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return catalogMods.filter((mod) => {
      if (activeCategory !== 'all' && mod.category !== activeCategory) {
        return false
      }
      if (!query) {
        return true
      }
      return (
        mod.name.toLowerCase().includes(query) ||
        mod.author.toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query)
      )
    })
  }, [activeCategory, catalogMods, searchQuery])

  const handleCatalogInstall = async (catalogId: string): Promise<void> => {
    if (!selectedProfileId) {
      setError('Create a mod profile on Home first.')
      return
    }

    setBusyCatalogId(catalogId)
    setError(null)
    try {
      const catalogMod = catalogMods.find((mod) => mod.id === catalogId)
      if (catalogMod?.source === 'external_link') {
        const result = await window.api.catalog.install(catalogId, activeGameId)
        if (!result.success) {
          setError(result.error ?? 'Install failed.')
        }
        return
      }

      if (!isPremium) {
        setError('One-click catalog install requires Pro. Import mods via drag-and-drop on Home.')
        return
      }

      const result = await window.api.profiles.installCatalog(catalogId, selectedProfileId, activeGameId)
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
        return
      }

      if (result.mod?.catalogId) {
        await syncModInstalled(result.mod.catalogId, false)
      }
      await loadCatalog()
      await refreshProfiles()
      if (selectedProfileId) {
        await loadProfileMods(selectedProfileId)
      }
    } finally {
      setBusyCatalogId(null)
    }
  }

  const handleToggle = async (modId: string, enabled: boolean): Promise<void> => {
    if (!selectedProfileId) {
      setError('Create a mod profile on Home first.')
      return
    }

    setBusyModId(modId)
    setError(null)
    try {
      const mod = modById.get(modId)
      const result = enabled
        ? await window.api.profiles.addMod(selectedProfileId, modId)
        : await window.api.profiles.removeMod(selectedProfileId, modId)
      if (!result.success) {
        setError(result.error ?? 'Failed to update profile.')
        return
      }
      if (mod?.catalogId) {
        await syncModEnabled(mod.catalogId, enabled)
      }
      await refreshProfiles()
      await loadProfileMods(selectedProfileId)
      await loadCatalog()
    } finally {
      setBusyModId(null)
    }
  }

  const handleDelete = async (modId: string): Promise<void> => {
    const mod = modById.get(modId)
    if (!mod) return
    if (!window.confirm(`Delete "${mod.name}" from your library?`)) return

    setBusyModId(modId)
    setError(null)
    try {
      const result = await window.api.mods.deleteMod(modId)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete mod.')
        return
      }
      if (mod.catalogId) {
        await syncModRemoved(mod.catalogId)
      }
      await refreshProfiles()
      if (selectedProfileId) {
        await loadProfileMods(selectedProfileId)
      }
      await loadCatalog()
    } finally {
      setBusyModId(null)
    }
  }

  const handleBrowseImport = async (): Promise<void> => {
    setImporting(true)
    setError(null)
    try {
      if (selectedProfileId) {
        const result = await window.api.profiles.browseImport(selectedProfileId)
        if (!result.success && result.error && result.error !== 'Import canceled.') {
          setError(result.error)
        }
      } else {
        const result = await window.api.mods.browseImport()
        if (!result.success && result.error && result.error !== 'Import canceled.') {
          setError(result.error)
        }
      }
      await loadCatalog()
      await refreshProfiles()
      if (selectedProfileId) {
        await loadProfileMods(selectedProfileId)
      }
    } finally {
      setImporting(false)
    }
  }

  const handleImportZip = async (zipPath: string): Promise<void> => {
    setImporting(true)
    setError(null)
    try {
      const result = selectedProfileId
        ? await window.api.profiles.importZip(selectedProfileId, zipPath)
        : await window.api.mods.importMod(zipPath)
      if (!result.success && result.error) {
        setError(result.error)
      }
      await loadCatalog()
      await refreshProfiles()
      if (selectedProfileId) {
        await loadProfileMods(selectedProfileId)
      }
    } finally {
      setImporting(false)
    }
  }

  if (!setupStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-launcher-muted">Loading setup…</span>
      </div>
    )
  }

  // Deps missing but the game folder is known — show the checklist as before.
  // With no game folder at all (skipped setup) the catalog stays browsable and
  // only install/enable actions are locked.
  if (setupStatus.gamePathConfigured && !setupStatus.modsAllowed) {
    return (
      <div className="h-full overflow-y-auto px-10 py-10">
        <SetupChecklist
          onComplete={() => void loadSetup()}
          onNavigateSettings={onNavigateSettings}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MissingModsDialog
        mods={missingMods}
        busy={syncBusy || reconciling}
        onDownloadAll={() => {
          setSyncBusy(true)
          void downloadAllMissing()
            .catch((err) => setError(err instanceof Error ? err.message : 'Download failed.'))
            .finally(() => {
              setSyncBusy(false)
              void loadCatalog()
            })
        }}
        onDownloadOne={(modId) => {
          setSyncBusy(true)
          void downloadMissingMod(modId)
            .catch((err) => setError(err instanceof Error ? err.message : 'Download failed.'))
            .finally(() => {
              setSyncBusy(false)
              void loadCatalog()
            })
        }}
        onDismiss={dismissMissingMods}
      />
      <header className="shrink-0 border-b border-launcher-border/60 bg-launcher-bg/80 px-8 py-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="type-title">{game?.catalogTitle ?? 'Mod Catalog'}</h2>
            <p className="type-body mt-1.5">
              {selectedProfile ? (
                <>
                  Adding to{' '}
                  <span className="font-semibold text-launcher-accent">{selectedProfile.name}</span>
                </>
              ) : (
                (game?.catalogSubtitle ?? 'Browse mods or manage your installed library.')
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-launcher-border bg-launcher-elevated/60 p-1">
            {(
              [
                ['browse', 'Browse'],
                ['my-mods', 'My Mods']
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                  activeTab === id
                    ? 'bg-launcher-accent/15 text-launcher-accent shadow-[inset_0_0_0_1px_var(--color-launcher-glow)]'
                    : 'text-launcher-muted hover:text-launcher-text'
                ].join(' ')}
              >
                {label}
                {id === 'my-mods' && installedMods.length > 0 ? (
                  <span className="ml-2 rounded-full bg-launcher-accent/20 px-1.5 py-0.5 text-[10px]">
                    {installedMods.length}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </header>

      {activeTab === 'browse' ? (
        <div className="flex min-h-0 flex-1">
          <CatalogSidebar
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onCategoryChange={setActiveCategory}
            onSearchChange={setSearchQuery}
            resultCount={filteredCatalog.length}
          />

          <div className="min-w-0 flex-1 overflow-y-auto p-6">
            {filteredCatalog.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-launcher-border bg-launcher-surface/30 p-12 text-center">
                <p className="type-body">No mods match your search or filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  key={`${activeCategory}-${searchQuery}`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {filteredCatalog.map((mod) => {
                    const libraryModId = installedMap[mod.id]
                    const libraryMod = libraryModId ? modById.get(libraryModId) : undefined
                    return (
                      <CatalogModCard
                        key={mod.id}
                        mod={mod}
                        installed={Boolean(libraryModId)}
                        enabled={libraryMod?.enabled ?? false}
                        busy={busyCatalogId === mod.id || busyModId === libraryModId}
                        libraryModId={libraryModId}
                        installLocked={!isPremium && mod.source !== 'external_link'}
                        profileMode={profileMode}
                        inProfile={libraryModId ? profileModIds.has(libraryModId) : false}
                        actionsLocked={gamePathMissing}
                        onInstall={(catalogId) => void handleCatalogInstall(catalogId)}
                        onToggleMod={(modId, enabled) => void handleToggle(modId, enabled)}
                      />
                    )
                  })}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto w-full max-w-4xl space-y-8">
            {installedMods.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-launcher-border bg-launcher-surface/30 px-6 py-16 text-center">
                <p className="type-body">
                  No mods installed yet. Browse the catalog or import a .zip archive below.
                </p>
                <MotionButton
                  onClick={() => setActiveTab('browse')}
                  className="btn-primary mt-6"
                >
                  Browse catalog
                </MotionButton>
              </div>
            ) : (
              <motion.div
                key="installed-list"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {installedMods.map((mod) => (
                  <InstalledModRow
                    key={mod.id}
                    mod={mod}
                    busy={busyModId === mod.id || importing}
                    profileMode={profileMode}
                    inProfile={profileModIds.has(mod.id)}
                    actionsLocked={gamePathMissing}
                    onToggleMod={(modId, enabled) => void handleToggle(modId, enabled)}
                    onDelete={(modId) => void handleDelete(modId)}
                  />
                ))}
              </motion.div>
            )}

            <section>
              <h3 className="type-section mb-4">Import mods</h3>
              <ModDropZone
                busy={importing}
                onImport={handleImportZip}
                onBrowse={handleBrowseImport}
                autoInstall={false}
                onAutoInstallChange={() => undefined}
                isPremium={isPremium}
                disabled={gamePathMissing}
                disabledReason="Set your game folder first"
              />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
