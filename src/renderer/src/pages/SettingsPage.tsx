import { useCallback, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import AnimatedToggle from '@renderer/components/AnimatedToggle'
import DependencyStatusList from '@renderer/components/DependencyStatusList'
import MotionButton from '@renderer/components/MotionButton'
import SignInPrompt from '@renderer/components/SignInPrompt'
import { useAuth } from '@renderer/context/AuthContext'
import { useSetupStatus } from '@renderer/hooks/useSetupStatus'
import type { ThemePreference } from '../../../shared/profile'
import type { UserPreferences } from '../../../shared/sync'
import type { UpdateStatusPayload } from '../../../shared/update'
import {
  applySyncedPreferences,
  applyThemePreference,
  updateProfilePreferences
} from '@renderer/lib/preferencesSync'

interface SettingsPageProps {
  onStartTour?: () => void
}

const GAME_PATH_GUIDE_STEPS = [
  'Open the GTA V install path card above and click Browse (or use the "Finish setup" card on Home).',
  'Select the folder that contains GTA5.exe — not a subfolder inside it.',
  'ModHarbor validates the folder and picks the right executable for your edition automatically.'
]

const GAME_PATH_EXAMPLES = [
  { store: 'Steam', path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Grand Theft Auto V' },
  { store: 'Epic Games', path: 'C:\\Program Files\\Epic Games\\GTAV' },
  { store: 'Rockstar', path: 'C:\\Program Files\\Rockstar Games\\Grand Theft Auto V' }
]

const FIRST_MOD_GUIDE_STEPS = [
  'On Home, create a profile (for example "My first loadout") and click its card to select it.',
  'Open the Mods tab. Browse the catalog, or use the import area on the My Mods tab to drop in a mod .zip.',
  'Install or import a mod — it lands in your library and is added to your selected profile.',
  'Back on Home, press Launch. Your profile\u2019s mods deploy to the game folder and GTA V starts in offline story mode.'
]

function GuideCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <details className="group rounded-xl border border-launcher-border bg-launcher-elevated/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-launcher-text [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-launcher-muted transition-transform group-open:rotate-180"
          strokeWidth={2}
          aria-hidden
        />
      </summary>
      <div className="border-t border-launcher-border/60 px-5 py-4">{children}</div>
    </details>
  )
}

