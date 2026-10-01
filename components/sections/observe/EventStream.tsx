'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { createEventSource, formatClock, type StreamEvent } from '@/components/sections/observe/events'

const VISIBLE_ROWS = 9
const INTERVAL_MS = 600
const STATIC_BASE = Date.UTC(2026, 8, 30, 14, 2, 7, 114)
const COLUMNS = ['Time', 'Agent', 'Edge', 'Target', 'Dur', 'Outcome', 'Decision'] as const

function buildRow(event: StreamEvent, time: number): HTMLDivElement {
  const row = document.createElement('div')
  row.className = `es-row es-${event.outcome}`
  const cells: Array<[string, string]> = [
    ['es-time', formatClock(time)],
    ['es-agent', event.agent],
    [`es-edge es-edge-${event.edge}`, event.edge],
    ['es-target', event.target],
    ['es-dur', event.duration],
    ['es-outcome', event.outcome],
    ['es-decision', 'observed'],
  ]
  for (const [className, text] of cells) {
    const cell = document.createElement('span')
    cell.className = className
    cell.textContent = text
    row.appendChild(cell)
  }
  return row
}

// The sensor's ingest, as a terminal. Rows are built imperatively on the
// client (clock-driven), so the server never renders a time to mismatch.
export default function EventStream() {
  const listRef = useRef<HTMLDivElement | null>(null)
  const countRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const list = listRef.current
    const counter = countRef.current
    if (!list || !counter) return

    const next = createEventSource(20260930)
    const reduced = prefersReducedMotion()
    const base = reduced ? STATIC_BASE : Date.now()
    let total = 1284

    list.replaceChildren(
      ...Array.from({ length: VISIBLE_ROWS }, (_, index) =>
        buildRow(next(), base - (VISIBLE_ROWS - index) * INTERVAL_MS),
      ),
    )
    counter.textContent = total.toLocaleString('en-US')
    if (reduced) return

    let visible = false
    let call: gsap.core.Tween | null = null
    let shifting: gsap.core.Tween | null = null

    const push = () => {
      const row = buildRow(next(), Date.now())
      row.classList.add('is-new')
      list.appendChild(row)
      total += 1
      counter.textContent = total.toLocaleString('en-US')
      const height = row.offsetHeight
      shifting?.progress(1)
      shifting = gsap.fromTo(
        list,
        { y: 0 },
        {
          y: -height,
          duration: 0.5,
          ease: 'axon',
          onComplete: () => {
            while (list.children.length > VISIBLE_ROWS) list.firstElementChild?.remove()
            gsap.set(list, { y: 0 })
          },
        },
      )
    }

    const schedule = () => {
      call = gsap.delayedCall((INTERVAL_MS + (Math.random() - 0.5) * 380) / 1000, () => {
        if (visible && !document.hidden) push()
        schedule()
      })
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(list)
    schedule()

    return () => {
      observer.disconnect()
      call?.kill()
      shifting?.kill()
    }
  }, [])

  return (
    <div className="es">
      <div className="es-chrome mono">
        <span className="es-title">axon sensor · ingest</span>
        <span className="es-stats">
          <span>
            events <span ref={countRef} className="tabular es-count">1,284</span>
          </span>
          <span className="es-live">
            <span className="es-live-dot" aria-hidden="true" /> Live
          </span>
        </span>
      </div>
      <div className="es-head es-row mono" aria-hidden="true">
        {COLUMNS.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="es-viewport mono" aria-hidden="true">
        <div ref={listRef} className="es-list" />
      </div>
      <p className="sr-only">
        A live feed of sensor events. Each carries a time, a salted agent hash, the kind of edge,
        a short target identifier, duration, outcome and the decision “observed” — never content.
      </p>
    </div>
  )
}
