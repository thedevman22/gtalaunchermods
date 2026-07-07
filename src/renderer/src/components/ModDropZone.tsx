import { useRef, useState } from 'react'
import UpgradePrompt from '@renderer/components/UpgradePrompt'

interface ModDropZoneProps {
  busy: boolean
  onImport: (zipPath: string) => Promise<void>
  onBrowse: () => Promise<void>
  autoInstall: boolean
  onAutoInstallChange: (value: boolean) => void
  isPremium: boolean
  onUpgrade?: () => void
  /** Game path not set — importing is unavailable. */
  disabled?: boolean
  disabledReason?: string
}

interface ElectronFile extends File {
  path: string
}

export default function ModDropZone({
  busy,
  onImport,
  onBrowse,
  autoInstall,
  onAutoInstallChange,
  isPremium,
  onUpgrade,
  disabled = false,
  disabledReason
}: ModDropZoneProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (event: React.DragEvent): void => {
    event.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (): void => {
    setIsDragging(false)
  }

  const importFromPath = async (zipPath: string): Promise<void> => {
    if (!zipPath.toLowerCase().endsWith('.zip')) return
    await onImport(zipPath)
  }

  const handleDrop = async (event: React.DragEvent): Promise<void> => {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = event.dataTransfer.files[0] as ElectronFile | undefined
    if (file?.path) {
      await importFromPath(file.path)
    }
  }

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0] as ElectronFile | undefined
    if (file?.path) {
      await importFromPath(file.path)
    }
    event.target.value = ''
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(event) => void handleDrop(event)}
        title={disabled ? disabledReason : undefined}
        className={[
          'relative rounded-xl border-2 border-dashed p-8 text-center transition-all',
          disabled
            ? 'border-launcher-border/60 bg-launcher-elevated/20 opacity-60'
            : isDragging
              ? 'border-launcher-accent bg-launcher-accent/10'
              : 'border-launcher-border bg-launcher-elevated/30 hover:border-launcher-accent/40 hover:bg-launcher-elevated/50'
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          disabled={busy}
          onChange={(event) => void handleFileInput(event)}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-launcher-accent/10 text-2xl text-launcher-accent">
          ⬆
        </div>
        <p className="mt-4 text-sm font-semibold text-launcher-text">
          {isDragging ? 'Drop mod archive here' : 'Drag & drop a mod .zip'}
        </p>
        <p className="mt-1 text-xs text-launcher-muted">
          Mods are stored in your launcher library, separate from the GTA install folder.
        </p>

        <button
          type="button"
          disabled={busy || disabled}
          title={disabled ? disabledReason : undefined}
          onClick={() => void onBrowse()}
          className="mt-4 rounded-lg border border-launcher-accent/40 bg-launcher-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-launcher-accent transition-colors hover:bg-launcher-accent/20 disabled:opacity-50"
        >
          {busy ? 'Importing…' : 'Browse for .zip'}
        </button>
      </div>

      {isPremium ? (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-launcher-border bg-launcher-surface/50 px-4 py-3">
          <input
            type="checkbox"
            checked={autoInstall}
            onChange={(event) => onAutoInstallChange(event.target.checked)}
            className="h-4 w-4 rounded border-launcher-border accent-launcher-accent"
          />
          <div>
            <p className="text-sm font-medium text-launcher-text">One-click auto-install</p>
            <p className="text-xs text-launcher-muted">
              Automatically deploy mods into GTA V immediately after import.
            </p>
          </div>
        </label>
      ) : (
        <UpgradePrompt
          feature="One-click auto-install"
          onUpgrade={onUpgrade}
          compact
        />
      )}
    </div>
  )
}
