'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const FACTS = [
  {
    title: 'Read-only collectors',
    text: 'Discovery reads configuration and source code. No writes. No network probes.',
  },
  {
    title: 'Metadata only',
    text: 'Never a prompt, an argument, a secret, a path or an email. Content-shaped fields are rejected by construction.',
  },
  {
    title: 'Inbound only',
    text: 'Signed detection content comes in, verified offline. Nothing travels the other way.',
  },
  {
    title: 'AI bill of materials',
    text: 'The graph exports as CycloneDX — JSON for your tooling or a printable report.',
  },
]

export default function SovereignFacts() {
  const ref = useRef<HTMLUListElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const items = gsap.utils.toArray<HTMLElement>('.sov-fact', ref.current)
      gsap.from('.sov-fact-rule', {
        scaleX: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: 'axon-io',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
      gsap.from(
        items.map((item) => item.querySelectorAll('.sov-fact-num, .sov-fact-title, .sov-fact-text')),
        {
          yPercent: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <ul ref={ref} className="sov-facts">
      {FACTS.map((fact, index) => (
        <li key={fact.title} className="sov-fact">
          <span className="sov-fact-rule" aria-hidden="true" />
          <span className="sov-fact-num mono tabular" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="sov-fact-title">{fact.title}</h3>
          <p className="sov-fact-text">{fact.text}</p>
        </li>
      ))}
    </ul>
  )
}
