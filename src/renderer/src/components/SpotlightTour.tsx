import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Anchor } from 'lucide-react'
import MotionButton from '@renderer/components/MotionButton'
import type { TourStep } from '@renderer/lib/tour'

interface SpotlightTourProps {
  steps: TourStep[]
  onClose: () => void
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

const TOOLTIP_WIDTH = 340
const TOOLTIP_HEIGHT = 230
const SPOTLIGHT_PADDING = 8
const EDGE_MARGIN = 16

function findTarget(step: TourStep): Element | null {
  for (const selector of step.targets) {
    const element = document.querySelector(selector)
    if (element) return element
  }
  return null
}

export default function SpotlightTour({ steps, onClose }: SpotlightTourProps): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [rect, setRect] = useState<SpotlightRect | null>(null)

  const step = steps[index]
  const isLast = index === steps.length - 1

  const measure = useCallback((): void => {
    if (!step) return
    const element = findTarget(step)
    if (!element) {
      setRect(null)
      return
    }
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const box = element.getBoundingClientRect()
    setRect({
      top: box.top - SPOTLIGHT_PADDING,
      left: box.left - SPOTLIGHT_PADDING,
      width: box.width + SPOTLIGHT_PADDING * 2,
      height: box.height + SPOTLIGHT_PADDING * 2
    })
  }, [step])

  useEffect(() => {
    if (finished) return
    const raf = requestAnimationFrame(measure)
    // Re-measure once layout/page transitions settle, then track resizes.
    const settle = window.setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', measure)
    }
  }, [measure, finished])

  const tooltipPosition = ((): { top: number; left: number } => {
    if (!rect) {
      return {
        top: window.innerHeight / 2 - TOOLTIP_HEIGHT / 2,
        left: window.innerWidth / 2 - TOOLTIP_WIDTH / 2
      }
    }
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
    left = Math.min(Math.max(left, EDGE_MARGIN), window.innerWidth - TOOLTIP_WIDTH - EDGE_MARGIN)
    let top = rect.top + rect.height + 14
    if (top + TOOLTIP_HEIGHT > window.innerHeight - EDGE_MARGIN) {
      top = Math.max(rect.top - TOOLTIP_HEIGHT - 14, EDGE_MARGIN)
    }
    return { top, left }
  })()

  const handleNext = (): void => {
    if (isLast) {
      setFinished(true)
    } else {
      setIndex((value) => value + 1)
    }
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-launcher-bg/80 p-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="w-full max-w-sm rounded-3xl border border-launcher-accent/40 bg-launcher-surface p-8 text-center shadow-[0_24px_80px_var(--color-launcher-glow)]"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-launcher-accent to-launcher-accent-dim text-launcher-bg shadow-[0_0_32px_var(--color-launcher-glow)]">
            <Anchor className="h-7 w-7" strokeWidth={2} aria-hidden />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-launcher-text">
            You&apos;re ready
          </h2>
          <p className="type-body mt-3">
            Connect your folder, pick mods, organize them into profiles, and launch story mode.
            Replay this tour anytime from Settings → Help &amp; guides.
          </p>
          <MotionButton onClick={onClose} className="btn-primary mt-7 w-full">
            Start modding
          </MotionButton>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Welcome tour">
      {/* Blocks interaction with the page while the tour runs. */}
      <div className="absolute inset-0" />

      {rect ? (
        <motion.div
          aria-hidden
          initial={false}
          animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="pointer-events-none absolute rounded-2xl border-2 border-launcher-accent/70 shadow-[0_0_0_9999px_rgba(8,10,13,0.74)]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[rgba(8,10,13,0.74)]" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          style={{ top: tooltipPosition.top, left: tooltipPosition.left, width: TOOLTIP_WIDTH }}
          className="absolute rounded-2xl border border-launcher-border bg-launcher-surface p-6 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="type-section text-launcher-accent">
              Step {index + 1} of {steps.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="type-caption shrink-0 font-semibold transition-colors hover:text-launcher-text"
            >
              Skip tour
            </button>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold text-launcher-text">{step.title}</h3>
          <p className="type-caption mt-2 leading-relaxed">{step.body}</p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5" aria-hidden>
              {steps.map((s, dotIndex) => (
                <span
                  key={s.id}
                  className={[
                    'h-1.5 rounded-full transition-all duration-300',
                    dotIndex === index ? 'w-5 bg-launcher-accent' : 'w-1.5 bg-launcher-border'
                  ].join(' ')}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex((value) => value - 1)}
                  className="btn-ghost px-3 py-1.5 text-[10px]"
                >
                  Back
                </button>
              )}
              <MotionButton onClick={handleNext} className="btn-primary px-4 py-2 text-[10px]">
                {isLast ? 'Finish' : 'Next'}
              </MotionButton>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
