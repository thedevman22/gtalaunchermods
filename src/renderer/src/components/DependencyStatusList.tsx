import { Check, X } from 'lucide-react'
import type { DependencyStatus } from '../../../shared/dependencies'

export default function DependencyStatusList({
  dependencies,
  showPath = false
}: {
  dependencies: DependencyStatus[]
  showPath?: boolean
}): React.JSX.Element {
  return (
    <ul className="mt-4 space-y-3">
      {dependencies.map((dependency) => (
        <li
          key={dependency.id}
          className="rounded-xl border border-launcher-border/70 bg-launcher-elevated/40 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <span
              className={[
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                dependency.installedInGame
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : dependency.lastInstallError
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-launcher-border/60 text-launcher-muted'
              ].join(' ')}
            >
              {dependency.installedInGame ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              ) : dependency.lastInstallError ? (
                <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-launcher-text">{dependency.name}</p>
                <span className="font-mono text-[10px] text-launcher-muted">{dependency.fileName}</span>
              </div>
              <p
                className={[
                  'mt-1 text-xs',
                  dependency.installedInGame
                    ? 'text-emerald-400'
                    : dependency.lastInstallError
                      ? 'text-red-300'
                      : 'text-launcher-muted'
                ].join(' ')}
              >
                {dependency.lastInstallError ?? dependency.statusLabel}
              </p>
              {showPath && dependency.gamePath ? (
                <p className="mt-1 truncate font-mono text-[10px] text-launcher-muted">
                  {dependency.gamePath}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
