import { useEffect, useState } from 'react'
import { House, Package, Settings, UserRound, type LucideIcon } from 'lucide-react'
import type { NavItem } from '@renderer/types/navigation'
import ModHarborLogo from '@renderer/components/ModHarborLogo'

interface SidebarProps {
  active: NavItem
  onNavigate: (item: NavItem) => void
}

const navItems: { id: NavItem; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'mods', label: 'Mods', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'account', label: 'Account', icon: UserRound }
]

export default function Sidebar({ active, onNavigate }: SidebarProps): React.JSX.Element {
  const [setupComplete, setSetupComplete] = useState(true)

  useEffect(() => {
    void window.api.setup.getStatus().then((status) => {
      setSetupComplete(status.setupComplete)
    })
    const unsubscribe = window.api.setup.onChanged((status) => {
      setSetupComplete(status.setupComplete)
    })
    return unsubscribe
  }, [])

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-launcher-border bg-launcher-surface/90 backdrop-blur-xl">
      <div className="border-b border-launcher-border px-6 py-7">
        <div className="flex items-center gap-3">
          <ModHarborLogo size={40} className="shrink-0 shadow-[0_4px_16px_rgba(43,159,212,0.25)]" />
          <div>
            <h1 className="font-display text-sm font-bold tracking-wide text-launcher-text">
              ModHarbor
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-launcher-accent">
              Mod launcher
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        {navItems.map((item) => {
          const isActive = active === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              data-tour={item.id === 'mods' ? 'nav-mods' : undefined}
              onClick={() => onNavigate(item.id)}
              className={[
                'group flex items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-launcher-accent/10 text-launcher-accent shadow-[inset_3px_0_0_0_var(--color-launcher-accent)]'
                  : 'text-launcher-muted hover:bg-launcher-elevated hover:text-launcher-text'
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  isActive
                    ? 'bg-launcher-accent/20 text-launcher-accent'
                    : 'bg-launcher-elevated text-launcher-muted group-hover:text-launcher-text'
                ].join(' ')}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-launcher-border p-5">
        <div
          data-tour="setup-status"
          className="rounded-xl border border-launcher-border bg-launcher-elevated/50 p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">
            Status
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={[
                'h-2 w-2 rounded-full',
                setupComplete
                  ? 'animate-pulse bg-launcher-accent shadow-[0_0_8px_var(--color-launcher-accent)]'
                  : 'bg-amber-400'
              ].join(' ')}
            />
            <span className="text-xs text-launcher-text">
              {setupComplete ? 'Ready to launch' : 'Setup required'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
