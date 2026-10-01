'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

// Springs its child toward the pointer while hovered; fine pointers only.
export default function Magnetic({
  children,
  strength = 0.32,
  className = '',
}: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const element = ref.current
      if (!element) return
      const mm = gsap.matchMedia()
      mm.add(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const xTo = gsap.quickTo(element, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' })
          const yTo = gsap.quickTo(element, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' })

          const onMove = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect()
            xTo((event.clientX - (rect.left + rect.width / 2)) * strength)
            yTo((event.clientY - (rect.top + rect.height / 2)) * strength)
          }
          const onLeave = () => {
            xTo(0)
            yTo(0)
          }

          element.addEventListener('pointermove', onMove)
          element.addEventListener('pointerleave', onLeave)
          return () => {
            element.removeEventListener('pointermove', onMove)
            element.removeEventListener('pointerleave', onLeave)
          }
        },
      )
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={`magnetic ${className}`.trim()} style={{ display: 'inline-block' }}>
      {children}
    </div>
  )
}
