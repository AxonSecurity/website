'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { clamp } from '@/lib/animation'

interface PinnedScene {
  ref: RefObject<HTMLElement | null>
  activeIndex: number
}

export function usePinnedScene(stepCount: number): PinnedScene {
  const ref = useRef<HTMLElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const apply = (index: number, progress: number) => {
      setActiveIndex(index)
      element.style.setProperty('--loop-progress', progress.toFixed(4))
    }

    if (reduced) {
      apply(stepCount - 1, 1)
      return
    }

    let raf = 0
    let lastIndex = -1

    const update = () => {
      raf = 0
      const rect = element.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress =
        total > 0 ? clamp(-rect.top / total, 0, 1) : 1
      const index = Math.min(
        Math.floor(progress * stepCount),
        stepCount - 1,
      )
      element.style.setProperty('--loop-progress', progress.toFixed(4))
      if (index !== lastIndex) {
        lastIndex = index
        setActiveIndex(index)
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const controller = new AbortController()
    window.addEventListener('scroll', onScroll, {
      signal: controller.signal,
      passive: true,
    })
    window.addEventListener('resize', onScroll, {
      signal: controller.signal,
    })
    update()

    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [stepCount])

  return { ref, activeIndex }
}
