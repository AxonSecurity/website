'use client'

import { useState } from 'react'
import PillButton from '@/components/layout/PillButton'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import DrawnMark from '@/components/brand/DrawnMark'
import TideCanvas from '@/components/gl/TideCanvas'
import { ArrowDownRight, ArrowRight } from '@/components/icons'

export default function Hero() {
  const [hovering, setHovering] = useState(false)

  return (
    <section className="hero-tidal" id="top">
      <TideCanvas introspect={hovering} />
      <div className="tide-content shell">
        <Reveal className="tide-mark-stage">
          <DrawnMark />
        </Reveal>
        <Reveal delay={1}>
          <p className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            AI security posture management
          </p>
        </Reveal>
        <Reveal delay={2}>
          <DisplayHeading level={1} wordReveal>
            Know every model you run.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={3}>
          <p className="tide-accent">Nothing slips past you.</p>
        </Reveal>
        <Reveal delay={4}>
          <p className="tide-sub">
            Axon gives security teams one living map of every model, vendor,
            and dependency — always current, ready to govern.
          </p>
        </Reveal>
        <Reveal delay={5}>
          <div
            className="hero-actions tide-actions"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <Magnetic>
              <PillButton href="#access">
                Request access <ArrowRight size={16} />
              </PillButton>
            </Magnetic>
            <a className="text-link hero-anchor" href="#loop">
              See the protocol <ArrowDownRight size={15} />
            </a>
          </div>
        </Reveal>
      </div>
      <div className="tide-scroll-cue" aria-hidden="true">
        SCROLL
      </div>
    </section>
  )
}
