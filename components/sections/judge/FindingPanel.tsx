'use client'

import { useRef } from 'react'
import { gsap, useGSAP, SCRAMBLE_CHARS } from '@/lib/gsap'

const TITLE = 'MCP server reachable without authentication'
const ASSET = 'mcp:crm-sync · reachability public · auth none · credential shared'

const ROWS = [
  {
    label: 'What this means',
    text: 'An MCP server your agents call is reachable beyond the machine it runs on, and nothing checks who is calling. Anyone who can reach it can use every tool it exposes.',
  },
  {
    label: 'How Axon found it',
    text: 'From the declared configuration: address, transport, authentication scheme. Graded over reachability, auth scheme and credential scope. Local servers are never flagged; private networks and per-user keys count as boundaries.',
  },
  {
    label: 'What it did not check',
    text: 'Axon did not start the server or enumerate its tools live. The grade rests on declarations, not on a probe.',
  },
  {
    label: 'Next step',
    text: 'Put authentication in front of the server, or bind it to localhost. Prefer per-user credentials over one shared key.',
  },
] as const

// The invisible copy reserves the final height so typing never shifts the
// page (pinned sections below measure their offsets once).
function Typed({ text }: { text: string }) {
  return (
    <span className="fp-typed">
      <span className="fp-typed-ghost" aria-hidden="true">
        {text}
      </span>
      <span className="fp-typed-live" data-type={text}>
        {text}
      </span>
    </span>
  )
}

// A mock finding that types itself in: the anatomy every Axon finding shares.
export default function FindingPanel() {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Source text lives in data attributes so a StrictMode re-run (or a
        // revert) never reads back the emptied nodes.
        const typed = gsap.utils.toArray<HTMLElement>('[data-type]', root)
        const texts = typed.map((element) => element.dataset.type ?? '')
        const labels = gsap.utils.toArray<HTMLElement>('.fp-row-label', root)
        const labelTexts = labels.map((element) => element.dataset.label ?? '')
        typed.forEach((element) => {
          element.textContent = ''
        })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 72%', once: true },
        })

        tl.from(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'axon-io' })
          .from('.fp-chrome > *', { opacity: 0, y: 8, duration: 0.5, stagger: 0.06 }, 0.4)
          .from('.fp-chip', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.55)

        typed.forEach((element, index) => {
          const text = texts[index]
          const at = index === 0 ? 0.8 : '>-0.25'
          tl.to(
            element,
            {
              text: { value: text },
              duration: Math.min(1.5, 0.2 + text.length * 0.0085),
              ease: 'none',
              onStart: () => element.classList.add('is-typing'),
              onComplete: () => element.classList.remove('is-typing'),
            },
            at,
          )
          const label = element.closest('.fp-row')?.querySelector<HTMLElement>('.fp-row-label')
          const labelIndex = label ? labels.indexOf(label) : -1
          if (label && labelIndex >= 0) {
            tl.to(
              label,
              {
                duration: 0.5,
                scrambleText: { text: labelTexts[labelIndex], chars: SCRAMBLE_CHARS, speed: 0.8 },
              },
              '<',
            )
          }
        })

        tl.from('.fp-foot > *', { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 }, '>-0.2')

        return () => {
          typed.forEach((element, index) => {
            element.textContent = texts[index]
            element.classList.remove('is-typing')
          })
        }
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <article ref={ref} className="fp" aria-label="Example finding">
      <div className="fp-chrome mono">
        <span className="fp-crumb">axon / findings / 1 of 18</span>
        <span className="fp-live">
          <span className="fp-live-dot" aria-hidden="true" /> Open
        </span>
      </div>

      <div className="fp-head">
        <div className="fp-chips mono">
          <span className="fp-chip fp-chip-sev">High</span>
          <span className="fp-chip">MCP · exposure</span>
          <span className="fp-chip fp-chip-ghost">Reach rank 2</span>
        </div>
        <h3 className="fp-title">
          <Typed text={TITLE} />
        </h3>
        <p className="fp-asset mono">
          <Typed text={ASSET} />
        </p>
      </div>

      <dl className="fp-rows">
        {ROWS.map((row) => (
          <div className="fp-row" key={row.label}>
            <dt className="fp-row-label mono" data-label={row.label}>
              {row.label}
            </dt>
            <dd className="fp-row-text">
              <Typed text={row.text} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="fp-foot mono">
        <span>
          <span className="fp-foot-key">Frameworks</span> OWASP Agentic Top 10 · MITRE ATLAS · CSA MAESTRO
        </span>
        <span>
          <span className="fp-foot-key">Evidence</span> declaration fields · never content
        </span>
      </div>
    </article>
  )
}
