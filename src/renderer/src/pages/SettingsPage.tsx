import { useCallback, useEffect, useState } from 'react'
import AnimatedToggle from '@renderer/components/AnimatedToggle'
import MotionButton from '@renderer/components/MotionButton'
import { useAuth } from '@renderer/context/AuthContext'
import type { ThemePreference } from '../../../shared/profile'
import type { UpdateStatusPayload } from '../../../shared/update'
import {
  applySyncedPreferences,
  applyThemePreference,
  updateProfilePreferences
} from '@renderer/lib/preferencesSync'

export default function SettingsPage(): React.JSX.Element {
  const { user, profile, isOfflineDev, refreshProfile } = useAuth()
  const [gamePath, setGamePath] = useState('')
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [theme, setTheme] = useState<ThemePreference>('dark')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appVersion, setAppVersion] = useState('…')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusPayload['status']>('idle')
  const [updateBusy, setUpdateBusy] = useState(false)

  const loadLocalSettings = useCallback(async (): Promise<void> => {
    const pathInfo = await window.api.game.getPath()
    setGamePath(pathInfo.resolvedPath || pathInfo.savedPath || '')
  }, [])

  useEffect(() => {
    void window.api.update.getAppVersion().then(setAppVersion)
    return window.api.update.onStatusChanged((payload) => {
      setUpdateStatus(payload.status)
    })
  }, [])

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
    void loadLocalSettings()
  }, [loadLocalSettings])

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
        default_install_path: profile.default_install_path
      })
      await loadLocalSettings()
      setMessage('Pulled preferences from your account.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull preferences.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold text-launcher-text">Settings</h2>
        <p className="mt-1 text-sm text-launcher-muted">
          Configure paths, appearance, and cloud sync for your account.
        </p>
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

      <div className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-launcher-text">Cloud sync</h3>
            <p className="mt-1 text-xs text-launcher-muted">
              Sync theme and default GTA V install path across devices. Mod enable/disable state
              always syncs when signed in.
            </p>
          </div>
          <AnimatedToggle
            enabled={syncEnabled}
            disabled={busy || isOfflineDev}
            onChange={(v) => void handleSyncToggle(v)}
          />
        </div>

        {isOfflineDev && (
          <p className="mt-3 text-xs text-amber-200/80">
            Sign in with Supabase configured to enable cloud sync.
          </p>
        )}

        {syncEnabled && !isOfflineDev && (
          <MotionButton
            disabled={busy}
            onClick={() => void handlePullFromCloud()}
            className="mt-4 rounded-lg border border-launcher-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted hover:text-launcher-accent disabled:opacity-50"
          >
            Pull from cloud
          </MotionButton>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
          <h3 className="text-sm font-semibold text-launcher-text">GTA V install path</h3>
          <p className="mt-0.5 text-xs text-launcher-muted">
            Default path used when detecting your game install
            {syncEnabled ? ' — synced to your profile' : ''}.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={gamePath || 'Not configured'}
              className="flex-1 rounded-lg border border-launcher-border bg-launcher-elevated px-3 py-2 font-mono text-xs text-launcher-muted outline-none"
            />
            <MotionButton
              disabled={busy}
              onClick={() => void handleBrowseGamePath()}
              className="shrink-0 rounded-lg border border-launcher-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted hover:border-launcher-accent/40 hover:text-launcher-accent disabled:opacity-50"
            >
              Browse
            </MotionButton>
          </div>
        </div>

        <div className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
          <h3 className="text-sm font-semibold text-launcher-text">Theme</h3>
          <p className="mt-0.5 text-xs text-launcher-muted">
            Launcher appearance{syncEnabled ? ' — synced to your profile' : ''}.
          </p>
          <div className="mt-4 flex gap-2">
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

        <div className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
          <h3 className="text-sm font-semibold text-launcher-text">App updates</h3>
          <p className="mt-0.5 text-xs text-launcher-muted">
            Installed builds check GitHub Releases automatically and download updates in the
            background.
          </p>
          <p className="mt-3 font-mono text-xs text-launcher-muted">Version {appVersion}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MotionButton
              disabled={updateBusy}
              onClick={() => void handleCheckForUpdates()}
              className="rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted hover:border-launcher-accent/40 hover:text-launcher-accent disabled:opacity-50"
            >
              {updateBusy ? 'Checking…' : 'Check for updates'}
            </MotionButton>
            {updateStatus === 'ready' ? (
              <MotionButton
                onClick={() => void window.api.update.install()}
                className="rounded-lg bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-4 py-2 text-xs font-bold uppercase tracking-wider text-launcher-bg"
              >
                Restart to update
              </MotionButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
