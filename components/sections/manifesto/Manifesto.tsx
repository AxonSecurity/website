'use client'

import { Fragment, useRef } from 'react'
import Eyebrow from '@/components/ui/Eyebrow'
import { gsap, useGSAP, SCRAMBLE_CHARS } from '@/lib/gsap'
import ChipGlyph, { type ChipKind } from './ChipGlyph'
import './manifesto.css'

interface Token {
  w: string
  chip?: ChipKind
  /** Punctuation glued after the chip, e.g. "keys [chip]," */
  tail?: string
}

const BODY: Token[] = [
  { w: 'Your' }, { w: 'agents' }, { w: 'already' }, { w: 'act' }, { w: 'for' }, { w: 'you.' },
  { w: 'They' }, { w: 'hold' }, { w: 'keys', chip: 'key', tail: ',' },
  { w: 'call' }, { w: 'tools', chip: 'tool', tail: ',' },
  { w: 'read' }, { w: 'your' }, { w: 'data', chip: 'data', tail: ',' },
  { w: 'and' }, { w: 'hand' }, { w: 'work' }, { w: 'to' }, { w: 'each' }, { w: 'other', chip: 'delegate' },
  { w: '—' }, { w: 'under' }, { w: 'identities' }, { w: 'nobody' }, { w: 'reviewed.' },
  { w: 'Most' }, { w: 'companies' }, { w: 'can’t' }, { w: 'name' }, { w: 'them' }, { w: 'all.' },
]

const FINAL: Token[] = [{ w: 'Axon' }, { w: 'can.' }]

const STATUS_BEFORE = 'Unmapped agents ··· unknown'
const STATUS_AFTER = 'Mapped agents ··· all of them'

// Word timing inside the scrubbed timeline (seconds of timeline time).
const WORD_STEP = 0.32
const WORD_FADE = 0.9

function renderToken(token: Token, index: number, final = false) {
  return (
    <Fragment key={`${token.w}-${index}`}>
      <span className={`pw${final ? ' pw-final' : ''}`}>{token.w}</span>
      {token.chip ? (
        <>
          {' '}
          <span className="pchip" data-chip={token.chip} aria-hidden="true">
            <span className="pchip-flash" />
            <ChipGlyph kind={token.chip} />
          </span>
        </>
      ) : null}
      {token.tail ? <span className="pw pw-tail">{token.tail}</span> : null}{' '}
    </Fragment>
  )
}

export default function Manifesto() {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const words = gsap.utils.toArray<HTMLElement>('.pw', root)
        const chips = gsap.utils.toArray<HTMLElement>('.pchip', root)
        const fill = root.querySelector<HTMLElement>('.pm-progress-fill')
        const status = root.querySelector<HTMLElement>('.pm-status-text')

        gsap.set(words, { opacity: 0.14 })
        gsap.set('.pm-final', { '--wdth': 92, color: '#f3f2f2' })

        // Each chip pops (not scrubbed) the moment its word lights up.
        const pops = chips.map((chip) =>
          gsap
            .timeline({ paused: true })
            .fromTo(
              chip,
              { opacity: 0.16, scale: 0.86, borderColor: 'rgba(243, 242, 242, 0.5)' },
              { opacity: 1, scale: 1, borderColor: 'rgba(149, 255, 42, 0.6)', duration: 0.7, ease: 'back.out(2.6)' },
            )
            .fromTo(
              chip.querySelector('.pchip-glyph'),
              { scale: 0, rotate: -70 },
              { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2.2)' },
              0.05,
            )
            .fromTo(chip.querySelector('.pchip-flash'), { opacity: 1 }, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.1),
        )
        pops.forEach((pop) => pop.progress(0))

        const chipTimes = chips.map((chip) => {
          const word = chip.previousElementSibling as HTMLElement | null
          const index = word ? words.indexOf(word) : 0
          return index * WORD_STEP + WORD_FADE * 0.6
        })

        let statusFlipped = false
        const finalStart = words.length * WORD_STEP

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=180%',
            pin: true,
            refreshPriority: 1,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (fill) fill.style.transform = `scaleX(${self.progress.toFixed(4)})`
            },
          },
          onUpdate: () => {
            const time = tl.time()
            chipTimes.forEach((at, index) => {
              const pop = pops[index]
              if (time >= at && pop.reversed()) pop.play()
              else if (time < at && !pop.reversed()) pop.reverse()
            })
            const flip = time >= finalStart
            if (flip !== statusFlipped && status) {
              statusFlipped = flip
              gsap.to(status, {
                duration: 0.7,
                ease: 'none',
                overwrite: true,
                scrambleText: { text: flip ? STATUS_AFTER : STATUS_BEFORE, chars: SCRAMBLE_CHARS, speed: 0.8 },
              })
              root.classList.toggle('is-mapped', flip)
            }
          },
        })

        words.forEach((word, index) => {
          tl.to(word, { opacity: 1, duration: WORD_FADE }, index * WORD_STEP)
        })
        tl.fromTo(
          '.pm-final',
          { textShadow: '0 0 0.6em rgba(149, 255, 42, 0)' },
          {
            '--wdth': 125,
            color: '#95ff2a',
            textShadow: '0 0 0.6em rgba(149, 255, 42, 0.24)',
            duration: 1.4,
            ease: 'power2.out',
          },
          finalStart - 0.2,
        )
        tl.to({}, { duration: 0.8 })

        // Start every pop reversed so the first play() is a clean forward run.
        pops.forEach((pop) => pop.reverse())

        return () => {
          pops.forEach((pop) => pop.kill())
          root.classList.remove('is-mapped')
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const status = root.querySelector<HTMLElement>('.pm-status-text')
        if (status) status.textContent = STATUS_AFTER
        root.classList.add('is-mapped')
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="premise" data-chapter="Premise" className="premise">
      <div className="premise-inner wrap">
        <div className="premise-top">
          <Eyebrow index="01" label="Premise" />
          <p className="mono premise-kicker" aria-hidden="true">
            Why Axon exists
          </p>
        </div>

        <p className="premise-text">
          {BODY.map((token, index) => renderToken(token, index))}
          <span className="pm-final">{FINAL.map((token, index) => renderToken(token, index, true))}</span>
        </p>

        <div className="premise-foot" aria-hidden="true">
          <p className="mono pm-status">
            <span className="pm-status-dot" />
            <span className="pm-status-text">{STATUS_BEFORE}</span>
          </p>
          <div className="pm-progress">
            <div className="pm-progress-fill" />
          </div>
        </div>
      </div>
    </section>
  )
}
