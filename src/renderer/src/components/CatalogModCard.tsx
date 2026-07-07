import { motion, type HTMLMotionProps } from 'framer-motion'
import { Download, ExternalLink } from 'lucide-react'
import type { CatalogMod } from '../../../shared/catalog'
import {
  formatDownloadCount,
  getCategoryLabel,
  isCatalogModPlaceholder
} from '../../../shared/catalog'
import AnimatedToggle from '@renderer/components/AnimatedToggle'
import InstalledBadge from '@renderer/components/InstalledBadge'
import MotionButton from '@renderer/components/MotionButton'
import UpgradePrompt from '@renderer/components/UpgradePrompt'
import { getCategoryMeta } from '@renderer/lib/categoryMeta'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'

interface CatalogModCardProps extends Omit<HTMLMotionProps<'article'>, 'onToggle'> {
  mod: CatalogMod
  installed: boolean
  enabled: boolean
  busy: boolean
  libraryModId?: string
  installLocked?: boolean
  profileMode?: boolean
  inProfile?: boolean
  /** Game path not set — install/enable actions are unavailable. */
  actionsLocked?: boolean
  onInstall: (catalogId: string) => void
  onToggleMod: (modId: string, enabled: boolean) => void
}

function CategoryChip({ mod }: { mod: CatalogMod }): React.JSX.Element {
  const meta = getCategoryMeta(mod.category)
  const Icon = meta.icon
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        meta.text,
        meta.bg,
        meta.border
      ].join(' ')}
    >
      <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
      {getCategoryLabel(mod.category)}
    </span>
  )
}

export default function CatalogModCard({
  mod,
  installed,
  enabled,
  busy,
  libraryModId,
  installLocked = false,
  profileMode = false,
  inProfile = false,
  actionsLocked = false,
  onInstall,
  onToggleMod,
  ...motionProps
}: CatalogModCardProps): React.JSX.Element {
  const isExternal = mod.source === 'external_link'
  const isPlaceholder = isCatalogModPlaceholder(mod)
  const lockedTitle = actionsLocked ? 'Set your game folder first' : undefined

  if (isPlaceholder) {
    const meta = getCategoryMeta(mod.category)
    const Icon = meta.icon
    return (
      <motion.article
        variants={staggerItem}
        className="flex gap-4 rounded-2xl border border-dashed border-launcher-border/70 bg-launcher-elevated/20 p-3"
        aria-label="Mod slot — coming soon"
        {...motionProps}
      >
        <div className="skeleton-shimmer flex h-24 w-40 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-6 w-6 text-launcher-muted/40" strokeWidth={1.75} aria-hidden />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
          <p className="text-sm font-semibold uppercase tracking-wider text-launcher-muted">
            Mod slot — coming soon
          </p>
          <div className="skeleton-shimmer h-2.5 w-2/3 max-w-64 rounded-full" />
          <div className="skeleton-shimmer h-2.5 w-1/2 max-w-48 rounded-full" />
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center pl-2">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-launcher-border/60 bg-launcher-elevated/50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-muted/60"
          >
            Coming Soon
          </button>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ scale: 1.01, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
      className="group flex gap-4 rounded-2xl border border-launcher-border/80 bg-launcher-surface/50 p-3 hover:border-launcher-accent/25 hover:bg-launcher-surface/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
      {...motionProps}
    >
      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-launcher-elevated">
        {mod.thumbnail_url ? (
          <img
            src={mod.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-launcher-accent/40">
            {mod.name.charAt(0)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-launcher-bg/60 to-transparent" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-launcher-text">{mod.name}</h3>
          <CategoryChip mod={mod} />
          {mod.version && mod.version !== '—' ? (
            <span className="rounded-md bg-launcher-elevated px-1.5 py-0.5 font-mono text-[10px] text-launcher-muted">
              v{mod.version}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-medium text-launcher-muted">
          by <span className="text-launcher-text/80">{mod.author}</span>
          <span className="mx-2 text-launcher-border">·</span>
          <span>{formatDownloadCount(mod.download_count)} downloads</span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-launcher-muted/90">
          {mod.description}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-2 pl-2">
        {installed && libraryModId ? (
          <>
            <InstalledBadge />
            <AnimatedToggle
              enabled={profileMode ? inProfile : enabled}
              disabled={busy || actionsLocked}
              title={lockedTitle}
              label={
                profileMode
                  ? inProfile
                    ? 'In profile'
                    : 'Add'
                  : enabled
                    ? 'Enabled'
                    : 'Disabled'
              }
              onChange={(next) => onToggleMod(libraryModId, next)}
            />
          </>
        ) : installLocked ? (
          <UpgradePrompt feature="One-click catalog install" compact />
        ) : (
          <MotionButton
            disabled={busy || actionsLocked}
            title={lockedTitle}
            onClick={() => onInstall(mod.id)}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50',
              isExternal
                ? 'border border-launcher-border bg-launcher-elevated text-launcher-text hover:border-launcher-accent/40 hover:text-launcher-accent'
                : 'bg-gradient-to-r from-launcher-accent to-launcher-accent-dim text-launcher-bg shadow-[0_0_20px_var(--color-launcher-glow)]'
            ].join(' ')}
          >
            {isExternal ? (
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            ) : (
              <Download className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            )}
            {busy ? 'Working…' : isExternal ? 'Get Mod' : 'Install'}
          </MotionButton>
        )}
      </div>
    </motion.article>
  )
}
