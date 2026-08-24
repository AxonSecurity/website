'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface ParallaxProps {
  children: ReactNode
  factor?: number
  className?: string
  as?: 'div' | 'span'
}

export default function Parallax({
  children,
  factor = 0.12,
  className = '',
  as: Tag = 'div',
}: ParallaxProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0

    const update = () => {
      raf = 0
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
      const shift = Math.max(
        -1,
        Math.min(1, progress),
      ) * factor * viewport * 0.5
      element.style.setProperty('--parallax-y', `${shift.toFixed(1)}px`)
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
  }, [factor])

  const style = {
    '--parallax-y': '0px',
  } as CSSProperties

  return (
    <Tag ref={ref as never} className={className} style={style} aria-hidden="true">
      {children}
    </Tag>
  )
}
