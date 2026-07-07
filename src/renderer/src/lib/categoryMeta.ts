import {
  Car,
  LayoutGrid,
  Map,
  Sparkles,
  Swords,
  Terminal,
  UsersRound,
  type LucideIcon
} from 'lucide-react'
import type { ModCategory } from '../../../shared/catalog'

export interface CategoryMeta {
  icon: LucideIcon
  /** Icon/text tint. */
  text: string
  /** Subtle background tint for icon tiles and chips. */
  bg: string
  /** Matching border tint for chips. */
  border: string
}

export const CATEGORY_META: Record<ModCategory | 'all', CategoryMeta> = {
  all: {
    icon: LayoutGrid,
    text: 'text-launcher-accent',
    bg: 'bg-launcher-accent/10',
    border: 'border-launcher-accent/25'
  },
  vehicles: {
    icon: Car,
    text: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/25'
  },
  weapons: {
    icon: Swords,
    text: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/25'
  },
  characters: {
    icon: UsersRound,
    text: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/25'
  },
  maps: {
    icon: Map,
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/25'
  },
  scripts_trainers: {
    icon: Terminal,
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/25'
  },
  visual_graphics: {
    icon: Sparkles,
    text: 'text-cyan-300',
    bg: 'bg-cyan-300/10',
    border: 'border-cyan-300/25'
  }
}

export function getCategoryMeta(category: ModCategory | 'all'): CategoryMeta {
  return CATEGORY_META[category] ?? CATEGORY_META.all
}
