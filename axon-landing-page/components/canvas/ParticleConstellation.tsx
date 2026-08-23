'use client'

import { memo, useEffect, useRef } from 'react'
import { CANVAS_CONFIG as CFG } from './config'
import { CONSTELLATION_V2 as V2 } from './config'
import { generateBrainPoints } from '@/lib/brainGeometry'
import { lerp, mulberry32, smoothing } from '@/lib/animation'

interface Particle {
  bx: number
  by: number
  phase: number
  driftRate: number
  size: number
  angle: number
  spinRate: number
  colorIndex: number
  plane: number
}

interface Pulse {
  from: number
  to: number
  start: number
  travel: number
}

const FAR_AWAY = -1e5
const TAU = Math.PI * 2

function pickColorIndex(rand: () => number): number {
  const roll = rand()
  let acc = 0
  for (let i = 0; i < CFG.COLOR_WEIGHTS.length; i++) {
    acc += CFG.COLOR_WEIGHTS[i]
    if (roll < acc) return i
  }
  return CFG.COLOR_WEIGHTS.length - 1
}

function ParticleConstellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const attrRand = mulberry32(CFG.SEED ^ 0x9e3779b9)
    const particles: Particle[] = generateBrainPoints({
      count: CFG.PARTICLE_COUNT,
      seed: CFG.SEED,
      fissureWidth: CFG.FISSURE_WIDTH,
      foldIntensity: CFG.FOLD_INTENSITY,
      contourRatio: CFG.CONTOUR_RATIO,
    }).map((point, i) => ({
      bx: point.x,
      by: point.y,
      phase: attrRand() * TAU,
      driftRate: CFG.DRIFT_SPEED * (0.6 + attrRand() * 0.8),
      size: CFG.TRIANGLE_SIZE_MIN + attrRand() * (CFG.TRIANGLE_SIZE_MAX - CFG.TRIANGLE_SIZE_MIN),
      angle: attrRand() * TAU,
      spinRate: (attrRand() - 0.5) * 2 * CFG.SPIN_SPEED,
      colorIndex: pickColorIndex(attrRand),
      plane: i % V2.DEPTH_PLANES.length,
    }))

    // --- Signal graph: hub nodes + nearest-hub edges (normalized space). ---
    const SIG = V2.SIGNALS
    const hubIdxs: number[] = []
    for (let i = 0; i < particles.length; i += SIG.NODE_STRIDE) hubIdxs.push(i)
    const neighborsOf = new Map<number, number[]>()
    for (const hi of hubIdxs) {
      const a = particles[hi]
      neighborsOf.set(
        hi,
        hubIdxs
          .filter((hj) => hj !== hi)
          .map((hj) => ({
            hj,
            d:
              (a.bx - particles[hj].bx) ** 2 +
              (a.by - particles[hj].by) ** 2,
          }))
          .sort((u, v) => u.d - v.d)
          .slice(0, SIG.NEIGHBORS)
          .map((e) => e.hj),
      )
    }

    let width = 0
    let height = 0
    let scale = 0
    let raf = 0
    let last = performance.now()
    let elapsedMs = 0
    let rect = canvas.getBoundingClientRect()
    const pointer = { tx: FAR_AWAY, ty: FAR_AWAY, x: FAR_AWAY, y: FAR_AWAY, presence: 0, presenceT: 0 }

    const pulses: Pulse[] = []
    const flashes = new Map<number, number>()
    const hubPos = new Map<number, { x: number; y: number }>()
    let nextSpawnMs = 0

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CFG.DPR_CAP)
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (width === 0 || height === 0) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scale = Math.min(width, height) * CFG.BRAIN_SCALE
      rect = canvas.getBoundingClientRect()
    }

    const renderFrame = (dtMs: number) => {
      elapsedMs += dtMs
      const t = elapsedMs / 1000

      const ease = smoothing(CFG.POINTER_HALF_LIFE_MS, dtMs)
      pointer.x = lerp(pointer.x, pointer.tx, ease)
      pointer.y = lerp(pointer.y, pointer.ty, ease)
      pointer.presence = lerp(pointer.presence, pointer.presenceT, ease)

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = CFG.LINE_WIDTH

      const planes = V2.DEPTH_PLANES
      const breath =
        1 + V2.BREATHING.AMPLITUDE * Math.sin(t * V2.BREATHING.ANGULAR_SPEED)
      const cx = width / 2
      const cy = height / 2
      const normX = Math.max(-1, Math.min(1, (pointer.x - cx) / (width / 2)))
      const normY = Math.max(-1, Math.min(1, (pointer.y - cy) / (height / 2)))
      const parallaxX = planes.map(
        (pl) => normX * pl.PARALLAX * pointer.presence,
      )
      const parallaxY = planes.map(
        (pl) => normY * pl.PARALLAX * 0.6 * pointer.presence,
      )

      const rotAngles = planes.map((pl) => t * CFG.CONSTELLATION_ROTATION * pl.ROT)
      const cosR = rotAngles.map(Math.cos)
      const sinR = rotAngles.map(Math.sin)

      const paths = planes.map(() =>
        CFG.PALETTE.map(() => new Path2D()),
      )
      const excited = new Path2D()
      const radiusSq = CFG.REACTION_RADIUS * CFG.REACTION_RADIUS

      hubPos.clear()

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const pl = planes[p.plane]
        const ux = p.bx * cosR[p.plane] - p.by * sinR[p.plane]
        const uy = p.bx * sinR[p.plane] + p.by * cosR[p.plane]
        let x =
          cx +
          ux * scale * pl.SCALE * breath +
          Math.sin(t * p.driftRate + p.phase) *
            CFG.DRIFT_AMPLITUDE *
            pl.DRIFT +
          parallaxX[p.plane]
        let y =
          cy +
          uy * scale * pl.SCALE * breath +
          Math.cos(t * p.driftRate * 0.83 + p.phase * 1.7) *
            CFG.DRIFT_AMPLITUDE *
            pl.DRIFT +
          parallaxY[p.plane]

        const dx = x - pointer.x
        const dy = y - pointer.y
        const distSq = dx * dx + dy * dy
        let force = 0
        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq) || 1
          force = 1 - dist / CFG.REACTION_RADIUS
          const push =
            force *
            force *
            CFG.REACTION_PUSH *
            (0.75 + 0.25 * Math.sin(t * 5 + p.phase))
          x += (dx / dist) * push
          y += (dy / dist) * push
        }

        if (i % SIG.NODE_STRIDE === 0) hubPos.set(i, { x, y })

        const size = p.size * (1 + force)
        const angle = p.angle + t * p.spinRate
        const ca = Math.cos(angle)
        const sa = Math.sin(angle)
        const v1x = sa * size
        const v1y = -ca * size
        const v2x = (ca * 0.866 - sa * 0.5) * size
        const v2y = (sa * 0.866 + ca * 0.5) * size
        const v3x = (-ca * 0.866 - sa * 0.5) * size
        const v3y = (-sa * 0.866 + ca * 0.5) * size

        const path =
          force > CFG.EXCITATION_THRESHOLD ? excited : paths[p.plane][p.colorIndex]
        path.moveTo(x + v1x, y + v1y)
        path.lineTo(x + v2x, y + v2y)
        path.lineTo(x + v3x, y + v3y)
        path.closePath()
      }

      for (let pl = 0; pl < planes.length; pl++) {
        for (let c = 0; c < CFG.PALETTE.length; c++) {
          ctx.globalAlpha = CFG.BASE_ALPHA[c] * planes[pl].ALPHA
          ctx.strokeStyle = CFG.PALETTE[c]
          ctx.stroke(paths[pl][c])
        }
      }
      ctx.globalAlpha = 1
      ctx.lineWidth = CFG.EXCITED_LINE_WIDTH
      ctx.strokeStyle = CFG.EXCITED_COLOR
      ctx.stroke(excited)

      // --- Synaptic signal pulses ("an axon firing"). ---
      if (
        !reducedMotion &&
        pulses.length < SIG.MAX_ACTIVE &&
        elapsedMs >= nextSpawnMs
      ) {
        nextSpawnMs = elapsedMs + SIG.SPAWN_EVERY_MS * (0.7 + Math.random() * 0.6)
        const from = hubIdxs[(Math.random() * hubIdxs.length) | 0]
        const edges = neighborsOf.get(from)
        if (edges && edges.length > 0) {
          pulses.push({
            from,
            to: edges[(Math.random() * edges.length) | 0],
            start: elapsedMs,
            travel: SIG.TRAVEL_MS_MIN + Math.random() * (SIG.TRAVEL_MS_MAX - SIG.TRAVEL_MS_MIN),
          })
        }
      }

      if (pulses.length > 0 || flashes.size > 0) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = CFG.EXCITED_COLOR
        ctx.shadowColor = CFG.EXCITED_COLOR
        ctx.shadowBlur = SIG.GLOW_BLUR

        for (let i = pulses.length - 1; i >= 0; i--) {
          const pulse = pulses[i]
          const t01 = (elapsedMs - pulse.start) / pulse.travel
          if (t01 >= 1) {
            flashes.set(pulse.to, elapsedMs)
            pulses.splice(i, 1)
            continue
          }
          const a = hubPos.get(pulse.from)
          const b = hubPos.get(pulse.to)
          if (!a || !b) continue
          for (let s = 0; s < SIG.COMET_SEGMENTS; s++) {
            const ts = Math.max(0, t01 - (s * SIG.SEGMENT_GAP_MS) / pulse.travel)
            const tts = ts * ts * (3 - 2 * ts)
            const k = 1 - s / SIG.COMET_SEGMENTS
            ctx.globalAlpha = k * 0.7
            ctx.beginPath()
            ctx.arc(
              lerp(a.x, b.x, tts),
              lerp(a.y, b.y, tts),
              SIG.DOT_RADIUS * (0.55 + 0.45 * k),
              0,
              TAU,
            )
            ctx.fill()
          }
        }

        // Luminous edge pickup: destination hub flashes on arrival.
        for (const [idx, start] of flashes) {
          const age = elapsedMs - start
          if (age >= SIG.FLASH_MS) {
            flashes.delete(idx)
            continue
          }
          const pos = hubPos.get(idx)
          if (!pos) continue
          const k = 1 - age / SIG.FLASH_MS
          ctx.globalAlpha = k * 0.9
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, SIG.FLASH_RADIUS * (0.5 + k), 0, TAU)
          ctx.fill()
        }

        ctx.shadowBlur = 0
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
    }

    const frame = (now: number) => {
      const dt = Math.min(now - last, 34)
      last = now
      renderFrame(dt)
      raf = requestAnimationFrame(frame)
    }

    const startLoop = () => {
      if (reducedMotion) return
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const stopLoop = () => cancelAnimationFrame(raf)

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX - rect.left
      pointer.ty = event.clientY - rect.top
      pointer.presenceT = 1
    }

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        pointer.tx = FAR_AWAY
        pointer.ty = FAR_AWAY
        pointer.presenceT = 0
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop()
      else startLoop()
    }

    const refreshRect = () => {
      rect = canvas.getBoundingClientRect()
    }

    const observer = new ResizeObserver(() => {
      fit()
      if (reducedMotion) renderFrame(16)
    })

    const controller = new AbortController()
    const { signal } = controller

    fit()
    if (reducedMotion) renderFrame(16)
    observer.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { signal, passive: true })
    document.addEventListener('pointerout', onPointerOut, { signal })
    document.addEventListener('visibilitychange', onVisibilityChange, { signal })
    window.addEventListener('scroll', refreshRect, { signal, passive: true })
    startLoop()

    return () => {
      stopLoop()
      observer.disconnect()
      controller.abort()
    }
  }, [])

  return <canvas ref={canvasRef} className="constellation-canvas" aria-hidden="true" />
}

export default memo(ParticleConstellation)
