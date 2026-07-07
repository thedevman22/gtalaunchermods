import { useCallback, useEffect, useMemo, useState } from 'react'
import ModCard from '@renderer/components/ModCard'
import ModDropZone from '@renderer/components/ModDropZone'
import SetupChecklist from '@renderer/components/SetupChecklist'
import UpgradePrompt from '@renderer/components/UpgradePrompt'
import { useAuth } from '@renderer/context/AuthContext'
import type { ModSummary } from '../../../preload/index.d'
import type { SetupStatus } from '../../../shared/dependencies'

type Filter = 'all' | 'enabled' | 'disabled'

interface ModsPageProps {
  onNavigateToAccount?: () => void
  onNavigateSettings?: () => void
}

export default function ModsPage({
  onNavigateToAccount,
  onNavigateSettings
}: ModsPageProps): React.JSX.Element {
  const { isPremium } = useAuth()
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [mods, setMods] = useState<ModSummary[]>([])
  const [libraryPath, setLibraryPath] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [busyModId, setBusyModId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [batchBusy, setBatchBusy] = useState(false)
  const [autoInstall, setAutoInstall] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMods = useCallback(async (): Promise<void> => {
    const result = await window.api.mods.list()
    setMods(result.mods)
    setLibraryPath(result.libraryPath)
  }, [])

  const loadSetup = useCallback(async (): Promise<void> => {
    const status = await window.api.setup.getStatus()
    setSetupStatus(status)
  }, [])

  useEffect(() => {
    void loadSetup()
    const unsubscribe = window.api.setup.onChanged(setSetupStatus)
    return unsubscribe
  }, [loadSetup])

  useEffect(() => {
    if (!setupStatus?.modsAllowed) return
    void loadMods()
    const unsubscribe = window.api.mods.onChanged((payload) => {
      setMods(payload.mods)
      setLibraryPath(payload.libraryPath)
    })
    return unsubscribe
  }, [loadMods, setupStatus?.modsAllowed])

  const filteredMods = useMemo(() => {
    if (filter === 'enabled') return mods.filter((mod) => mod.enabled)
    if (filter === 'disabled') return mods.filter((mod) => !mod.enabled)
    return mods
  }, [filter, mods])

  const handleImport = async (zipPath: string, withAutoInstall = false): Promise<void> => {
    setImporting(true)
    setError(null)
    try {
      const result = await window.api.mods.importMod(zipPath)
      if (!result.success) {
        setError(result.error ?? 'Failed to import mod.')
        return
      }

      if (withAutoInstall && result.mod) {
        const enableResult = await window.api.mods.enableMod(result.mod.id)
        if (!enableResult.success) {
          setError(enableResult.error ?? 'Imported but auto-install failed.')
        }
      }

      await loadMods()
    } finally {
      setImporting(false)
    }
  }

  const handleBrowseImport = async (): Promise<void> => {
    setImporting(true)
    setError(null)
    try {
      const result = await window.api.mods.browseImport()
      if (!result.success) {
        if (result.error && result.error !== 'Import canceled.') {
          setError(result.error)
        }
        return
      }

      if (autoInstall && isPremium && result.mod) {
        const enableResult = await window.api.mods.enableMod(result.mod.id)
        if (!enableResult.success) {
          setError(enableResult.error ?? 'Imported but auto-install failed.')
        }
      }

      await loadMods()
    } finally {
      setImporting(false)
    }
  }

  const handleToggle = async (modId: string, enabled: boolean): Promise<void> => {
    setBusyModId(modId)
    setError(null)
    try {
      const result = enabled
        ? await window.api.mods.enableMod(modId)
        : await window.api.mods.disableMod(modId)
      if (!result.success) {
        setError(result.error ?? 'Failed to update mod.')
        return
      }
      await loadMods()
    } finally {
      setBusyModId(null)
    }
  }

  const handleDelete = async (modId: string): Promise<void> => {
    const mod = mods.find((entry) => entry.id === modId)
    if (!mod) return

    const confirmed = window.confirm(`Delete "${mod.name}" from your mod library?`)
    if (!confirmed) return

    setBusyModId(modId)
    setError(null)
    try {
      const result = await window.api.mods.deleteMod(modId)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete mod.')
        return
      }
      await loadMods()
    } finally {
      setBusyModId(null)
    }
  }

  const handleBatchEnable = async (): Promise<void> => {
    setBatchBusy(true)
    setError(null)
    try {
      for (const mod of mods.filter((entry) => !entry.enabled)) {
        const result = await window.api.mods.enableMod(mod.id)
        if (!result.success) {
          setError(result.error ?? `Failed to enable ${mod.name}.`)
          break
        }
      }
      await loadMods()
    } finally {
      setBatchBusy(false)
    }
  }

  const handleBatchDisable = async (): Promise<void> => {
    setBatchBusy(true)
    setError(null)
    try {
      for (const mod of mods.filter((entry) => entry.enabled)) {
        const result = await window.api.mods.disableMod(mod.id)
        if (!result.success) {
          setError(result.error ?? `Failed to disable ${mod.name}.`)
          break
        }
      }
      await loadMods()
    } finally {
      setBatchBusy(false)
    }
  }

  const handleDropImport = async (zipPath: string): Promise<void> => {
    await handleImport(zipPath, autoInstall && isPremium)
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
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold text-launcher-text">Mods</h2>
        <p className="mt-1 text-sm text-launcher-muted">
          Import mod archives into your library, then enable them to deploy into GTA V.
        </p>
        {libraryPath && (
          <p className="mt-2 font-mono text-[10px] text-launcher-muted/70">Library: {libraryPath}</p>
        )}
      </header>

      <ModDropZone
        busy={importing}
        onImport={handleDropImport}
        onBrowse={handleBrowseImport}
        autoInstall={autoInstall}
        onAutoInstallChange={setAutoInstall}
        isPremium={isPremium}
        onUpgrade={onNavigateToAccount}
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(
            [
              ['all', 'All'],
              ['enabled', 'Enabled'],
              ['disabled', 'Disabled']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                filter === id
                  ? 'bg-launcher-accent/15 text-launcher-accent'
                  : 'text-launcher-muted hover:bg-launcher-elevated hover:text-launcher-text'
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPremium ? (
            <>
              <button
                type="button"
                disabled={batchBusy || importing || mods.every((mod) => mod.enabled)}
                onClick={() => void handleBatchEnable()}
                className="rounded-lg border border-launcher-accent/40 bg-launcher-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent transition-colors hover:bg-launcher-accent/20 disabled:opacity-50"
              >
                Enable All
              </button>
              <button
                type="button"
                disabled={batchBusy || importing || mods.every((mod) => !mod.enabled)}
                onClick={() => void handleBatchDisable()}
                className="rounded-lg border border-launcher-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted transition-colors hover:border-launcher-accent/40 hover:text-launcher-accent disabled:opacity-50"
              >
                Disable All
              </button>
            </>
          ) : (
            <UpgradePrompt feature="Batch enable / disable" onUpgrade={onNavigateToAccount} compact />
          )}
          <span className="text-xs text-launcher-muted">
            {filteredMods.length} mod{filteredMods.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {!isPremium && mods.length > 0 && (
        <UpgradePrompt
          feature="Unlock one-click auto-install and batch mod controls"
          onUpgrade={onNavigateToAccount}
        />
      )}

      {filteredMods.length === 0 ? (
        <div className="rounded-xl border border-launcher-border bg-launcher-surface/40 px-6 py-12 text-center">
          <p className="text-sm text-launcher-muted">
            {mods.length === 0
              ? 'No mods imported yet. Drop a .zip above to get started.'
              : 'No mods match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMods.map((mod) => (
            <ModCard
              key={mod.id}
              mod={mod}
              busy={busyModId === mod.id || importing || batchBusy}
              onToggle={(modId, enabled) => void handleToggle(modId, enabled)}
              onDelete={(modId) => void handleDelete(modId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
