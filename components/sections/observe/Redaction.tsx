'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, SCRAMBLE_CHARS } from '@/lib/gsap'

const SESSION = 'session 7f3a…c21'

const ROWS = [
  {
    kind: 'Prompt',
    content: '“Summarize Q3 churn for Acme and draft the renewal email.”',
    meta: [SESSION, 'invoked', 'tool:crm.search', '212ms', 'ok', 'observed'],
  },
  {
    kind: 'Tool argument',
    content: 'query = “every enterprise customer with an open invoice”',
    meta: [SESSION, 'reads_from', 'store:billing-db', '88ms', 'ok', 'observed'],
  },
  {
    kind: 'File path',
    content: '/home/dev/clients/acme/contract-final-v3.pdf',
    meta: [SESSION, 'reads_from', 'store:workspace', '14ms', 'ok', 'observed'],
  },
  {
    kind: 'Secret',
    content: 'sk-live-••••••••••••••••••••4f9a',
    meta: [SESSION, 'invoked', 'tool:payments.refund', '301ms', 'ok', 'observed'],
  },
] as const

const REJECTED = [
  'Prompts',
  'Arguments',
  'Results',
  'File paths',
  'Secret values',
  'Usernames',
  'Emails',
] as const

const SWEEP = 1.15
const HOLD = 2.6

// Content goes in on the right, metadata comes out on the left. The scan bar
// is the sensor's boundary: nothing it passes survives as content.
export default function Redaction() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const rows = gsap.utils.toArray<HTMLElement>('.rd-row', root)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(rows, { '--x': '0%' })
        rows.forEach((row) => row.classList.remove('is-meta'))

        const tl = gsap.timeline({ repeat: -1, paused: true, repeatDelay: 0.4 })
        rows.forEach((row, index) => {
          const at = index * (SWEEP * 0.72)
          const fields = gsap.utils.toArray<HTMLElement>('.rd-field', row)
          tl.to(row, { '--x': '100%', duration: SWEEP, ease: 'power2.inOut' }, at)
            .call(() => row.classList.add('is-sweeping'), undefined, at)
            .call(() => row.classList.replace('is-sweeping', 'is-meta'), undefined, at + SWEEP)
          fields.forEach((field, fieldIndex) => {
            tl.to(
              field,
              {
                duration: SWEEP * 0.8,
                ease: 'none',
                scrambleText: {
                  text: field.dataset.text ?? '',
                  chars: SCRAMBLE_CHARS.toLowerCase(),
                  speed: 0.9,
                  revealDelay: 0.3,
                },
              },
              at + (fieldIndex / fields.length) * SWEEP * 0.5,
            )
          })
        })
        const end = (rows.length - 1) * SWEEP * 0.72 + SWEEP + HOLD
        tl.to(rows, { '--x': '0%', duration: 0.7, ease: 'axon-io', stagger: 0.08 }, end)
          .call(() => rows.forEach((row) => row.classList.remove('is-meta', 'is-sweeping')), undefined, end + 0.1)

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 80%',
          end: 'bottom 10%',
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        })

        return () => {
          trigger.kill()
          tl.kill()
          gsap.set(rows, { '--x': '100%' })
          rows.forEach((row) => {
            row.className = 'rd-row is-meta'
          })
        }
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="rd">
      <div className="rd-legend mono" aria-hidden="true">
        <span>What the agent handled</span>
        <span className="rd-legend-arrow" />
        <span className="lime">What Axon stores</span>
      </div>
      <ol className="rd-rows">
        {ROWS.map((row, index) => (
          <li className="rd-row is-meta" key={row.kind}>
            <div className="rd-tag mono">
              <span className="rd-kind">
                <span className="rd-num">{String(index + 1).padStart(2, '0')}</span> {row.kind}
              </span>
              <span className="rd-state">
                <span className="rd-state-a">Content</span>
                <span className="rd-state-b">Metadata</span>
              </span>
            </div>
            <div className="rd-line">
              <p className="rd-content" aria-hidden="true">
                {row.content}
              </p>
              <p className="rd-meta mono">
                {row.meta.map((field, fieldIndex) => (
                  <span className="rd-field-wrap" key={fieldIndex}>
                    {fieldIndex > 0 ? <span className="rd-sep">·</span> : null}
                    <span className={`rd-field ${field === 'observed' ? 'lime' : ''}`} data-text={field}>
                      {field}
                    </span>
                  </span>
                ))}
              </p>
              <span className="rd-bar-rider" aria-hidden="true">
                <span className="rd-bar" />
              </span>
            </div>
          </li>
        ))}
      </ol>
      <div className="rd-foot mono">
        <span className="rd-foot-key">Rejected by construction</span>
        <ul className="rd-foot-list">
          {REJECTED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
