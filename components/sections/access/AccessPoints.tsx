'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const POINTS = [
  'A direct line to the founding engineers',
  'A read-only scan of your own stack, in your own tenant',
]

export default function AccessPoints() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const trigger = { trigger: ref.current, start: 'top 85%', once: true }
      gsap.from('.acc-point-rule', { scaleX: 0, duration: 1.3, stagger: 0.12, ease: 'axon-io', scrollTrigger: trigger })
      gsap.from('.acc-point > :not(.acc-point-rule)', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.07,
        delay: 0.15,
        scrollTrigger: trigger,
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="acc-points">
      <p className="acc-points-lead lead">
        Coverage starts with a conversation, then a scan that <strong>never leaves your environment</strong>.
      </p>
      <ol className="acc-point-list">
        {POINTS.map((point, index) => (
          <li className="acc-point" key={point}>
            <span className="acc-point-rule" aria-hidden="true" />
            <span className="acc-point-num mono tabular">{String(index + 1).padStart(2, '0')}</span>
            <span className="acc-point-text">{point}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
