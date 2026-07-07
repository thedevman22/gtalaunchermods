import { useCallback, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import type { DependencyId, SetupStatus } from '../../../shared/dependencies'

interface SetupChecklistProps {
  onComplete?: () => void
  onNavigateSettings?: () => void
}

export default function SetupChecklist({
  onComplete,
  onNavigateSettings
}: SetupChecklistProps): React.JSX.Element {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoDetectAttempted = useRef(false)

  const loadStatus = useCallback(async (): Promise<void> => {
    const next = await window.api.setup.getStatus()
    setStatus(next)
    if (next.setupComplete) {
      onComplete?.()
    }
  }, [onComplete])

  useEffect(() => {
    void loadStatus()
    const unsubscribe = window.api.setup.onChanged((payload) => {
      setStatus(payload)
      if (payload.setupComplete) {
        onComplete?.()
      }
    })
    return unsubscribe
  }, [loadStatus, onComplete])

  useEffect(() => {
    if (!status || status.gamePathConfigured || autoDetectAttempted.current) {
      return
    }

    autoDetectAttempted.current = true

    void window.api.game.detectPaths().then(async (candidates) => {
      const detected = candidates[0]
      if (!detected) {
        return
      }

      const result = await window.api.game.setPath(detected.path)
      if (!result.success) {
        setError(result.error ?? 'Failed to save detected GTA V path.')
        return
      }

      await loadStatus()
    })
  }, [loadStatus, status])

  const handleBrowseGame = async (): Promise<void> => {
    setError(null)
    const result = await window.api.game.browsePath()
    if (!result.success && !result.canceled) {
      setError(result.error ?? 'Failed to set game path.')
    }
    await loadStatus()
  }

  const handleInstallOne = async (id: DependencyId): Promise<void> => {
    setBusy(id)
    setError(null)
    try {
      const result = await window.api.setup.install(id)
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
      }
      await loadStatus()
    } finally {
      setBusy(null)
    }
  }

  const handleInstallAll = async (): Promise<void> => {
    setBusy('all')
    setError(null)
    try {
      const result = await window.api.setup.installAll()
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
      }
      await loadStatus()
    } finally {
      setBusy(null)
    }
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-launcher-muted">Checking setup…</span>
      </div>
    )
  }

  const gameStepDone = status.gamePathConfigured
  const depsDone = status.dependencies.every((d) => d.installedInGame)
  const canInstallAll = status.dependencies.some(
    (d) => !d.installedInGame && d.bundledAvailable
  )

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-launcher-accent">
          First-time setup
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-launcher-text">
          Modding prerequisites
        </h2>
        <p className="mt-2 text-sm text-launcher-muted">
          Complete this checklist before importing mods. We&apos;ll verify your game path and
          install required framework files.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <ol className="space-y-4">
        <li className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
          <div className="flex items-start gap-4">
            <StepIcon done={gameStepDone} step={1} />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-launcher-text">Locate GTA V</h3>
              <p className="mt-1 text-sm text-launcher-muted">
                Point the launcher at your <code className="text-launcher-accent">GTA5.exe</code>.
              </p>
              {status.gameRoot && (
                <p className="mt-2 truncate font-mono text-[10px] text-launcher-muted">
                  {status.gameRoot}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleBrowseGame()}
                  className="rounded-lg border border-launcher-accent/40 bg-launcher-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent hover:bg-launcher-accent/20"
                >
                  Browse GTA5.exe
                </button>
                {onNavigateSettings && (
                  <button
                    type="button"
                    onClick={onNavigateSettings}
                    className="rounded-lg border border-launcher-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-launcher-muted hover:text-launcher-text"
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>
          </div>
        </li>

        {status.dependencies.map((dependency, index) => (
          <li
            key={dependency.id}
            className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5"
          >
            <div className="flex items-start gap-4">
              <StepIcon done={dependency.installedInGame} step={index + 2} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-launcher-text">{dependency.name}</h3>
                <p className="mt-1 text-sm text-launcher-muted">{dependency.description}</p>
                <p className="mt-2 font-mono text-[10px] text-launcher-muted">
                  {dependency.fileName}
                  {dependency.installedInGame ? ' · installed' : ' · missing'}
                  {!dependency.bundledAvailable && !dependency.installedInGame
                    ? ' · not bundled'
                    : ''}
                </p>
                {!dependency.installedInGame && dependency.bundledAvailable && gameStepDone && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void handleInstallOne(dependency.id)}
                    className="mt-3 rounded-lg border border-launcher-accent/40 bg-launcher-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent hover:bg-launcher-accent/20 disabled:opacity-50"
                  >
                    {busy === dependency.id ? 'Installing…' : `Install ${dependency.fileName}`}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-center gap-3 border-t border-launcher-border/60 pt-6">
        {!depsDone && canInstallAll && gameStepDone && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void handleInstallAll()}
            className="rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-8 py-3 text-xs font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_20px_var(--color-launcher-glow)] disabled:opacity-50"
          >
            {busy === 'all' ? 'Installing…' : 'Auto-install all missing'}
          </button>
        )}

        {status.setupComplete ? (
          <p className="text-sm font-semibold text-launcher-accent">Setup complete — mods unlocked</p>
        ) : (
          <p className="text-center text-xs text-launcher-muted">
            Mod import and enable are locked until all steps are complete.
          </p>
        )}
      </div>
    </div>
  )
}

function StepIcon({ done, step }: { done: boolean; step: number }): React.JSX.Element {
  return (
    <div
      className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        done
          ? 'bg-launcher-accent/20 text-launcher-accent'
          : 'border border-launcher-border bg-launcher-elevated text-launcher-muted'
      ].join(' ')}
    >
      {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : step}
    </div>
  )
}
