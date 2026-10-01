'use client'

import { useRef } from 'react'
import Scramble from '@/components/motion/Scramble'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

interface EyebrowProps {
  index?: string
  label: string
  className?: string
  trigger?: 'scroll' | 'intro'
}

// "02 ——— DISCOVER": the chapter marker every section opens with.
export default function Eyebrow({ index, label, className = '', trigger = 'scroll' }: EyebrowProps) {
  const ref = useRef<HTMLParagraphElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || trigger !== 'scroll') return
      gsap.from('.eyebrow-rule', {
        scaleX: 0,
        duration: 1.2,
        scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={`eyebrow ${className}`.trim()}>
      {index ? <span className="eyebrow-index">{index}</span> : null}
      <span className="eyebrow-rule" aria-hidden="true" />
      <Scramble text={label} trigger={trigger} />
    </p>
  )
}
