'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import './cursor.css'

const FINE_POINTER = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const INTERACTIVE = 'a, button, [data-cursor], label, summary'
const TEXT_INPUT = 'input, textarea, [contenteditable="true"]'

// A lime dot that tracks the pointer 1:1 and a ring that trails it. Over
// anything interactive the ring swells; `data-cursor="LABEL"` prints a label.
export default function Cursor() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!root || !ring || !dot || !label) return
    if (!window.matchMedia(FINE_POINTER).matches) return

    document.documentElement.classList.add('has-cursor')
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' })

    let shown = false
    let current: Element | null = null

    const setState = (target: Element | null) => {
      if (target === current) return
      current = target
      const text = target?.getAttribute('data-cursor') ?? ''
      const isText = !!target?.matches?.(TEXT_INPUT)
      root.dataset.state = !target ? 'idle' : isText ? 'text' : text ? 'label' : 'hover'
      label.textContent = text
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      if (!shown) {
        shown = true
        gsap.set([ring, dot], { x: event.clientX, y: event.clientY })
        root.dataset.visible = 'true'
      }
      ringX(event.clientX)
      ringY(event.clientY)
      dotX(event.clientX)
      dotY(event.clientY)
      const target = event.target instanceof Element ? event.target : null
      setState(target?.closest(`${TEXT_INPUT}, ${INTERACTIVE}`) ?? null)
    }

    const onDown = () => {
      root.dataset.pressed = 'true'
    }
    const onUp = () => {
      root.dataset.pressed = 'false'
    }
    const onLeave = () => {
      shown = false
      root.dataset.visible = 'false'
    }

    const controller = new AbortController()
    const { signal } = controller
    window.addEventListener('pointermove', onMove, { signal, passive: true })
    window.addEventListener('pointerdown', onDown, { signal })
    window.addEventListener('pointerup', onUp, { signal })
    document.documentElement.addEventListener('pointerleave', onLeave, { signal })

    return () => {
      controller.abort()
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={rootRef} className="cursor" data-state="idle" data-visible="false" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring">
        <div className="cursor-ring-shape">
          <span ref={labelRef} className="cursor-label" />
        </div>
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
