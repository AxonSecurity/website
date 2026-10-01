'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { getScrollVelocity } from '@/lib/scroll'

interface MarqueeProps {
  children: ReactNode
  /** Base speed in px per second. */
  speed?: number
  direction?: 1 | -1
  /** Scroll velocity boosts speed, flips direction with scroll, and skews. */
  reactive?: boolean
  skew?: boolean
  fade?: boolean
  copies?: number
  className?: string
  label?: string
}

// Infinite ticker on the GSAP ticker. One copy's width is the wrap period,
// so the loop is seamless regardless of content.
export default function Marquee({
  children,
  speed = 60,
  direction = -1,
  reactive = true,
  skew = false,
  fade = true,
  copies = 4,
  className = '',
  label,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root || prefersReducedMotion()) return
      const track = root.querySelector<HTMLElement>('.marquee-track')
      const first = root.querySelector<HTMLElement>('.marquee-copy')
      if (!track || !first) return

      let period = first.offsetWidth
      let x = 0
      let heading: number = direction
      let boost = 0
      let visible = true
      const setX = gsap.quickSetter(track, 'x', 'px')
      const setSkew = gsap.quickSetter(track, 'skewX', 'deg')

      const measure = () => {
        period = first.offsetWidth || period
      }
      const observer = new ResizeObserver(measure)
      observer.observe(first)

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      io.observe(root)

      const tick = (_time: number, delta: number) => {
        if (!visible || period <= 0) return
        const dt = Math.min(delta, 50) / 1000
        if (reactive) {
          const velocity = getScrollVelocity()
          if (Math.abs(velocity) > 0.5) heading = velocity > 0 ? direction : -direction
          boost += (Math.min(Math.abs(velocity) * 0.9, 14) - boost) * 0.08
        }
        x += heading * speed * (1 + boost) * dt
        x = gsap.utils.wrap(-period, 0, x)
        setX(x)
        if (skew) setSkew(gsap.utils.clamp(-9, 9, -getScrollVelocity() * 0.35))
      }
      gsap.ticker.add(tick)

      return () => {
        gsap.ticker.remove(tick)
        observer.disconnect()
        io.disconnect()
      }
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      className={`marquee ${fade ? 'marquee-fade' : ''} ${className}`.trim()}
      aria-label={label}
      role={label ? 'marquee' : undefined}
    >
      <div className="marquee-track">
        {Array.from({ length: copies }, (_, index) => (
          <div className="marquee-copy" key={index} aria-hidden={index > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
