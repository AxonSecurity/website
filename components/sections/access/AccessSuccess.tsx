'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { mulberry32 } from '@/lib/animation'
import { MARK_BAR_LEFT, MARK_BAR_RIGHT, MARK_LEGS, MARK_STROKE } from '@/components/brand/Logo'

const SPARKS = 28

// Confirmation: the Axon mark draws itself in lime, then fires a ring of
// sparks — the signal received.
export default function AccessSuccess() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      root.querySelector<HTMLElement>('.acc-success-msg')?.focus({ preventScroll: true })
      if (prefersReducedMotion()) return

      const random = mulberry32(7)
      const sparks = gsap.utils.toArray<HTMLElement>('.acc-spark', root)
      const tl = gsap.timeline()
      tl.from('.acc-success-legs', { drawSVG: '50% 50%', duration: 0.9, ease: 'axon-io' })
        .from('.acc-success-bar', { drawSVG: '0%', duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.25')
        .from('.acc-success-ring', { scale: 0.2, opacity: 1, duration: 1.4, ease: 'axon' }, '-=0.1')
        .fromTo(
          sparks,
          { x: 0, y: 0, scale: 1, opacity: 1 },
          {
            x: (index) => Math.cos((index / SPARKS) * Math.PI * 2 + random() * 0.3) * (90 + random() * 120),
            y: (index) => Math.sin((index / SPARKS) * Math.PI * 2 + random() * 0.3) * (90 + random() * 120),
            scale: 0,
            opacity: 0,
            duration: 1.3,
            ease: 'power3.out',
            stagger: { each: 0.004, from: 'random' },
          },
          '<',
        )
        .from('.acc-success-msg > *', { yPercent: 60, opacity: 0, duration: 1, stagger: 0.08 }, '-=1.1')
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="acc-success">
      <div className="acc-success-stage" aria-hidden="true">
        <span className="acc-success-ring" />
        {Array.from({ length: SPARKS }, (_, index) => (
          <span className="acc-spark" key={index} />
        ))}
        <svg className="acc-success-mark" viewBox="0 0 100 100" fill="none">
          <path className="acc-success-legs" d={MARK_LEGS} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
          <path className="acc-success-bar" d={MARK_BAR_LEFT} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
          <path className="acc-success-bar" d={MARK_BAR_RIGHT} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
        </svg>
      </div>
      <div className="acc-success-msg" role="status" tabIndex={-1}>
        <p className="mono acc-success-label">Signal received</p>
        <p className="acc-success-text">
          You&apos;re on the list. We&apos;ll reach out within 2–3 business days to start your coverage.
        </p>
      </div>
    </div>
  )
}
