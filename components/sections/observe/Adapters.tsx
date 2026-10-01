'use client'

import { useRef } from 'react'
import { ScrollTrigger, useGSAP, gsap } from '@/lib/gsap'

const ADAPTERS = [
  { name: 'OpenTelemetry', text: 'Content attributes stripped at the Collector, and again on ingest.' },
  { name: 'MCP gateway', text: 'Call log: argument shapes, never values.' },
  { name: 'Google ADK', text: 'In-process plugin writing a local spool.' },
  { name: 'CrewAI', text: 'In-process listener writing a local spool.' },
  { name: 'Claude Code hooks', text: 'Non-blocking events only. Installed with a shown diff.' },
] as const

// Five adapters, one event contract. Their status lights come up in turn.
export default function Adapters() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        root.classList.remove('is-on')
        gsap.from('.ob-adapter', {
          y: 26,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: 'top 85%', once: true },
        })
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 75%',
          once: true,
          onEnter: () => root.classList.add('is-on'),
        })
        return () => {
          trigger.kill()
          root.classList.add('is-on')
        }
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="ob-adapters is-on">
      <p className="ob-adapters-label mono">
        Adapters <span className="ob-adapters-count">5 · one event contract</span>
      </p>
      <ul className="ob-adapter-list">
        {ADAPTERS.map((adapter, index) => (
          <li className="ob-adapter" key={adapter.name} style={{ '--i': index } as React.CSSProperties}>
            <span className="ob-led" aria-hidden="true" />
            <h3 className="ob-adapter-name">{adapter.name}</h3>
            <p className="ob-adapter-text">{adapter.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
