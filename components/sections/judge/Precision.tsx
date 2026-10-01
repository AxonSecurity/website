'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { mulberry32 } from '@/lib/animation'

const FROM = 123
const TO = 18
const COLUMNS = 3

// Deterministic cut order: the first TO indices survive.
const ORDER = (() => {
  const random = mulberry32(20260920)
  const indices = Array.from({ length: FROM }, (_, index) => index)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const rank = new Array<number>(FROM)
  indices.forEach((dotIndex, position) => {
    rank[dotIndex] = position
  })
  return rank
})()

// Continuous odometer position for a column: the ones column spins freely,
// higher columns only roll while the column below carries.
function columnPosition(value: number, column: number): number {
  const base = 10 ** column
  if (column === 0) return value
  const below = value % base
  return Math.floor(value / base) + Math.max(0, below - (base - 1))
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export default function Precision() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const strips = gsap.utils.toArray<HTMLElement>('.pr-strip', root).reverse()
      const cells = gsap.utils.toArray<HTMLElement>('.pr-col', root).reverse()
      const dots = gsap.utils.toArray<HTMLElement>('.pr-dot', root)

      const render = (value: number, settled: boolean) => {
        strips.forEach((strip, column) => {
          const position = columnPosition(value, column) % 10
          strip.style.transform = `translateY(${-position}em)`
          const leading = column > 0 && value < 10 ** column
          cells[column].classList.toggle('is-leading', leading)
        })
        const alive = Math.round(value)
        dots.forEach((dot, index) => {
          dot.classList.toggle('is-cut', ORDER[index] >= alive)
          dot.classList.toggle('is-kept', settled && ORDER[index] < TO)
        })
      }

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const state = { value: FROM }
        render(FROM, false)
        root.classList.remove('is-done')
        gsap.to(state, {
          value: TO,
          duration: 3.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: root, start: 'top 70%', once: true },
          onUpdate: () => render(state.value, false),
          onComplete: () => {
            render(TO, true)
            root.classList.add('is-done')
          },
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        render(TO, true)
        root.classList.add('is-done')
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="pr is-done">
      <p className="pr-kicker mono">
        <span>Findings · demo estate</span>
        <span className="pr-delta">−85% noise</span>
      </p>

      <div className="pr-odometer" aria-hidden="true">
        {Array.from({ length: COLUMNS }, (_, index) => (
          <span className={`pr-col ${index === 0 ? 'is-leading' : ''}`} key={index}>
            <span className="pr-strip" style={{ transform: `translateY(${-Number(String(TO).padStart(COLUMNS, '0')[index])}em)` }}>
              {DIGITS.map((digit, digitIndex) => (
                <span key={digitIndex}>{digit}</span>
              ))}
            </span>
          </span>
        ))}
      </div>
      <p className="sr-only">Findings reduced from 123 to 18.</p>

      <div className="pr-dots" aria-hidden="true">
        {Array.from({ length: FROM }, (_, index) => (
          <span
            key={index}
            className={`pr-dot ${ORDER[index] >= TO ? 'is-cut' : 'is-kept'}`}
          />
        ))}
      </div>

      <div className="pr-scale mono" aria-hidden="true">
        <span>123 before</span>
        <span className="pr-scale-rule" />
        <span className="lime">18 after</span>
      </div>

      <p className="pr-copy">
        On our demo estate, precision work took findings from <strong>123 to 18</strong>. Every
        removal justified in writing.
      </p>
      <p className="pr-note body">
        Twelve finding kinds. Each grounded in public frameworks, explained in plain language, and
        honest about what Axon could not see.
      </p>
    </div>
  )
}
