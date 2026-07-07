'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SUPPORTED_GAMES } from '@/lib/constants'
import GameCover from '@/components/GameCover'
import ScrollReveal, { ScrollRevealItem } from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import HoverLiftCard from '@/components/HoverLiftCard'
import { floatIdle, transition } from '@/lib/motion'

type GameCardProps = {
  game: (typeof SUPPORTED_GAMES)[number]
  index: number
  reduced: boolean
}

function GameCard({ game, index, reduced }: GameCardProps): React.JSX.Element {
  const supported = game.status === 'supported'
  const comingSoon = game.status === 'coming_soon'

  const card = (
    <HoverLiftCard
      className={[
        'group relative overflow-hidden rounded-2xl border bg-surface text-center',
        supported
          ? 'border-accent/30 shadow-lg shadow-sky-400/10'
          : 'border-border/70 opacity-90'
      ].join(' ')}
    >
      {comingSoon ? <div className="shimmer-sweep" aria-hidden /> : null}

      <div className="relative h-44 sm:h-48">
        <GameCover
          gameId={game.id}
          alt={game.title}
          locked={!supported}
          className="[&_img]:group-hover:scale-[1.03] [&_img]:transition-transform [&_img]:duration-300"
        />
      </div>

      <div className="p-6 pt-5">
        <motion.span
          className={[
            'inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
            supported
              ? 'border border-accent/30 bg-accent/10 text-accent'
              : 'border border-border bg-elevated text-muted'
          ].join(' ')}
          whileHover={reduced ? undefined : { scale: 1.04 }}
          transition={transition(reduced, 0.2)}
        >
          {supported ? 'Supported Now' : 'Coming Soon'}
        </motion.span>
        <h3 className="mt-4 font-display text-xl font-bold sm:text-2xl">{game.title}</h3>
        <p className="mt-3 text-sm text-muted">{game.tagline}</p>
      </div>
    </HoverLiftCard>
  )

  if (reduced) return card

  return (
    <motion.div variants={floatIdle(index * 0.6)} initial="initial" animate="animate">
      {card}
    </motion.div>
  )
}

export default function SupportedGames(): React.JSX.Element {
  const reduced = useReducedMotion() ?? false

  return (
    <section id="games" className="relative px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Supported games
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger className="mt-12 grid gap-6 sm:grid-cols-2">
          {SUPPORTED_GAMES.map((game, index) => (
            <ScrollRevealItem key={game.id}>
              <GameCard game={game} index={index} reduced={reduced} />
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
      <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
