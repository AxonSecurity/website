'use client'

import { Fragment, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'

const TEXT = 'Agent security for the AI stack you already run.'

type Word = { text: string; serif?: boolean; breakAfter?: boolean }

// Desktop breaks after "security" and "stack"; below 760px words wrap freely.
const WORDS: Word[] = [
  { text: 'Agent' },
  { text: 'security', breakAfter: true },
  { text: 'for' },
  { text: 'the' },
  { text: 'AI' },
  { text: 'stack', breakAfter: true },
  { text: 'you' },
  { text: 'already', serif: true },
  { text: 'run.' },
]

const BASE_WIDTH = 96

// The only h1. Chars rise from their word masks while the width axis
// stretches from condensed to set. Static once it has landed.
export default function HeroTitle() {
  const ref = useRef<HTMLHeadingElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root || prefersReducedMotion()) return
      const chars = gsap.utils.toArray<HTMLElement>('.ht-char', root)
      const sans = chars.filter((char) => !char.classList.contains('ht-serif'))
      const serif = chars.filter((char) => char.classList.contains('ht-serif'))

      gsap.set(chars, { yPercent: 135 })
      gsap.set(sans, { '--cw': 75 })
      gsap.set(serif, { rotate: 12 })

      const rise = gsap
        .timeline({ paused: true, delay: 0.25 })
        .to(chars, { yPercent: 0, duration: 1.5, stagger: 0.024, ease: 'axon' }, 0)
        .to(sans, { '--cw': BASE_WIDTH, duration: 2.2, stagger: 0.024, ease: 'axon' }, 0.1)
        .to(serif, { rotate: 0, duration: 1.6, ease: 'axon' }, 0.45)
      return onIntroDone(() => rise.play())
    },
    { scope: ref },
  )

  return (
    <h1 ref={ref} className="hero-title">
      <span className="sr-only">{TEXT}</span>
      <span className="ht-visual" aria-hidden="true">
        {WORDS.map((word, w) => (
          <Fragment key={w}>
            <span className={`ht-word ${word.serif ? 'ht-word-serif serif-i lime' : ''}`}>
              {Array.from(word.text).map((char, c) => (
                <span className={`ht-char ${word.serif ? 'ht-serif' : ''}`} key={c}>
                  {char}
                </span>
              ))}
            </span>
            {w < WORDS.length - 1 ? ' ' : null}
            {word.breakAfter ? <br className="ht-br" /> : null}
          </Fragment>
        ))}
      </span>
    </h1>
  )
}
