import type { ModCategory } from '../../../shared/catalog'
import { MOD_CATEGORIES } from '../../../shared/catalog'

interface CatalogSidebarProps {
  activeCategory: ModCategory | 'all'
  searchQuery: string
  onCategoryChange: (category: ModCategory | 'all') => void
  onSearchChange: (query: string) => void
  resultCount: number
}

export default function CatalogSidebar({
  activeCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  resultCount
}: CatalogSidebarProps): React.JSX.Element {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-launcher-border/80 bg-launcher-surface/40">
      <div className="border-b border-launcher-border/60 p-4">
        <label className="sr-only" htmlFor="mod-search">
          Search mods
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-launcher-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="mod-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search mods…"
            className="w-full rounded-xl border border-launcher-border bg-launcher-elevated/80 py-2.5 pl-10 pr-3 text-sm text-launcher-text outline-none transition-colors placeholder:text-launcher-muted focus:border-launcher-accent/50 focus:ring-1 focus:ring-launcher-accent/20"
          />
        </div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">
          {resultCount} result{resultCount === 1 ? '' : 's'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {MOD_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(category.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-launcher-accent/12 text-launcher-accent shadow-[inset_3px_0_0_0_var(--color-launcher-accent)]'
                      : 'text-launcher-muted hover:bg-launcher-elevated/80 hover:text-launcher-text'
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-lg text-sm',
                      isActive
                        ? 'bg-launcher-accent/15 text-launcher-accent'
                        : 'bg-launcher-elevated text-launcher-muted'
                    ].join(' ')}
                  >
                    {category.icon}
                  </span>
                  <span className="truncate">{category.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
