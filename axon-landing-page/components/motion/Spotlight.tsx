'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor-following lime radial tint (alpha <= 0.06) rendered behind the
 * parent feature row. Listeners attach to the row; inert for touch and
 * reduced motion.
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const host = el.parentElement
    if (!host) return

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
      el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    }
    const onEnter = () => el.style.setProperty('--spot-o', '1')
    const onLeave = () => el.style.setProperty('--spot-o', '0')

    const controller = new AbortController()
    host.addEventListener('pointermove', onMove, { signal: controller.signal })
    host.addEventListener('pointerenter', onEnter, { signal: controller.signal })
    host.addEventListener('pointerleave', onLeave, { signal: controller.signal })
    return () => controller.abort()
  }, [])

  return <div ref={ref} className="spotlight-layer" aria-hidden="true" />
}
