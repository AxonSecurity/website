'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { TYPE_LABEL, type NodeType } from './estateData'
import type { FocusSnapshot } from './EstateGraph'

interface HudProps {
  stats: { nodes: number; edges: number; signalsPerSecond: number } | null
  focus: FocusSnapshot | null
  live: boolean
  /** Static frame (reduced motion / no WebGL): no signals, no hover. */
  still: boolean
}

const LEGEND: { type: NodeType; label: string }[] = [
  { type: 'agent', label: 'Agent' },
  { type: 'mcp', label: 'MCP server' },
  { type: 'store', label: 'Data store' },
  { type: 'identity', label: 'Identity' },
  { type: 'tool', label: 'Tool · model' },
]

export function GlyphIcon({ type }: { type: NodeType }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      {type === 'agent' && (
        <>
          <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6" cy="6" r="1.3" fill="currentColor" />
        </>
      )}
      {type === 'mcp' && <path d="M6 1.4 L10.6 6 L6 10.6 L1.4 6 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />}
      {type === 'store' && <rect x="2.2" y="2.2" width="7.6" height="7.6" fill="none" stroke="currentColor" strokeWidth="1.3" />}
      {type === 'identity' && (
        <>
          <circle cx="6" cy="6" r="5" fill="currentColor" opacity="0.22" />
          <circle cx="6" cy="6" r="1.9" fill="currentColor" />
        </>
      )}
      {(type === 'tool' || type === 'model') && <circle cx="6" cy="6" r="2" fill="currentColor" />}
    </svg>
  )
}

function Count({ value, live }: { value: number; live: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !live) return
    if (prefersReducedMotion()) {
      element.textContent = value.toLocaleString('en-US')
      return
    }
    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: value,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => {
        element.textContent = Math.round(state.v).toLocaleString('en-US')
      },
    })
    return () => {
      tween.kill()
    }
  }, [value, live])
  return (
    <span ref={ref} className="tabular">
      {live ? '0' : '—'}
    </span>
  )
}

function useJitter(base: number, live: boolean): number {
  const [value, setValue] = useState(base)
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => {
      setValue(Math.max(0, base + Math.round((Math.random() - 0.5) * base * 0.16)))
    }, 700)
    return () => window.clearInterval(id)
  }, [base, live])
  return value
}

// Top-right operational readout. Decorative (aria-hidden): the same facts
// are in the copy.
export default function HeroHud({ stats, focus, live, still }: HudProps) {
  const signals = useJitter(stats?.signalsPerSecond ?? 0, live)

  return (
    <div className="hud mono" aria-hidden="true">
      <div className="hud-head hud-row">
        <span className="hud-live">
          <i />
          Estate scan
        </span>
        <span className="lime">{still ? 'Snapshot' : live ? 'Live' : 'Idle'}</span>
      </div>
      <dl className="hud-stats">
        <div className="hud-row">
          <dt>Nodes</dt>
          <dd>{stats ? <Count value={stats.nodes} live={live} /> : '—'}</dd>
        </div>
        <div className="hud-row">
          <dt>Edges</dt>
          <dd>{stats ? <Count value={stats.edges} live={live} /> : '—'}</dd>
        </div>
        <div className="hud-row">
          <dt>Signals/s</dt>
          <dd className="tabular">{stats && live && !still ? signals : '—'}</dd>
        </div>
      </dl>
      <div className={`hud-focus ${focus ? 'is-on' : ''}`}>
        <p className="hud-hint">
          <span className="hud-hint-arrow">↳</span>
          {still ? 'A sample estate, frozen' : 'Hover a node — trace its blast radius'}
        </p>
        <dl className="hud-focus-rows">
          <div className="hud-row">
            <dt>Focus</dt>
            <dd>{focus ? TYPE_LABEL[focus.node.type] : ''}</dd>
          </div>
          <div className="hud-row">
            <dt>Node</dt>
            <dd className="hud-name">{focus?.node.name ?? ''}</dd>
          </div>
          <div className="hud-row">
            <dt>{focus?.direction === 'in' ? 'Reached by' : 'Reach'}</dt>
            <dd className="lime">{focus ? `${focus.reach} nodes` : ''}</dd>
          </div>
        </dl>
      </div>
      <ul className="hud-legend">
        {LEGEND.map((item) => (
          <li key={item.type}>
            <GlyphIcon type={item.type} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
