'use client'

import { useEffect, useRef } from 'react'

interface KineticMarkerProps {
  word: string
  /** Scroll-parallax factor. Negative drifts against the scroll. */
  speed?: number
}

/**
 * Auros-style oversized outline ghost word drifting on scroll-parallax
 * behind section content. Static under reduced motion.
 */
export default function KineticMarker({ word, speed = -0.16 }: KineticMarkerProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let queued = false

    const update = () => {
      queued = false
      const host = el.parentElement
      if (!host) return
      const rect = host.getBoundingClientRect()
      const delta =
        (rect.top + rect.height / 2 - window.innerHeight / 2) * speed
      el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`
    }

    const schedule = () => {
      if (!queued) {
        queued = true
        raf = requestAnimationFrame(update)
      }
    }

    update()
    const controller = new AbortController()
    window.addEventListener('scroll', schedule, {
      signal: controller.signal,
      passive: true,
    })
    window.addEventListener('resize', schedule, { signal: controller.signal })
    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={ref} className="kinetic-marker" aria-hidden="true">
      {word}
    </div>
  )
}
