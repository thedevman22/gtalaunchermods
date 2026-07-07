import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CatalogModCard from '@renderer/components/CatalogModCard'
import CatalogSidebar from '@renderer/components/CatalogSidebar'
import InstalledModRow from '@renderer/components/InstalledModRow'
import MissingModsDialog from '@renderer/components/MissingModsDialog'
import MotionButton from '@renderer/components/MotionButton'
import SetupChecklist from '@renderer/components/SetupChecklist'
import { useModSync } from '@renderer/context/ModSyncContext'
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
    if (!setupStatus?.modsAllowed) return
    void loadCatalog()
    return window.api.mods.onChanged((payload) => {
      setInstalledMods(
        payload.mods.filter(
          (mod) => mod.gameId === activeGameId || (!mod.gameId && activeGameId === DEFAULT_GAME_ID)
        )
      )
      void window.api.catalog.getInstalledMap(activeGameId).then(setInstalledMap)
    })
  }, [activeGameId, loadCatalog, setupStatus?.modsAllowed])

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
    setBusyCatalogId(catalogId)
    setError(null)
    try {
      const result = await window.api.catalog.install(catalogId, activeGameId)
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
        return
      }
      if (result.mod?.catalogId) {
        await syncModInstalled(result.mod.catalogId, result.mod.enabled)
      }
      await loadCatalog()
    } finally {
      setBusyCatalogId(null)
    }
  }

  const handleToggle = async (modId: string, enabled: boolean): Promise<void> => {
    setBusyModId(modId)
    setError(null)
    try {
      const mod = modById.get(modId)
      const result = enabled
        ? await window.api.mods.enableMod(modId)
        : await window.api.mods.disableMod(modId)
      if (!result.success) {
        setError(result.error ?? 'Failed to update mod.')
        return
      }
      if (mod?.catalogId) {
        await syncModEnabled(mod.catalogId, enabled)
      }
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
      await loadCatalog()
    } finally {
      setBusyModId(null)
    }
  }

  const handleBrowseImport = async (): Promise<void> => {
    setImporting(true)
    setError(null)
    try {
      const result = await window.api.mods.browseImport()
      if (!result.success && result.error && result.error !== 'Import canceled.') {
        setError(result.error)
      }
      await loadCatalog()
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

  if (!setupStatus.modsAllowed) {
    return (
      <SetupChecklist
        onComplete={() => void loadSetup()}
        onNavigateSettings={onNavigateSettings}
      />
    )
  }

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] min-h-0 flex-col">
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
      <header className="shrink-0 border-b border-launcher-border/60 bg-launcher-bg/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-launcher-text">
              {game?.catalogTitle ?? 'Mod Catalog'}
            </h2>
            <p className="mt-1 text-sm text-launcher-muted">
              {game?.catalogSubtitle ?? 'Browse mods or manage your installed library.'}
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
                    ? 'bg-launcher-accent/15 text-launcher-accent shadow-[inset_0_0_0_1px_rgba(0,230,118,0.2)]'
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

          <div className="min-w-0 flex-1 overflow-y-auto p-4">
            {filteredCatalog.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-launcher-border bg-launcher-surface/30 p-12 text-center">
                <p className="text-sm text-launcher-muted">No mods match your search or filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <motion.div
                  key={`${activeCategory}-${searchQuery}`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
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
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-launcher-muted">
              {installedMods.length} installed mod{installedMods.length === 1 ? '' : 's'}
            </p>
            <MotionButton
              disabled={importing}
              onClick={() => void handleBrowseImport()}
              className="rounded-xl border border-launcher-accent/40 bg-launcher-accent/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-launcher-accent hover:bg-launcher-accent/20 disabled:opacity-50"
            >
              {importing ? 'Importing…' : 'Import .zip'}
            </MotionButton>
          </div>

          {installedMods.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-launcher-border bg-launcher-surface/30 px-6 py-16 text-center">
              <p className="text-sm text-launcher-muted">
                No mods installed yet. Browse the catalog or import a .zip archive.
              </p>
              <MotionButton
                onClick={() => setActiveTab('browse')}
                className="mt-4 rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg"
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
              className="space-y-2"
            >
              {installedMods.map((mod) => (
                <InstalledModRow
                  key={mod.id}
                  mod={mod}
                  busy={busyModId === mod.id || importing}
                  onToggleMod={(modId, enabled) => void handleToggle(modId, enabled)}
                  onDelete={(modId) => void handleDelete(modId)}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
