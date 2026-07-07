import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import GamePathDialog from '@renderer/components/GamePathDialog'
import ModProfileCard from '@renderer/components/ModProfileCard'
import MotionButton from '@renderer/components/MotionButton'
import TierBadge from '@renderer/components/TierBadge'
import UpgradePrompt from '@renderer/components/UpgradePrompt'
import WaveBackground from '@renderer/components/WaveBackground'
import WaveDivider from '@renderer/components/WaveDivider'
import { useAuth } from '@renderer/context/AuthContext'
import { useLaunch } from '@renderer/context/LaunchContext'
import { useProfiles } from '@renderer/context/ProfileContext'
import { useSetupStatus } from '@renderer/hooks/useSetupStatus'
import { staggerContainer } from '@renderer/lib/motion'

export default function HomePage(): React.JSX.Element {
  const { user, profile } = useAuth()
  const { isLaunching, launchingProfileId, startProfileLaunch } = useLaunch()
  const {
    profiles,
    limits,
    selectedProfileId,
    activeProfileId,
    setSelectedProfileId,
    refreshProfiles,
    selectedProfile
  } = useProfiles()
  const setupStatus = useSetupStatus()
  const [newProfileName, setNewProfileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showPathDialog, setShowPathDialog] = useState(false)

  const gamePathMissing = setupStatus !== null && !setupStatus.gamePathConfigured
  const email = profile?.email ?? user?.email ?? ''
  const greetingName = email ? email.split('@')[0] : 'Captain'
  const tier = profile?.subscription_tier ?? 'free'

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
    <div className="h-full overflow-y-auto px-10 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <header
          data-tour="launch"
          className="relative overflow-hidden rounded-2xl border border-launcher-border bg-launcher-surface"
        >
          <WaveBackground />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-6 p-10 pb-12">
            <div>
              <div className="flex items-center gap-3">
                <p className="type-section text-launcher-accent">Welcome back</p>
                <TierBadge tier={tier} size="sm" />
              </div>
              <h2 className="type-title mt-2 text-3xl">{greetingName}</h2>
              {selectedProfile ? (
                <p className="type-body mt-2">
                  {selectedProfile.name} · {selectedProfile.modCount} mod
                  {selectedProfile.modCount === 1 ? '' : 's'} ready
                </p>
              ) : (
                <p className="type-body mt-2">Create a profile to start modding.</p>
              )}
            </div>

            {selectedProfile && !gamePathMissing ? (
              <MotionButton
                disabled={isLaunching}
                onClick={() => void startProfileLaunch(selectedProfile.id)}
                className="btn-primary wave-button inline-flex items-center gap-2.5 px-8 py-3.5 text-sm"
              >
                <Play className="h-4 w-4 fill-current" strokeWidth={2} aria-hidden />
                {isLaunching && launchingProfileId === selectedProfile.id
                  ? 'Launching…'
                  : 'Launch'}
              </MotionButton>
            ) : null}
          </div>
          <WaveDivider variant="accent" />
        </header>

        {gamePathMissing && (
          <div
            data-tour="setup-card"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-launcher-accent/30 bg-launcher-accent/5 px-6 py-5"
          >
            <div>
              <p className="text-sm font-semibold text-launcher-text">Finish setup</p>
              <p className="type-caption mt-1">Locate your GTA V folder to start modding.</p>
            </div>
            <MotionButton onClick={() => setShowPathDialog(true)} className="btn-primary">
              Locate game folder
            </MotionButton>
          </div>
        )}

        <GamePathDialog open={showPathDialog} onClose={() => setShowPathDialog(false)} />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section data-tour="profiles">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="type-section">Profiles</h3>
              {limits && (
                <p className="type-caption mt-1.5">
                  {limits.autoCatalogInstall
                    ? `${limits.profileCount} profile${limits.profileCount === 1 ? '' : 's'} · unlimited on ${limits.tier === 'elite' ? 'Elite' : 'Pro'}`
                    : `${limits.profileCount}/${limits.maxProfiles} used · up to ${limits.maxModsPerProfile} mods each on Free`}
                </p>
              )}
            </div>
            {limits?.canCreateProfile ? (
              <MotionButton
                disabled={busy}
                onClick={() => setShowCreate((value) => !value)}
                className="btn-ghost"
              >
                New profile
              </MotionButton>
            ) : (
              <UpgradePrompt feature="Unlimited mod profiles" compact />
            )}
          </div>

          {showCreate && limits?.canCreateProfile && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-launcher-border bg-launcher-elevated/50 p-5">
              <input
                type="text"
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                placeholder="e.g. Realistic Graphics"
                className="min-w-[200px] flex-1 rounded-lg border border-launcher-border bg-launcher-surface px-4 py-2.5 text-sm outline-none focus:border-launcher-accent/50"
              />
              <MotionButton
                disabled={busy || !newProfileName.trim()}
                onClick={() => void handleCreateProfile()}
                className="rounded-lg bg-launcher-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
              >
                Create
              </MotionButton>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-launcher-border bg-launcher-elevated/30 p-12 text-center">
              <p className="type-body">Create your first mod profile to start adding mods.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {profiles.map((p) => (
                <ModProfileCard
                  key={p.id}
                  profile={p}
                  isActive={p.id === activeProfileId}
                  isSelected={p.id === selectedProfileId}
                  isLaunching={isLaunching && launchingProfileId === p.id}
                  launchDisabled={gamePathMissing}
                  onSelect={() => setSelectedProfileId(p.id)}
                  onLaunch={() => void startProfileLaunch(p.id)}
                  onDelete={
                    profiles.length > 1 || limits?.canCreateProfile
                      ? () => void handleDeleteProfile(p.id)
                      : undefined
                  }
                />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  )
}
