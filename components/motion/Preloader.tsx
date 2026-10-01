'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion, ScrollTrigger, SCRAMBLE_CHARS } from '@/lib/gsap'
import { markIntroDone } from '@/lib/intro'
import { INTRO_SEEN_CLASS, INTRO_SEEN_KEY } from '@/lib/intro-gate'
import { lockScroll } from '@/lib/scroll'
import { MARK_BAR_LEFT, MARK_BAR_RIGHT, MARK_LEGS, MARK_STROKE } from '@/components/brand/Logo'
import './preloader.css'

const FONT_WAIT_MS = 2500
const WATCHDOG_MS = 9000
// Everything behind the boot screen stays out of the tab order until it lifts.
const INERT_TARGETS = '#main, header.nav, footer.footer, nav.rail'

function setPageInert(inert: boolean) {
  document.querySelectorAll(INERT_TARGETS).forEach((element) => {
    if (inert) element.setAttribute('inert', '')
    else element.removeAttribute('inert')
  })
}

const LOG = [
  { label: 'Mounting read-only collectors', status: 'OK', at: 0.12 },
  { label: 'Resolving estate graph', status: 'OK', at: 0.38 },
  { label: 'Verifying content signature', status: 'OK', at: 0.62 },
  { label: 'Sovereign mode', status: 'ON', at: 0.86 },
]

// Boot sequence: the mark draws itself as the estate "loads", then the whole
// screen collapses into a single lime signal line — the axon — and fires off.
export default function Preloader() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      // The boot film plays once per browser session; layout.tsx flags a
      // repeat visit (or ?intro=0) before first paint so it never flashes.
      const skip = prefersReducedMotion() || document.documentElement.classList.contains(INTRO_SEEN_CLASS)
      if (skip) {
        markIntroDone()
        setGone(true)
        return
      }

      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
      lockScroll(true)
      setPageInert(true)

      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        try {
          sessionStorage.setItem(INTRO_SEEN_KEY, '1')
        } catch {
          // Storage blocked (private mode): the intro simply plays again.
        }
        markIntroDone()
        lockScroll(false)
        setPageInert(false)
        setGone(true)
        // Triggers were measured under the lock; measure again unlocked.
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }
      // Failsafe: whatever stalls (fonts, a thrown tween), the page never
      // stays trapped behind the boot screen.
      const watchdog = window.setTimeout(finish, WATCHDOG_MS)

      const num = root.querySelector<HTMLElement>('.pl-num')
      const fill = root.querySelector<HTMLElement>('.pl-progress-fill')
      const rows = gsap.utils.toArray<HTMLElement>('.pl-log li', root)
      const shown = new Set<number>()
      const state = { p: 0 }

      gsap.set('.pl-legs, .pl-bar', { drawSVG: '0%' })
      gsap.set(rows, { opacity: 0, x: -12 })

      const onProgress = () => {
        const p = state.p
        if (num) num.textContent = String(Math.round(p * 100)).padStart(3, '0')
        if (fill) fill.style.transform = `scaleX(${p})`
        rows.forEach((row, index) => {
          if (p >= LOG[index].at && !shown.has(index)) {
            shown.add(index)
            gsap.to(row, { opacity: 1, x: 0, duration: 0.5 })
            gsap.to(row.querySelector('.pl-log-label'), {
              duration: 0.6,
              scrambleText: { text: LOG[index].label, chars: SCRAMBLE_CHARS, speed: 0.8 },
            })
            gsap.fromTo(
              row.querySelector('.pl-log-dots'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, ease: 'power2.out' },
            )
            gsap.fromTo(
              row.querySelector('.pl-log-status'),
              { opacity: 0 },
              { opacity: 1, duration: 0.2, delay: 0.45 },
            )
          }
        })
      }

      const fontsReady = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((resolve) => window.setTimeout(resolve, FONT_WAIT_MS)),
      ])
      const tl = gsap.timeline()

      tl.from('.pl-clip > span', { yPercent: 120, duration: 0.9, stagger: 0.08 }, 0)
        .from('.pl-count', { yPercent: 40, opacity: 0, duration: 1 }, 0.05)
        // Uneven progress: fast bursts and short stalls read as real work.
        .to(state, { p: 0.34, duration: 0.55, ease: 'power2.out', onUpdate: onProgress }, 0.15)
        .to(state, { p: 0.58, duration: 0.45, ease: 'power1.inOut', onUpdate: onProgress }, '+=0.12')
        .to(state, { p: 0.86, duration: 0.4, ease: 'power2.out', onUpdate: onProgress }, '+=0.08')
        .to(state, { p: 1, duration: 0.35, ease: 'power1.in', onUpdate: onProgress }, '+=0.1')
        .to('.pl-legs', { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut' }, 0.2)
        .to('.pl-bar', { drawSVG: '100%', duration: 0.45, stagger: 0.12, ease: 'power2.out' }, 1.45)
        .to('.pl-mark', { color: '#95ff2a', duration: 0.3 }, 2.05)
        .addPause('+=0.05', () => {
          fontsReady.then(() => tl.play()).catch(() => tl.play())
        })

      const exit = 'exit'
      tl.addLabel(exit)
        .to('.pl-mark', { scale: 1.12, opacity: 0, duration: 0.5, ease: 'power2.in' }, exit)
        .to(
          ['.pl-top > *', '.pl-count', '.pl-log li', '.pl-progress'],
          { opacity: 0, y: -14, duration: 0.4, stagger: 0.02, ease: 'power2.in' },
          exit,
        )
        .to('.pl-line', { scaleX: 1, duration: 0.7, ease: 'axon-io' }, `${exit}+=0.2`)
        .to(
          '.pl-panel',
          { clipPath: 'inset(50% 0% 50% 0%)', duration: 1, ease: 'axon-io' },
          `${exit}+=0.35`,
        )
        .call(() => markIntroDone(), undefined, `${exit}+=0.75`)
        .set('.pl-line', { transformOrigin: '100% 50%' }, `${exit}+=1.05`)
        .to('.pl-line', { scaleX: 0, duration: 0.7, ease: 'axon-io' }, `${exit}+=1.05`)
        .call(finish)

      return () => {
        window.clearTimeout(watchdog)
        tl.kill()
        lockScroll(false)
        setPageInert(false)
      }
    },
    { scope: ref },
  )

  if (gone) return null

  return (
    <div ref={ref} className="preloader" aria-hidden="true">
      <div className="pl-panel">
        <div className="pl-top mono">
          <span className="pl-clip">
            <span>Axon — Agent security</span>
          </span>
          <span className="pl-clip">
            <span>In-tenant · Read-only · Signed</span>
          </span>
        </div>

        <svg className="pl-mark" viewBox="0 0 100 100" fill="none">
          <path className="pl-legs" d={MARK_LEGS} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
          <path className="pl-bar" d={MARK_BAR_LEFT} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
          <path className="pl-bar" d={MARK_BAR_RIGHT} stroke="currentColor" strokeWidth={MARK_STROKE} strokeLinecap="square" />
        </svg>

        <div className="pl-bottom">
          <div className="pl-count tabular">
            <span className="pl-num">000</span>
          </div>
          <ul className="pl-log mono">
            {LOG.map((row) => (
              <li key={row.label}>
                <span className="pl-log-label">{row.label}</span>
                <span className="pl-log-dots" />
                <span className="pl-log-status">{row.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pl-progress">
          <div className="pl-progress-fill" />
        </div>
      </div>
      <div className="pl-line" />
    </div>
  )
}
