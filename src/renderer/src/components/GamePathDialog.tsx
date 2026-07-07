import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MotionButton from '@renderer/components/MotionButton'
import { getExeFileNameForEdition, type GameEdition } from '../../../shared/games'
import type { GamePathCandidate } from '../../../shared/game'

interface GamePathDialogProps {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

/** Standalone version of the onboarding "Game install location" step. */
export default function GamePathDialog({
  open,
  onClose,
  onSaved
}: GamePathDialogProps): React.JSX.Element {
  const [edition, setEdition] = useState<GameEdition>('legacy')
  const [candidates, setCandidates] = useState<GamePathCandidate[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanPaths = useCallback(async (targetEdition: GameEdition): Promise<void> => {
    setScanning(true)
    setError(null)
    try {
      const found = await window.api.game.detectPaths(targetEdition)
      setCandidates(found)
      setSelectedPath((current) => current || (found[0]?.path ?? ''))
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setSelectedPath('')
    setCandidates([])
    setError(null)
    void window.api.onboarding.getState().then((state) => {
      const nextEdition = state.edition ?? 'legacy'
      setEdition(nextEdition)
      void scanPaths(nextEdition)
    })
  }, [open, scanPaths])

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
  }

  const handleSave = async (): Promise<void> => {
    if (!selectedPath) return
    setBusy(true)
    setError(null)
    try {
      const result = await window.api.game.setPath(selectedPath)
      if (!result.success) {
        setError(result.error ?? 'Invalid game path.')
        return
      }
      onSaved?.()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const exeName = getExeFileNameForEdition(edition)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-launcher-bg/80 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-launcher-border bg-launcher-surface p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-launcher-text">
              Game install location
            </h2>
            <p className="mt-2 text-sm text-launcher-muted">
              Scanning Steam libraries, Epic manifests, and Rockstar paths for{' '}
              <span className="font-mono text-launcher-text">{exeName}</span>.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

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

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-launcher-border/60 pt-4">
              <MotionButton
                disabled={busy}
                onClick={onClose}
                className="rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted disabled:opacity-40"
              >
                Cancel
              </MotionButton>
              <MotionButton
                disabled={busy || !selectedPath}
                onClick={() => void handleSave()}
                className="wave-button rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save game folder'}
              </MotionButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
