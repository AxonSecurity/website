'use client'

import { memo, useEffect, useRef } from 'react'
import { ArrowRight } from '@/components/icons'
import {
  clamp,
  orbitState,
  smoothing,
  type OrbitCardState,
} from '@/lib/animation'

export interface OrbitFeature {
  label: string
  title: string
  text: string
}

interface OrbitCardsProps {
  features: OrbitFeature[]
}

const SMOOTH_HALF_LIFE_MS = 140
const SCALE_MIN = 0.82
const ALPHA_MIN = 0.45
const FRONT_GLOW_DEPTH = 0.86
const DESKTOP_MQ = '(min-width: 769px)'
const REDUCED_MQ = '(prefers-reduced-motion: reduce)'

type ScenicMode = 'live' | 'static' | null

function applyCardState(
  el: HTMLElement,
  stageW: number,
  stageH: number,
  state: OrbitCardState,
) {
  const rad = (state.angleDeg * Math.PI) / 180
  // Wide ellipse tuned to clear the nucleus block on every viewport.
  const rx = clamp(stageW * 0.36, 300, 620)
  const ry = clamp(stageH * 0.3, 220, 340)
  const x = Math.cos(rad) * rx
  const y = Math.sin(rad) * ry

  const depth01 = (Math.sin(rad) + 1) / 2 // bottom = front
  const scale = SCALE_MIN + (1 - SCALE_MIN) * depth01
  const alphaMul = ALPHA_MIN + (1 - ALPHA_MIN) * depth01
  const ent = state.entrance

  el.style.opacity = String(ent * alphaMul)
  el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
  el.style.filter = ent < 1 ? `blur(${((1 - ent) * 8).toFixed(2)}px)` : ''
  el.style.zIndex = String(10 + Math.round(depth01 * 10))
  el.classList.toggle('is-front', depth01 > FRONT_GLOW_DEPTH && ent > 0.9)
}

function resetToStack(
  track: HTMLElement,
  cards: HTMLElement[],
) {
  track.classList.remove('is-scenic', 'orbit-live', 'orbit-static')
  cards.forEach((el) => {
    el.style.opacity = ''
    el.style.transform = ''
    el.style.filter = ''
    el.style.zIndex = ''
    el.classList.remove('is-front')
  })
}

function OrbitCards({ features }: OrbitCardsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[]
    if (cards.length === 0) return

    const reducedMq = window.matchMedia(REDUCED_MQ)
    const desktopMq = window.matchMedia(DESKTOP_MQ)

    let currentMode: ScenicMode = null
    let teardownScene: (() => void) | null = null

    const setup = () => {
      const mode: ScenicMode = !desktopMq.matches
        ? null
        : reducedMq.matches
          ? 'static'
          : 'live'
      if (mode === currentMode) return

      teardownScene?.()
      teardownScene = null
      resetToStack(track, cards)
      currentMode = mode
      if (!mode) return

      track.classList.add(
        'is-scenic',
        mode === 'live' ? 'orbit-live' : 'orbit-static',
      )

      let rectTop = 0
      let displayP = mode === 'static' ? 1 : 0

      const measure = () => {
        rectTop = track.getBoundingClientRect().top + window.scrollY
      }
      measure()

      const renderAt = (p: number) => {
        const stage = track.firstElementChild as HTMLElement | null
        if (!stage) return
        const states = orbitState(p)
        for (let i = 0; i < cards.length; i++) {
          applyCardState(cards[i], stage.clientWidth, stage.clientHeight, states[i])
        }
      }

      if (mode === 'static') {
        renderAt(1)
        const ro = new ResizeObserver(() => renderAt(1))
        ro.observe(track.firstElementChild as HTMLElement)
        teardownScene = () => ro.disconnect()
        return
      }

      // Live scene.
      const controller = new AbortController()
      const { signal } = controller
      let raf = 0
      let last = performance.now()

      const frame = (now: number) => {
        const dt = Math.min(now - last, 34)
        last = now
        const target = clamp(
          (window.scrollY - rectTop) /
            Math.max(track.offsetHeight - window.innerHeight, 1),
          0,
          1,
        )
        displayP += (target - displayP) * smoothing(SMOOTH_HALF_LIFE_MS, dt)
        renderAt(displayP)
        raf = requestAnimationFrame(frame)
      }
      const startLoop = () => {
        cancelAnimationFrame(raf)
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
      const stopLoop = () => cancelAnimationFrame(raf)

      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
        { rootMargin: '80px' },
      )
      io.observe(track)

      window.addEventListener('scroll', measure, { signal, passive: true })
      document.addEventListener('visibilitychange', () => {
        document.hidden ? stopLoop() : startLoop()
      }, { signal })
      startLoop()

      teardownScene = () => {
        stopLoop()
        io.disconnect()
        controller.abort()
      }
    }

    const onEnvironmentChange = () => setup()
    desktopMq.addEventListener('change', onEnvironmentChange)
    reducedMq.addEventListener('change', onEnvironmentChange)
    setup()

    return () => {
      desktopMq.removeEventListener('change', onEnvironmentChange)
      reducedMq.removeEventListener('change', onEnvironmentChange)
      teardownScene?.()
      resetToStack(track, cards)
    }
  }, [features])

  return (
    <div className="orbit-track" ref={trackRef}>
      <div className="orbit-stage">
        <div className="orbit-nucleus" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/axon-mark.png" alt="" width={120} height={108} />
          <p className="orbit-subtitle">Security posture with a pulse.</p>
        </div>
        <div className="orbit-stack">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="orbit-card"
              ref={(el) => {
                cardRefs.current[index] = el
              }}
            >
              <span className="feature-label">{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <a className="text-link" href="#access">
                Explore {feature.label.toLowerCase()} <ArrowRight size={15} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(OrbitCards)
