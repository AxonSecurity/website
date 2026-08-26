'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Reveal from '@/components/motion/Reveal'
import { ArrowRight } from '@/components/icons'

interface Capability {
  num: string
  label: string
  title: string
  text: string
  linkHref: string
  linkText: string
  diagram: ReactNode
}

function NetworkDiagram() {
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <path className="diagram-line" d="M30 110 L110 40 L190 95" stroke="currentColor" strokeWidth="1" pathLength={1} />
      <path className="diagram-line" d="M110 40 L110 120 M30 110 L110 120 L190 95" stroke="currentColor" strokeWidth="1" pathLength={1} opacity="0.5" />
      <circle className="diagram-accent" cx="110" cy="40" r="5" fill="#95ff2a" />
      <circle cx="30" cy="110" r="4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="190" cy="95" r="4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="110" cy="120" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function GraphDiagram() {
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <path className="diagram-line" d="M40 75 L85 35 L140 55 L180 30 M85 35 L90 105 L40 75 M140 55 L150 115 L90 105 M140 55 L180 100" stroke="currentColor" strokeWidth="1" pathLength={1} />
      <path className="diagram-line" d="M85 35 L140 55" stroke="#95ff2a" strokeWidth="1.6" pathLength={1} />
      <circle className="diagram-accent" cx="140" cy="55" r="5" fill="#95ff2a" />
      <circle cx="40" cy="75" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="85" cy="35" r="4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="180" cy="30" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="90" cy="105" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="150" cy="115" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="180" cy="100" r="4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function GateDiagram() {
  return (
    <svg width="220" height="150" viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <path className="diagram-line" d="M20 75 H70 M150 75 H200" stroke="currentColor" strokeWidth="1" pathLength={1} />
      <path className="diagram-line" d="M110 25 L155 45 V85 C155 112 134 124 110 132 C86 124 65 112 65 85 V45 Z" stroke="#95ff2a" strokeWidth="1.4" pathLength={1} />
      <path className="diagram-line" d="M92 78 L106 92 L130 62" stroke="#95ff2a" strokeWidth="1.6" pathLength={1} />
      <circle cx="20" cy="75" r="3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="200" cy="75" r="3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

const CAPABILITIES: Capability[] = [
  {
    num: '01',
    label: 'DISCOVER',
    title: 'Inventory beyond the shadow stack.',
    text: 'Models, agents, APIs, and vendor integrations — found in your cloud, code, and contracts, including unapproved LLM wrappers and internal agents nobody reported.',
    linkHref: '#loop',
    linkText: 'See the protocol',
    diagram: <NetworkDiagram />,
  },
  {
    num: '02',
    label: 'UNDERSTAND',
    title: 'Context, not noise.',
    text: 'Every finding lands in its real blast radius: which PII each model touches, which permissions it carries, which vendor stands behind it.',
    linkHref: '#loop',
    linkText: 'Explore risk signals',
    diagram: <GraphDiagram />,
  },
  {
    num: '03',
    label: 'GOVERN',
    title: 'Policy becomes guardrails.',
    text: 'Write the standard once. Axon enforces it at every model surface and produces audit evidence as a side effect of operating — e.g., block models accessing production PII without approval.',
    linkHref: '#governance',
    linkText: 'See governance in action',
    diagram: <GateDiagram />,
  },
]

export default function Capabilities() {
  const deckRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0

    const update = () => {
      raf = 0
      const rows = Array.from(
        deck.querySelectorAll<HTMLElement>('.cap-row'),
      )
      for (let i = 0; i < rows.length - 1; i += 1) {
        const overlap =
          rows[i].getBoundingClientRect().bottom -
          rows[i + 1].getBoundingClientRect().top
        rows[i].classList.toggle('is-covered', overlap > 2)
      }
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
  }, [])

  return (
    <section className="caps shell" id="platform">
      <div className="caps-head">
        <Reveal>
          <p className="eyebrow">The platform</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            Built for the whole model layer.
          </DisplayHeading>
        </Reveal>
      </div>
      <div className="cap-deck" ref={deckRef}>
        {CAPABILITIES.map((capability) => (
          <article className="cap-row" key={capability.num}>
            <span className="cap-num" aria-hidden="true">
              {capability.num}
            </span>
            <div className="cap-body">
              <span className="cap-label">{capability.label}</span>
              <DisplayHeading level={3}>{capability.title}</DisplayHeading>
              <p className="body-copy">{capability.text}</p>
              <a className="text-link" href={capability.linkHref}>
                {capability.linkText} <ArrowRight size={15} />
              </a>
            </div>
            <div className="cap-diagram">{capability.diagram}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
