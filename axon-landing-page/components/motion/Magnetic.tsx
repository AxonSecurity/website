'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { lerp, smoothing } from '@/lib/animation'

interface MagneticProps {
  children: ReactNode
  strength?: number
  halfLifeMs?: number
}

/** Cursor-attracted spring wrapper. Disabled for reduced motion + touch. */
export default function Magnetic({
  children,
  strength = 0.28,
  halfLifeMs = 70,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(now - last, 34)
      last = now
      const ease = smoothing(halfLifeMs, dt)
      x = lerp(x, tx, ease)
      y = lerp(y, ty, ease)
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      raf =
        Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05
          ? requestAnimationFrame(frame)
          : 0
    }

    const kick = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2 - x
      const cy = rect.top + rect.height / 2 - y
      tx = (event.clientX - cx) * strength
      ty = (event.clientY - cy) * strength
      kick()
    }

    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }

    const controller = new AbortController()
    el.addEventListener('pointermove', onMove, { signal: controller.signal })
    el.addEventListener('pointerleave', onLeave, { signal: controller.signal })
    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [strength, halfLifeMs])

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  )
}
