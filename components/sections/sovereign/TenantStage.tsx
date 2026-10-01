'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS } from '@/lib/gsap'
import { createTenantScene, type TenantScene } from './tenantScene'

const STEPS = [
  { name: 'Extract', detail: 'Untar under path-traversal and size guards' },
  { name: 'TUF', detail: 'Metadata chain against the pinned root' },
  { name: 'Expiry', detail: 'Timestamp and snapshot still fresh' },
  { name: 'Version', detail: 'Monotonic — no silent rollback' },
  { name: 'Targets', detail: 'Every pack against its hash and length' },
  { name: 'Signature', detail: 'Ed25519 over the manifest' },
  { name: 'Manifest', detail: 'Parses, agrees with TUF, packs load' },
  { name: 'Activated', detail: 'Atomic pointer swap, audit row written' },
]

const SIGNATURE_STEP = 5
const FIRST_VERSION = [0, 4, 2]

const NOTE_OK = 'Fail-closed. Any failed step leaves the running content untouched. Works air-gapped.'
const NOTE_REFUSED = 'Refused at signature. The running content keeps serving; a refused row names the step.'

// The tenant stage: a canvas of metadata that can't leave, and the one
// thing that may come in — a signed bundle walking the verification ladder.
// Every third bundle is tampered with and refused, to show fail-closed.
export default function TenantStage() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    (context) => {
      const root = ref.current
      const canvas = root?.querySelector<HTMLCanvasElement>('.sov-canvas')
      const ladder = root?.querySelector<HTMLElement>('.sov-ladder-list')
      const panel = root?.querySelector<HTMLElement>('.sov-ladder')
      if (!root || !canvas || !ladder || !panel) return

      const rows = Array.from(ladder.querySelectorAll<HTMLElement>('li'))
      const version = root.querySelector<HTMLElement>('.sov-bundle-version')
      const note = root.querySelector<HTMLElement>('.sov-ladder-note')
      const reduced = prefersReducedMotion()
      const mobile = window.matchMedia('(max-width: 760px)').matches
      const font = getComputedStyle(document.documentElement).getPropertyValue('--font-geist-mono').trim() || 'monospace'
      const scene: TenantScene = createTenantScene(canvas, font, mobile)
      let rowY: number[] = []

      const measure = () => {
        const stage = root.getBoundingClientRect()
        const box = panel.getBoundingClientRect()
        rowY = rows.map((row) => {
          const rect = row.getBoundingClientRect()
          return rect.top - stage.top + rect.height / 2
        })
        // Desktop: the channel runs down the gap left of the ladder. Mobile
        // stacks copy above the ladder, so the channel hugs its right edge.
        const channelX = mobile ? box.right - stage.left + 11 : box.left - stage.left - 30
        scene.resize(
          {
            width: stage.width,
            height: stage.height,
            channelX,
            portY: 14,
            endY: rowY[rowY.length - 1] ?? stage.height,
          },
          Math.min(window.devicePixelRatio || 1, 2),
        )
        scene.draw()
      }
      measure()
      const resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(root)
      document.fonts?.ready.then(measure).catch(() => undefined)

      if (reduced) {
        rows.forEach((row) => {
          row.classList.add('is-ok')
          const label = row.querySelector('.sov-step-state')
          if (label) label.textContent = 'OK'
        })
        Object.assign(scene.packet, { y: rowY[rowY.length - 1] ?? 0, alpha: 1, trail: 1 })
        scene.draw()
        return () => resizeObserver.disconnect()
      }

      let visible = false
      let cycle = 0
      let current: gsap.core.Timeline | null = null
      const semver = [...FIRST_VERSION]

      const setNote = (text: string) => {
        if (!note || note.textContent === text) return
        gsap.to(note, { duration: 0.8, ease: 'none', scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.9 } })
      }

      const setState = (row: HTMLElement, state: 'idle' | 'active' | 'ok' | 'refused') => {
        row.classList.toggle('is-active', state === 'active')
        row.classList.toggle('is-ok', state === 'ok')
        row.classList.toggle('is-refused', state === 'refused')
        const label = row.querySelector('.sov-step-state')
        if (label) label.textContent = { idle: '—', active: 'Verifying', ok: 'OK', refused: 'Refused' }[state]
      }

      const build = () => {
        const tampered = cycle % 3 === 2
        const packet = scene.packet
        const tl = gsap.timeline({
          paused: !visible,
          onComplete: () => {
            cycle += 1
            tl.kill()
            // Each cycle is built outside the React context so finished
            // timelines are released instead of piling up until unmount.
            context?.ignore(() => {
              current = build()
            })
          },
        })
        const label = `axon-content-${semver.join('.')}`

        tl.call(() => {
          rows.forEach((row) => setState(row, 'idle'))
          if (version) version.textContent = label
          setNote(NOTE_OK)
          // A tampered bundle looks like any other until the signature fails.
          packet.refused = 0
        })
          .set(packet, { y: -30, alpha: 0, trail: 0 })
          .to(packet, { alpha: 1, duration: 0.3 })
          .to(packet, { y: () => rowY[0], duration: 1.1, ease: 'axon-io' }, '<')
          .to(packet, { trail: 1, duration: 0.6 }, '<0.5')

        const last = tampered ? SIGNATURE_STEP : rows.length - 1
        for (let index = 0; index <= last; index += 1) {
          const row = rows[index]
          if (index > 0) tl.to(packet, { y: () => rowY[index], duration: 0.42, ease: 'power2.inOut' })
          tl.call(() => setState(row, 'active')).to({}, { duration: index === last && tampered ? 0.7 : 0.26 })
          if (tampered && index === SIGNATURE_STEP) {
            tl.call(() => {
              setState(row, 'refused')
              setNote(NOTE_REFUSED)
              packet.refused = 1
              if (version) version.textContent = `${label} · refused`
            })
          } else {
            tl.call(() => setState(row, 'ok'))
          }
        }

        if (tampered) {
          tl.to(packet, { trail: 0, duration: 0.5 }, '+=0.6')
            .to(packet, { y: -40, duration: 1.3, ease: 'axon-io' }, '<')
            .to(packet, { alpha: 0, duration: 0.4 }, '-=0.4')
            .to({}, { duration: 1.6 })
        } else {
          tl.call(() => {
            scene.ripple()
            semver[2] += 1
          })
            .to(packet, { alpha: 0.6, duration: 0.6 })
            .to({}, { duration: 2.2 })
            .to(packet, { alpha: 0, trail: 0, duration: 0.5 })
        }
        return tl
      }

      current = build()

      // Adaptive frame rate: on a machine that can't hold ~45fps the scene
      // keeps stepping every tick but paints every other one (hysteresis
      // stops it flapping between modes).
      let frameAvg = 16.7
      let halfRate = false
      let skipPaint = false
      const tick = (_time: number, delta: number) => {
        if (!visible || document.hidden) return
        frameAvg += (Math.min(delta, 100) - frameAvg) * 0.08
        if (!halfRate && frameAvg > 24) halfRate = true
        else if (halfRate && frameAvg < 17.5) halfRate = false
        scene.step(Math.min(delta, 34) / 1000)
        skipPaint = halfRate && !skipPaint
        if (skipPaint) return
        scene.draw()
      }
      gsap.ticker.add(tick)

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
          if (visible) current?.play()
          else current?.pause()
        },
        { rootMargin: '80px 0px' },
      )
      io.observe(root)

      return () => {
        gsap.ticker.remove(tick)
        io.disconnect()
        resizeObserver.disconnect()
        current?.kill()
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="sov-stage">
      <canvas className="sov-canvas" aria-hidden="true" />
      <div className="sov-stage-grid">
        <div className="sov-stage-copy">
          <p className="sov-stage-title">
            Metadata moves inside the wall. <span className="serif-i">Nothing crosses it outward.</span>
          </p>
          <p className="body">
            The only inbound flow is Axon&apos;s own detection content — one signed, versioned bundle, verified on
            your side before a single rule runs. It imports identically from a file with no network at all.
          </p>
        </div>
        <div className="sov-ladder">
          <div className="sov-ladder-head mono">
            <span>Signed content bundle</span>
            <span className="sov-bundle-version tabular">axon-content-0.4.2</span>
          </div>
          <ol className="sov-ladder-list" aria-label="Content verification steps">
            {STEPS.map((step, index) => (
              <li key={step.name} className="sov-step">
                <span className="sov-step-num mono tabular">{String(index + 1).padStart(2, '0')}</span>
                <span className="sov-step-body">
                  <span className="sov-step-name">{step.name}</span>
                  <span className="sov-step-detail">{step.detail}</span>
                </span>
                <span className="sov-step-check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                    <path d="M3 8.5 L6.5 12 L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                  </svg>
                </span>
                <span className="sov-step-state mono">—</span>
              </li>
            ))}
          </ol>
          <p className="sov-ladder-note mono" aria-live="off">
            {NOTE_OK}
          </p>
        </div>
      </div>
    </div>
  )
}