export default function SettingsPage({ onStartTour }: SettingsPageProps): React.JSX.Element {
  const { user, profile, isOfflineDev, isGuest, refreshProfile, openAuthModal } = useAuth()
  const [gamePath, setGamePath] = useState('')
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [theme, setTheme] = useState<ThemePreference>('dark')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appVersion, setAppVersion] = useState('…')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusPayload['status']>('idle')
  const [updateVersion, setUpdateVersion] = useState<string | undefined>(undefined)
  const [updateBusy, setUpdateBusy] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const setupStatus = useSetupStatus()
  const [repairBusy, setRepairBusy] = useState(false)

  const loadLocalSettings = useCallback(async (): Promise<void> => {
    const pathInfo = await window.api.game.getPath()
    setGamePath(pathInfo.resolvedPath || pathInfo.savedPath || '')
  }, [])

  useEffect(() => {
    void window.api.update.getAppVersion().then(setAppVersion)
    void window.api.update.getSettings().then((settings) => setAutoUpdate(settings.autoUpdate))
    void window.api.update.getStatus().then((payload) => {
      setUpdateStatus(payload.status)
      setUpdateVersion(payload.version)
    })
    return window.api.update.onStatusChanged((payload) => {
      setUpdateStatus(payload.status)
      setUpdateVersion(payload.version)
    })
  }, [])

  const handleAutoUpdateToggle = async (enabled: boolean): Promise<void> => {
    setAutoUpdate(enabled)
    await window.api.update.setAutoUpdate(enabled)
  }

  const handleCheckForUpdates = async (): Promise<void> => {
    setUpdateBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await window.api.update.check()
      if (!result.success) {
        setError(result.error ?? 'Update check failed.')
        return
      }
      if (result.success && updateStatus !== 'ready' && updateStatus !== 'downloading') {
        setMessage('Update check complete.')
      }
    } finally {
      setUpdateBusy(false)
    }
  }

  useEffect(() => {
    void window.api.game.getPath().then((pathInfo) => {
      setGamePath(pathInfo.resolvedPath || pathInfo.savedPath || '')
    })
  }, [])

  useEffect(() => {
    if (!profile) return
    setSyncEnabled(profile.sync_preferences_enabled)
    setTheme(profile.theme_preference)
    applyThemePreference(profile.theme_preference)
    if (profile.default_install_path) {
      setGamePath(profile.default_install_path)
    }
  }, [profile])

  const persistPreferences = async (
    next: Partial<{
      sync_preferences_enabled: boolean
      theme_preference: ThemePreference
      default_install_path: string | null
    }>
  ): Promise<void> => {
    if (!user || isOfflineDev) return

    setBusy(true)
    setError(null)
    try {
      await updateProfilePreferences(user.id, next)
      await refreshProfile()
      setMessage('Preferences synced to your account.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync preferences.')
    } finally {
      setBusy(false)
    }
  }

  const handleSyncToggle = async (enabled: boolean): Promise<void> => {
    setSyncEnabled(enabled)
    if (!user || isOfflineDev) return

    if (enabled) {
      await persistPreferences({
        sync_preferences_enabled: true,
        theme_preference: theme,
        default_install_path: gamePath || null
      })
      return
    }

    await persistPreferences({ sync_preferences_enabled: false })
  }

  const handleThemeChange = async (nextTheme: ThemePreference): Promise<void> => {
    setTheme(nextTheme)
    applyThemePreference(nextTheme)
    if (syncEnabled) {
      await persistPreferences({ theme_preference: nextTheme })
    }
  }

  const handleBrowseGamePath = async (): Promise<void> => {
    setError(null)
    const result = await window.api.game.browsePath()
    if (!result.success) {
      if (result.error && !result.canceled) {
        setError(result.error)
      }
      return
    }

    const pathInfo = await window.api.game.getPath()
    const nextPath = pathInfo.resolvedPath || pathInfo.savedPath || ''
    setGamePath(nextPath)

    if (syncEnabled) {
      await persistPreferences({ default_install_path: nextPath || null })
    }
  }

  const handlePullFromCloud = async (): Promise<void> => {
    if (!profile?.sync_preferences_enabled) return
    setBusy(true)
    setError(null)
    try {
      await applySyncedPreferences({
        theme_preference: profile.theme_preference,
        default_install_path: profile.default_install_path,
        game_id: (profile.game_id ?? 'gta5') as UserPreferences['game_id'],
        game_edition: (profile.game_edition ?? 'legacy') as UserPreferences['game_edition']
      })
      await loadLocalSettings()
      setMessage('Pulled preferences from your account.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull preferences.')
    } finally {
      setBusy(false)
    }
  }

  const handleRepairDependencies = async (): Promise<void> => {
    setRepairBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await window.api.setup.repair()
      if (result.success) {
        setMessage('Dependencies repaired successfully.')
      } else {
        setError(result.error ?? 'Dependency repair failed.')
      }
    } finally {
      setRepairBusy(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-10 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <h2 className="type-title">Settings</h2>
        <p className="type-body mt-1.5">Paths, appearance, cloud sync, and updates.</p>
      </header>

      {message && (
        <div className="rounded-xl border border-launcher-accent/30 bg-launcher-accent/10 px-4 py-3 text-sm text-launcher-accent">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-sm font-semibold text-launcher-text">Cloud sync</h3>
            <p className="type-caption mt-1.5">
              Sync theme and install path across devices. Mod state always syncs when signed in.
            </p>
          </div>
          <AnimatedToggle
            enabled={syncEnabled}
            disabled={busy || isOfflineDev || isGuest}
            onChange={(v) => void handleSyncToggle(v)}
          />
        </div>

        {isGuest && !isOfflineDev && (
          <div className="mt-4">
            <SignInPrompt
              message="Sign in to sync theme and install path across your devices."
              onSignIn={openAuthModal}
              compact
            />
          </div>
        )}

        {isOfflineDev && (
          <p className="mt-4 text-xs text-amber-200/80">
            Sign in with Supabase configured to enable cloud sync.
          </p>
        )}

        {syncEnabled && !isOfflineDev && (
          <MotionButton
            disabled={busy}
            onClick={() => void handlePullFromCloud()}
            className="btn-ghost mt-5"
          >
            Pull from cloud
          </MotionButton>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <h3 className="text-sm font-semibold text-launcher-text">GTA V install path</h3>
          <p className="type-caption mt-1.5">
            Used to detect your game install{syncEnabled ? ' — synced to your profile' : ''}.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={gamePath || 'Not configured'}
              className="flex-1 rounded-lg border border-launcher-border bg-launcher-elevated px-3 py-2 font-mono text-xs text-launcher-muted outline-none"
            />
            <MotionButton
              disabled={busy}
              onClick={() => void handleBrowseGamePath()}
              className="btn-ghost shrink-0"
            >
              Browse
            </MotionButton>
          </div>
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <h3 className="text-sm font-semibold text-launcher-text">Theme</h3>
          <div className="mt-4 flex gap-3">
            {(['dark', 'light'] as const).map((option) => (
              <MotionButton
                key={option}
                disabled={busy}
                onClick={() => void handleThemeChange(option)}
                className={[
                  'rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider',
                  theme === option
                    ? 'bg-launcher-accent/15 text-launcher-accent'
                    : 'border border-launcher-border text-launcher-muted hover:text-launcher-text'
                ].join(' ')}
              >
                {option}
              </MotionButton>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-launcher-text">Modding dependencies</h3>
              <p className="type-caption mt-1.5">
                Script Hook V and ASI Loader must be in your GTA V folder (next to GTA5.exe).
              </p>
            </div>
            <MotionButton
              disabled={busy || repairBusy || !setupStatus?.gamePathConfigured}
              onClick={() => void handleRepairDependencies()}
              className="btn-primary shrink-0 px-5 py-2.5"
            >
              {repairBusy ? 'Repairing…' : 'Repair dependencies'}
            </MotionButton>
          </div>

          {!setupStatus?.gamePathConfigured ? (
            <p className="type-caption mt-4 text-amber-200/90">
              Configure your GTA V install path above before repairing dependencies.
            </p>
          ) : null}

          {setupStatus ? (
            <DependencyStatusList dependencies={setupStatus.dependencies} showPath />
          ) : (
            <p className="type-caption mt-4">Checking dependency status…</p>
          )}
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <h3 className="text-sm font-semibold text-launcher-text">Setup wizard</h3>
          <p className="type-caption mt-1.5">
            Re-run onboarding to change your game edition or install path.
          </p>
          <MotionButton
            disabled={busy}
            onClick={async () => {
              setError(null)
              setMessage(null)
              setBusy(true)
              try {
                const result = await window.api.onboarding.reset()
                if (!result.success) {
                  setError(result.error ?? 'Failed to reset onboarding.')
                } else {
                  setMessage('Onboarding reset. The setup wizard will open now.')
                }
              } finally {
                setBusy(false)
              }
            }}
            className="btn-ghost mt-5"
          >
            Reset onboarding
          </MotionButton>
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-launcher-text">Updates</h3>
              <p className="type-caption mt-1.5">
                Background checks against GitHub Releases — never interrupts app usage.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-launcher-border bg-launcher-elevated px-3 py-1 font-mono text-[10px] text-launcher-muted">
              v{appVersion}
            </span>
          </div>

          <div className="mt-5 flex items-start justify-between gap-6 rounded-xl border border-launcher-border/70 bg-launcher-elevated/40 p-5">
            <div>
              <p className="text-sm font-semibold text-launcher-text">Automatic updates</p>
              <p className="type-caption mt-1.5">
                {autoUpdate
                  ? 'Downloads in the background and applies on restart or next quit.'
                  : 'You choose when to download and install available updates.'}
              </p>
            </div>
            <AnimatedToggle
              enabled={autoUpdate}
              onChange={(enabled) => void handleAutoUpdateToggle(enabled)}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <MotionButton
              disabled={updateBusy}
              onClick={() => void handleCheckForUpdates()}
              className="btn-ghost"
            >
              {updateBusy ? 'Checking…' : 'Check for updates'}
            </MotionButton>
            {updateStatus === 'available' && !autoUpdate ? (
              <MotionButton
                onClick={() => void window.api.update.download()}
                className="btn-primary px-5 py-2.5"
              >
                Download & Install{updateVersion ? ` v${updateVersion}` : ''}
              </MotionButton>
            ) : null}
            {updateStatus === 'downloading' ? (
              <span className="type-caption">Downloading update…</span>
            ) : null}
            {updateStatus === 'ready' ? (
              <MotionButton
                onClick={() => void window.api.update.install()}
                className="btn-primary px-5 py-2.5"
              >
                Restart to update
              </MotionButton>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-launcher-text">Help &amp; guides</h3>
              <p className="type-caption mt-1.5">
                Replay the welcome tour or follow step-by-step guides.
              </p>
            </div>
            {onStartTour ? (
              <MotionButton onClick={onStartTour} className="btn-ghost shrink-0">
                Replay tour
              </MotionButton>
            ) : null}
          </div>

          <div className="mt-5 space-y-3">
            <GuideCard title="Connecting your GTA V folder">
              <ol className="list-decimal space-y-2 pl-5">
                {GAME_PATH_GUIDE_STEPS.map((item) => (
                  <li key={item} className="type-caption leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
              <p className="type-caption mt-4 font-semibold text-launcher-text">
                Common install locations
              </p>
              <ul className="mt-2 space-y-1.5">
                {GAME_PATH_EXAMPLES.map((example) => (
                  <li key={example.store} className="type-caption">
                    <span className="font-semibold text-launcher-text">{example.store}:</span>{' '}
                    <code className="break-all font-mono text-[11px] text-launcher-accent">
                      {example.path}
                    </code>
                  </li>
                ))}
              </ul>
            </GuideCard>

            <GuideCard title="Installing your first mod">
              <ol className="list-decimal space-y-2 pl-5">
                {FIRST_MOD_GUIDE_STEPS.map((item) => (
                  <li key={item} className="type-caption leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            </GuideCard>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
