import { motion, type HTMLMotionProps } from 'framer-motion'
import type { CatalogMod } from '../../../shared/catalog'
import { formatDownloadCount } from '../../../shared/catalog'
import AnimatedToggle from '@renderer/components/AnimatedToggle'
import InstalledBadge from '@renderer/components/InstalledBadge'
import MotionButton from '@renderer/components/MotionButton'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'

interface CatalogModCardProps extends Omit<HTMLMotionProps<'article'>, 'onToggle'> {
  mod: CatalogMod
  installed: boolean
  enabled: boolean
  busy: boolean
  libraryModId?: string
  onInstall: (catalogId: string) => void
  onToggleMod: (modId: string, enabled: boolean) => void
}

export default function CatalogModCard({
  mod,
  installed,
  enabled,
  busy,
  libraryModId,
  onInstall,
  onToggleMod,
  ...motionProps
}: CatalogModCardProps): React.JSX.Element {
  const isExternal = mod.source === 'external_link'

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ scale: 1.01, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
      className="group flex gap-4 rounded-2xl border border-launcher-border/80 bg-launcher-surface/50 p-3 hover:border-launcher-accent/25 hover:bg-launcher-surface/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
      {...motionProps}
    >
      <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-launcher-elevated">
        <img
          src={mod.thumbnail_url}
          alt=""
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-launcher-bg/60 to-transparent" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-launcher-text">{mod.name}</h3>
          {mod.version && (
            <span className="rounded-md bg-launcher-elevated px-1.5 py-0.5 font-mono text-[10px] text-launcher-muted">
              v{mod.version}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-launcher-muted">
          by <span className="text-launcher-text/80">{mod.author}</span>
          <span className="mx-2 text-launcher-border">·</span>
          <span>{formatDownloadCount(mod.download_count)} downloads</span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-launcher-muted">
          {mod.description}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-2 pl-2">
        {installed && libraryModId ? (
          <>
            <InstalledBadge />
            <AnimatedToggle
              enabled={enabled}
              disabled={busy}
              label={enabled ? 'Enabled' : 'Disabled'}
              onChange={(next) => onToggleMod(libraryModId, next)}
            />
          </>
        ) : (
          <MotionButton
            disabled={busy}
            onClick={() => onInstall(mod.id)}
            className={[
              'rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50',
              isExternal
                ? 'border border-launcher-border bg-launcher-elevated text-launcher-text hover:border-launcher-accent/40 hover:text-launcher-accent'
                : 'bg-gradient-to-r from-launcher-accent to-launcher-accent-dim text-launcher-bg shadow-[0_0_20px_var(--color-launcher-glow)]'
            ].join(' ')}
          >
            {busy ? 'Working…' : isExternal ? 'Get Mod' : 'Install'}
          </MotionButton>
        )}
      </div>
    </motion.article>
  )
}
