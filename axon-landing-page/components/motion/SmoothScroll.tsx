'use client'

import { useEffect } from 'react'
import { lerp, smoothing } from '@/lib/animation'

const HALF_LIFE_MS = 110

/**
 * Lenis-style inertial scrolling: wheel input accumulates a target,
 * a rAF loop eases the real scroll position toward it.
 * Native anchors / keyboard / touch stay untouched via resync-on-scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let target = window.scrollY
    let current = window.scrollY
    let raf = 0
    let last = performance.now()

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight

    const frame = (now: number) => {
      const dt = Math.min(now - last, 34)
      last = now
      current = lerp(current, target, smoothing(HALF_LIFE_MS, dt))
      if (Math.abs(target - current) < 0.5) current = target
      window.scrollTo({ top: current, behavior: 'instant' })
      raf = current !== target ? requestAnimationFrame(frame) : 0
    }

    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      const raw =
        event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      const delta = Math.max(-240, Math.min(240, raw))
      target = Math.min(Math.max(target + delta, 0), maxScroll())
      kick()
    }

    const onScroll = () => {
      if (Math.abs(window.scrollY - current) > 1) {
        current = window.scrollY
        target = current
      }
    }

    const controller = new AbortController()
    window.addEventListener('wheel', onWheel, {
      signal: controller.signal,
      passive: false,
    })
    window.addEventListener('scroll', onScroll, {
      signal: controller.signal,
      passive: true,
    })

    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
