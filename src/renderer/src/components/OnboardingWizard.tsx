import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import ModHarborLogo from '@renderer/components/ModHarborLogo'
import MotionButton from '@renderer/components/MotionButton'
import WaveBackground from '@renderer/components/WaveBackground'
import WaveDivider from '@renderer/components/WaveDivider'
import { useAuth } from '@renderer/context/AuthContext'
import { updateProfilePreferences } from '@renderer/lib/preferencesSync'
import { pageTransition } from '@renderer/lib/motion'
import {
  GTA5_EDITIONS,
  getExeFileNameForEdition,
  type GameEdition
} from '../../../shared/games'
import type { GamePathCandidate } from '../../../shared/game'
import type { DependencyId, SetupStatus } from '../../../shared/dependencies'

interface OnboardingWizardProps {
  onComplete: () => void
}

const STEPS = ['Welcome', 'Game', 'Install path', 'Dependencies'] as const

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps): React.JSX.Element {
  const { user, isOfflineDev, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [edition, setEdition] = useState<GameEdition>('legacy')
  const [candidates, setCandidates] = useState<GamePathCandidate[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [scanning, setScanning] = useState(false)
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [depBusy, setDepBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncGameToProfile = useCallback(
    async (nextEdition: GameEdition): Promise<void> => {
      if (!user || isOfflineDev) return
      await updateProfilePreferences(user.id, {
        game_id: 'gta5',
        game_edition: nextEdition
      })
    },
    [user, isOfflineDev]
  )

  const loadSetup = useCallback(async (): Promise<void> => {
    setSetupStatus(await window.api.setup.getStatus())
  }, [])

  const scanPaths = useCallback(async (targetEdition: GameEdition): Promise<void> => {
    setScanning(true)
    setError(null)
    try {
      const found = await window.api.game.detectPaths(targetEdition)
      setCandidates(found)
      if (found.length > 0 && !selectedPath) {
        setSelectedPath(found[0].path)
      }
    } finally {
      setScanning(false)
    }
  }, [selectedPath])

  useEffect(() => {
    void window.api.onboarding.getState().then((state) => {
      if (state.edition) {
        setEdition(state.edition)
      }
    })
    void loadSetup()
    return window.api.setup.onChanged(setSetupStatus)
  }, [loadSetup])

  useEffect(() => {
    if (step === 2) {
      void scanPaths(edition)
    }
  }, [step, edition, scanPaths])

  const handleSelectEdition = async (nextEdition: GameEdition): Promise<boolean> => {
    setEdition(nextEdition)
    setSelectedPath('')
    setCandidates([])
    setError(null)

    const result = await window.api.onboarding.setGameSetup('gta5', nextEdition)
    if (!result.success) {
      setError(result.error ?? 'Failed to save game selection.')
      return false
    }

    try {
      await syncGameToProfile(nextEdition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync game selection.')
      return false
    }

    return true
  }

  const handleConfirmPath = async (): Promise<void> => {
    if (!selectedPath) return
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.game.setPath(selectedPath)
      if (!result.success) {
        setError(result.error ?? 'Invalid game path.')
        return
      }

      if (user && profile?.sync_preferences_enabled) {
        await updateProfilePreferences(user.id, { default_install_path: selectedPath })
      }

      await loadSetup()
      setStep(3)
    } finally {
      setBusy(false)
    }
  }

  const handleBrowse = async (): Promise<void> => {
    setError(null)
    const result = await window.api.game.browsePath()
    if (result.success && result.path) {
      setSelectedPath(result.path)
      setCandidates((prev) => {
        if (prev.some((c) => c.path === result.path)) return prev
        return [{ path: result.path!, source: 'manual', label: 'Manual selection' }, ...prev]
      })
    } else if (!result.canceled && result.error) {
      setError(result.error)
    }
    await loadSetup()
  }

  const handleInstallDep = async (id: DependencyId): Promise<void> => {
    setDepBusy(id)
    setError(null)
    try {
      const result = await window.api.setup.install(id)
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
      }
      await loadSetup()
    } finally {
      setDepBusy(null)
    }
  }

  const handleInstallAll = async (): Promise<void> => {
    setDepBusy('all')
    setError(null)
    try {
      const result = await window.api.setup.installAll()
      if (!result.success) {
        setError(result.error ?? 'Install failed.')
      }
      await loadSetup()
    } finally {
      setDepBusy(null)
    }
  }

  const handleSkip = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.onboarding.skip()
      if (!result.success) {
        setError(result.error ?? 'Could not skip setup.')
        return
      }
      onComplete()
    } finally {
      setBusy(false)
    }
  }

  const handleFinish = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.onboarding.complete()
      if (!result.success) {
        setError(result.error ?? 'Could not complete onboarding.')
        return
      }

      if (user && profile?.sync_preferences_enabled) {
        await updateProfilePreferences(user.id, {
          game_id: 'gta5',
          game_edition: edition,
          default_install_path: selectedPath || null
        })
      }

      onComplete()
    } finally {
      setBusy(false)
    }
  }

  const exeName = getExeFileNameForEdition(edition)
  const pathReady = Boolean(selectedPath)
  const depsReady = setupStatus?.setupComplete ?? false

  return (
    <div className="flex h-full flex-col bg-launcher-bg">
      <header className="relative shrink-0 overflow-hidden border-b border-launcher-border">
        <WaveBackground />
        <div className="relative z-10 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <ModHarborLogo size={40} className="shadow-[0_4px_16px_rgba(43,159,212,0.25)]" />
            <div>
              <h1 className="font-display text-lg font-bold text-launcher-text">Welcome to ModHarbor</h1>
              <p className="text-xs text-launcher-muted">First-run setup · Step {step + 1} of {STEPS.length}</p>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className={[
                  'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                  index === step
                    ? 'bg-launcher-accent/15 text-launcher-accent'
                    : index < step
                      ? 'text-launcher-accent/70'
                      : 'text-launcher-muted'
                ].join(' ')}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <WaveDivider variant="accent" />
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} {...pageTransition}>
              {step === 0 && (
                <div className="text-center">
                  <div className="mx-auto mb-6 w-fit shadow-[0_8px_40px_rgba(43,159,212,0.25)]">
                    <ModHarborLogo size={96} className="rounded-2xl" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-launcher-text">
                    Dock your mods in calm waters
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-launcher-muted">
                    ModHarbor helps you manage story-mode mods safely — isolated libraries, offline
                    launches, and a clean setup flow. This wizard takes about a minute.
                  </p>
                  <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm text-launcher-muted">
                    {[
                      'Pick your GTA V edition',
                      'Locate your game install automatically',
                      'Install modding prerequisites'
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-launcher-accent"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-launcher-text">Choose your game</h2>
                  <p className="mt-2 text-sm text-launcher-muted">
                    Select the edition you own. ModHarbor configures paths and validation per edition.
                  </p>
                  <div className="mt-6 space-y-3">
                    {GTA5_EDITIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void handleSelectEdition(option.id)}
                        className={[
                          'wave-card w-full rounded-xl border p-4 text-left transition-colors',
                          edition === option.id
                            ? 'border-launcher-accent bg-launcher-accent/10 shadow-[0_0_14px_var(--color-launcher-glow)]'
                            : 'border-launcher-border bg-launcher-surface hover:border-launcher-accent/40'
                        ].join(' ')}
                      >
                        <p className="font-semibold text-launcher-text">{option.title}</p>
                        <p className="mt-1 text-xs text-launcher-muted">{option.description}</p>
                      </button>
                    ))}
                    <div className="rounded-xl border border-launcher-border/60 bg-launcher-elevated/40 p-4 opacity-60">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-launcher-muted">Grand Theft Auto VI</p>
                          <p className="mt-1 text-xs text-launcher-muted">Coming Soon · Support planned</p>
                        </div>
                        <span className="rounded-full border border-launcher-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted">
                          Locked
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-launcher-text">Game install location</h2>
                  <p className="mt-2 text-sm text-launcher-muted">
                    Scanning Steam libraries, Epic manifests, and Rockstar paths for{' '}
                    <span className="font-mono text-launcher-text">{exeName}</span>.
                  </p>

                  {scanning ? (
                    <p className="mt-6 text-sm text-launcher-muted">Scanning install locations…</p>
                  ) : candidates.length > 0 ? (
                    <div className="mt-6 space-y-2">
                      {candidates.map((candidate) => (
                        <button
                          key={candidate.path}
                          type="button"
                          onClick={() => setSelectedPath(candidate.path)}
                          className={[
                            'w-full rounded-xl border p-4 text-left transition-colors',
                            selectedPath === candidate.path
                              ? 'border-launcher-accent bg-launcher-accent/5'
                              : 'border-launcher-border bg-launcher-surface hover:border-launcher-accent/30'
                          ].join(' ')}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-launcher-accent">
                            {candidate.label ?? candidate.source}
                          </p>
                          <p className="mt-1 break-all font-mono text-xs text-launcher-muted">
                            {candidate.path}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-dashed border-launcher-border bg-launcher-elevated/40 p-6 text-center">
                      <p className="text-sm text-launcher-muted">No installs detected automatically.</p>
                      <p className="mt-1 text-xs text-launcher-muted">
                        Use Browse to select {exeName} manually.
                      </p>
                    </div>
                  )}

                  <MotionButton
                    onClick={() => void handleBrowse()}
                    className="mt-4 rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted hover:border-launcher-accent/40 hover:text-launcher-accent"
                  >
                    Browse for {exeName}
                  </MotionButton>
                </div>
              )}

              {step === 3 && setupStatus && (
                <div>
                  <h2 className="font-display text-xl font-bold text-launcher-text">Modding prerequisites</h2>
                  <p className="mt-2 text-sm text-launcher-muted">
                    Script Hook V and the ASI loader must be in your game folder before importing mods.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {setupStatus.dependencies.map((dep) => (
                      <li
                        key={dep.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-launcher-border bg-launcher-surface p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-launcher-text">{dep.name}</p>
                          <p className="text-xs text-launcher-muted">{dep.fileName}</p>
                        </div>
                        {dep.installedInGame ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-launcher-accent">
                            Installed
                          </span>
                        ) : (
                          <MotionButton
                            disabled={depBusy !== null || !dep.bundledAvailable}
                            onClick={() => void handleInstallDep(dep.id)}
                            className="rounded-lg border border-launcher-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted hover:border-launcher-accent/40 hover:text-launcher-accent disabled:opacity-50"
                          >
                            {depBusy === dep.id ? 'Installing…' : 'Install'}
                          </MotionButton>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!depsReady && setupStatus.dependencies.some((d) => !d.installedInGame && d.bundledAvailable) && (
                    <MotionButton
                      disabled={depBusy !== null}
                      onClick={() => void handleInstallAll()}
                      className="wave-button mt-4 rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-3 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
                    >
                      {depBusy === 'all' ? 'Installing…' : 'Install all'}
                    </MotionButton>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="shrink-0 border-t border-launcher-border bg-launcher-surface/80 px-8 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <MotionButton
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted disabled:opacity-40"
          >
            Back
          </MotionButton>

          {step < 3 ? (
            <div className="flex items-center gap-4">
              {(step === 1 || step === 2) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSkip()}
                  className="text-xs font-semibold uppercase tracking-wider text-launcher-muted transition-colors hover:text-launcher-accent disabled:opacity-40"
                >
                  Skip for now
                </button>
              )}
              <MotionButton
                disabled={
                  busy ||
                  (step === 1 && !edition) ||
                  (step === 2 && !pathReady)
                }
                onClick={() => {
                  if (step === 1) {
                    void handleSelectEdition(edition).then((ok) => {
                      if (ok) setStep(2)
                    })
                    return
                  }
                  if (step === 2) {
                    void handleConfirmPath()
                    return
                  }
                  setStep((s) => s + 1)
                }}
                className="wave-button rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
              >
                {step === 2 ? (busy ? 'Saving…' : 'Next') : 'Continue'}
              </MotionButton>
            </div>
          ) : (
            <MotionButton
              disabled={busy || !depsReady}
              onClick={() => void handleFinish()}
              className="wave-button rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
            >
              {busy ? 'Finishing…' : 'Enter ModHarbor'}
            </MotionButton>
          )}
        </div>
      </footer>
    </div>
  )
}
