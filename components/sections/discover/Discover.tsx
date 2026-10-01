'use client'

import { useRef } from 'react'
import SectionHead from '@/components/ui/SectionHead'
import { gsap, useGSAP, SCRAMBLE_CHARS } from '@/lib/gsap'
import { KINDS, SOURCES } from './estate'
import { ScanField } from './ScanField'
import Coverage from './Coverage'
import './discover.css'

const DESKTOP_COUNT = 90
const MOBILE_COUNT = 46

function pad(value: number): string {
  return String(value).padStart(3, '0')
}

function LegendGlyph({ path, filled }: { path: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
      <path
        d={path}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={1.6}
        strokeLinecap="square"
      />
    </svg>
  )
}

export default function Discover() {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const canvas = root.querySelector<HTMLCanvasElement>('.discover-canvas')
      const stage = root.querySelector<HTMLElement>('.discover-stage')
      const resolvedEl = root.querySelector<HTMLElement>('[data-hud="resolved"]')
      const sourceEl = root.querySelector<HTMLElement>('[data-hud="source"]')
      const barEl = root.querySelector<HTMLElement>('.discover-hud-bar-fill')
      if (!canvas || !stage) return

      const mm = gsap.matchMedia()
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
          mobile: '(max-width: 760px)',
        },
        (context) => {
          const { reduced, mobile } = context.conditions as { reduced: boolean; mobile: boolean }
          const total = mobile ? MOBILE_COUNT : DESKTOP_COUNT
          const field = new ScanField(canvas, {
            count: total,
            mobile,
            reduced,
            onStats: (resolved, count) => {
              if (resolvedEl) resolvedEl.textContent = `${pad(resolved)}/${pad(count)}`
            },
          })

          if (reduced) {
            if (resolvedEl) resolvedEl.textContent = `${pad(total)}/${pad(total)}`
            if (sourceEl) sourceEl.textContent = SOURCES[SOURCES.length - 1]
            if (barEl) barEl.style.transform = 'scaleX(1)'
            return () => field.destroy()
          }

          field.start()

          let sourceIndex = -1
          const showSource = (index: number) => {
            if (!sourceEl || index === sourceIndex) return
            sourceIndex = index
            gsap.to(sourceEl, {
              duration: 0.55,
              ease: 'none',
              overwrite: true,
              scrambleText: { text: SOURCES[index], chars: SCRAMBLE_CHARS.toLowerCase(), speed: 1 },
            })
          }

          const proxy = { p: 0 }
          gsap.to(proxy, {
            p: 1,
            ease: 'none',
            onUpdate: () => {
              field.setProgress(proxy.p)
              if (barEl) barEl.style.transform = `scaleX(${proxy.p.toFixed(4)})`
              showSource(Math.min(SOURCES.length - 1, Math.floor(proxy.p * SOURCES.length)))
            },
            scrollTrigger: {
              trigger: root.querySelector('.discover-pin'),
              start: 'top top',
              end: mobile ? '+=170%' : '+=250%',
              pin: true,
              refreshPriority: 1,
              scrub: 0.8,
              anticipatePin: 1,
            },
          })

          // The HUD rows ease in as the stage arrives.
          gsap.from('.discover-hud-cell, .discover-legend-item', {
            opacity: 0,
            y: 14,
            duration: 0.9,
            stagger: 0.035,
            scrollTrigger: { trigger: stage, start: 'top 85%', once: true },
          })

          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return
            const rect = canvas.getBoundingClientRect()
            field.setPointer(event.clientX - rect.left, event.clientY - rect.top)
          }
          const onLeave = () => field.setPointer(null, null)
          stage.addEventListener('pointermove', onMove)
          stage.addEventListener('pointerleave', onLeave)

          return () => {
            stage.removeEventListener('pointermove', onMove)
            stage.removeEventListener('pointerleave', onLeave)
            field.destroy()
          }
        },
      )

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="discover" data-chapter="Discover" className="discover">
      <div className="wrap discover-head">
        <SectionHead
          index="02"
          label="Discover"
          title={
            <>
              Every agent. Every identity. <span className="serif-i lime">Every path.</span>
            </>
          }
          lead="Read-only collectors map your coding agents and application code into one graph — fourteen kinds of node, fifteen kinds of edge, each one declared or observed."
        />
      </div>

      <div className="discover-pin">
        <div className="wrap discover-frame">
          <div className="discover-hud" aria-hidden="true">
            <div className="discover-hud-cell">
              <span className="discover-hud-label">Resolved</span>
              <span className="discover-hud-value lime tabular" data-hud="resolved">
                000/{pad(DESKTOP_COUNT)}
              </span>
            </div>
            <div className="discover-hud-cell">
              <span className="discover-hud-label">Node types</span>
              <span className="discover-hud-value tabular">14</span>
            </div>
            <div className="discover-hud-cell">
              <span className="discover-hud-label">Edge types</span>
              <span className="discover-hud-value tabular">15</span>
            </div>
            <div className="discover-hud-cell discover-hud-source">
              <span className="discover-hud-label">Source</span>
              <span className="discover-hud-value" data-hud="source">
                {SOURCES[0]}
              </span>
            </div>
            <div className="discover-hud-bar">
              <div className="discover-hud-bar-fill" />
            </div>
          </div>

          <div className="discover-stage">
            <canvas className="discover-canvas" aria-hidden="true" />
            <span className="discover-corner discover-corner-tl" aria-hidden="true" />
            <span className="discover-corner discover-corner-tr" aria-hidden="true" />
            <span className="discover-corner discover-corner-bl" aria-hidden="true" />
            <span className="discover-corner discover-corner-br" aria-hidden="true" />
            <p className="sr-only">
              An illustrated estate of about ninety components — agents, models, identities, tools, MCP servers and
              data stores — resolving into a connected graph as a scan passes over it.
            </p>
          </div>

          <ul className="discover-legend" aria-label="Node types">
            {KINDS.map((spec) => (
              <li className={`discover-legend-item ${spec.kind === 'finding' ? 'is-finding' : ''}`} key={spec.kind}>
                <LegendGlyph path={spec.path} filled={spec.filled} />
                <span>{spec.label}</span>
              </li>
            ))}
            <li className="discover-legend-item discover-legend-edge" aria-hidden="true">
              <span className="discover-edge-swatch is-declared" />
              <span>Declared</span>
            </li>
            <li className="discover-legend-item discover-legend-edge" aria-hidden="true">
              <span className="discover-edge-swatch is-observed" />
              <span>Observed</span>
            </li>
          </ul>
        </div>
      </div>

      <Coverage />
    </section>
  )
}
