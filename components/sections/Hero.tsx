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
        <Reveal delay={2}>
          <DisplayHeading level={1} wordReveal>
            We take care of your security. End to end.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={3}>
          <p className="tide-accent">You don&apos;t need a security team. That&apos;s our job.</p>
        </Reveal>
        <Reveal delay={4}>
          <p className="tide-sub">
            Axon is the managed security service for AI: we find, govern, and
            defend every model your company runs — always current, audit-ready,
            and off your plate.
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
                Get covered <ArrowRight size={16} />
              </PillButton>
            </Magnetic>
            <a className="text-link hero-anchor" href="#loop">
              How it works <ArrowDownRight size={15} />
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
