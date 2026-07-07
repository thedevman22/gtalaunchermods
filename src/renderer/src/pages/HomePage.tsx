import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ModProfileCard from '@renderer/components/ModProfileCard'
import ModDropZone from '@renderer/components/ModDropZone'
import MotionButton from '@renderer/components/MotionButton'
import ProFeatureGate from '@renderer/components/ProFeatureGate'
import UpgradePrompt from '@renderer/components/UpgradePrompt'
import WaveBackground from '@renderer/components/WaveBackground'
import WaveDivider from '@renderer/components/WaveDivider'
import { useAuth } from '@renderer/context/AuthContext'
import { useLaunch } from '@renderer/context/LaunchContext'
import { useProfiles } from '@renderer/context/ProfileContext'
import { staggerContainer } from '@renderer/lib/motion'
import { GAME_CARDS } from '../../../shared/games'

export default function HomePage(): React.JSX.Element {
  const { isPremium } = useAuth()
  const { isLaunching, launchingProfileId, startProfileLaunch } = useLaunch()
  const {
    profiles,
    limits,
    selectedProfileId,
    activeProfileId,
    refreshProfiles,
    selectedProfile
  } = useProfiles()
  const [newProfileName, setNewProfileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (profiles.length === 0) {
      setShowCreate(true)
    }
  }, [profiles.length])

  const handleCreateProfile = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.profiles.create(newProfileName)
      if (!result.success) {
        setError(result.error ?? 'Failed to create profile.')
        return
      }
      setNewProfileName('')
      setShowCreate(false)
      await refreshProfiles()
    } finally {
      setBusy(false)
    }
  }

  const handleImportToProfile = async (zipPath: string): Promise<void> => {
    if (!selectedProfileId) {
      setError('Create a mod profile first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.profiles.importZip(selectedProfileId, zipPath)
      if (!result.success) {
        setError(result.error ?? 'Import failed.')
      }
      await refreshProfiles()
    } finally {
      setBusy(false)
    }
  }

  const handleBrowseImport = async (): Promise<void> => {
    if (!selectedProfileId) {
      setError('Create a mod profile first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.profiles.browseImport(selectedProfileId)
      if (!result.success && result.error && result.error !== 'Import canceled.') {
        setError(result.error)
      }
      await refreshProfiles()
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteProfile = async (profileId: string): Promise<void> => {
    if (!window.confirm('Delete this mod profile? Mod files stay in your library.')) return
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.profiles.delete(profileId)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete profile.')
      }
      await refreshProfiles()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-launcher-border bg-launcher-surface">
        <WaveBackground />
        <div className="relative z-10 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-launcher-accent">
            Mod Profiles
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-launcher-text">Your loadouts</h2>
          <p className="mt-2 max-w-xl text-sm text-launcher-muted">
            Each profile is an isolated modpack. Launching applies only that profile&apos;s mods —
            previous files are cleaned from your game folder first.
          </p>
        </div>
        <WaveDivider variant="accent" />
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-launcher-muted">
              Profiles
            </h3>
            {limits && (
              <p className="mt-1 text-xs text-launcher-muted">
                {limits.profileCount}/{limits.maxProfiles} profiles
                {!limits.autoCatalogInstall
                  ? ` · Free: up to ${limits.maxModsPerProfile} mods per profile`
                  : ' · Pro: unlimited profiles & mod stacking'}
              </p>
            )}
          </div>
          {limits?.canCreateProfile ? (
            <MotionButton
              disabled={busy}
              onClick={() => setShowCreate((value) => !value)}
              className="rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted hover:border-launcher-accent/40 hover:text-launcher-accent"
            >
              New profile
            </MotionButton>
          ) : (
            <UpgradePrompt feature="Unlimited mod profiles" compact />
          )}
        </div>

        {showCreate && limits?.canCreateProfile && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-launcher-border bg-launcher-elevated/50 p-4">
            <input
              type="text"
              value={newProfileName}
              onChange={(event) => setNewProfileName(event.target.value)}
              placeholder="e.g. Realistic Graphics"
              className="min-w-[200px] flex-1 rounded-lg border border-launcher-border bg-launcher-surface px-3 py-2 text-sm outline-none focus:border-launcher-accent/50"
            />
            <MotionButton
              disabled={busy || !newProfileName.trim()}
              onClick={() => void handleCreateProfile()}
              className="rounded-lg bg-launcher-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
            >
              Create
            </MotionButton>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-launcher-border bg-launcher-elevated/30 p-8 text-center">
            <p className="text-sm text-launcher-muted">
              Create your first mod profile to start adding mods.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {profiles.map((profile) => (
              <ModProfileCard
                key={profile.id}
                profile={profile}
                isActive={profile.id === activeProfileId}
                isLaunching={isLaunching && launchingProfileId === profile.id}
                onLaunch={() => void startProfileLaunch(profile.id)}
                onDelete={
                  profiles.length > 1 || limits?.canCreateProfile
                    ? () => void handleDeleteProfile(profile.id)
                    : undefined
                }
              />
            ))}
          </motion.div>
        )}
      </section>

      {selectedProfile && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-launcher-muted">
            Add mods to &ldquo;{selectedProfile.name}&rdquo;
          </h3>
          <ModDropZone
            busy={busy}
            onImport={handleImportToProfile}
            onBrowse={handleBrowseImport}
            autoInstall={false}
            onAutoInstallChange={() => undefined}
            isPremium={isPremium}
          />
          {!isPremium && selectedProfile.modCount >= (limits?.maxModsPerProfile ?? 3) && (
            <div className="mt-3">
              <UpgradePrompt
                feature="Unlimited mods per profile & one-click catalog install"
                compact
              />
            </div>
          )}
        </section>
      )}

      <ProFeatureGate feature="Unlimited mod profiles">
        <div className="hidden" />
      </ProFeatureGate>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-launcher-muted">
          Supported games
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {GAME_CARDS.map((game) => (
            <div
              key={game.id}
              className={[
                'rounded-xl border bg-launcher-surface p-4',
                game.status === 'coming_soon' ? 'border-launcher-border/60 opacity-70' : 'border-launcher-border'
              ].join(' ')}
            >
              <p className="font-semibold text-launcher-text">{game.title}</p>
              <p className="mt-1 text-xs text-launcher-muted">
                {game.status === 'supported' ? 'Supported' : 'Coming Soon'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
