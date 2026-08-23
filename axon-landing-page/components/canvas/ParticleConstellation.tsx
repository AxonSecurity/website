'use client'

import { memo, useEffect, useRef } from 'react'
import { CANVAS_CONFIG as CFG } from './config'
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
}

const FAR_AWAY = -1e5

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
    }).map((point) => ({
      bx: point.x,
      by: point.y,
      phase: attrRand() * Math.PI * 2,
      driftRate: CFG.DRIFT_SPEED * (0.6 + attrRand() * 0.8),
      size: CFG.TRIANGLE_SIZE_MIN + attrRand() * (CFG.TRIANGLE_SIZE_MAX - CFG.TRIANGLE_SIZE_MIN),
      angle: attrRand() * Math.PI * 2,
      spinRate: (attrRand() - 0.5) * 2 * CFG.SPIN_SPEED,
      colorIndex: pickColorIndex(attrRand),
    }))

    let width = 0
    let height = 0
    let scale = 0
    let raf = 0
    let last = performance.now()
    let elapsedMs = 0
    let rect = canvas.getBoundingClientRect()
    const pointer = { tx: FAR_AWAY, ty: FAR_AWAY, x: FAR_AWAY, y: FAR_AWAY }

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

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = CFG.LINE_WIDTH

      const paths = CFG.PALETTE.map(() => new Path2D())
      const excited = new Path2D()
      const radiusSq = CFG.REACTION_RADIUS * CFG.REACTION_RADIUS
      const rotAngle = t * CFG.CONSTELLATION_ROTATION
      const cosR = Math.cos(rotAngle)
      const sinR = Math.sin(rotAngle)
      const cx = width / 2
      const cy = height / 2

      for (const p of particles) {
        const ux = p.bx * cosR - p.by * sinR
        const uy = p.bx * sinR + p.by * cosR
        let x =
          cx + ux * scale + Math.sin(t * p.driftRate + p.phase) * CFG.DRIFT_AMPLITUDE
        let y =
          cy +
          uy * scale +
          Math.cos(t * p.driftRate * 0.83 + p.phase * 1.7) * CFG.DRIFT_AMPLITUDE

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

        const path = force > CFG.EXCITATION_THRESHOLD ? excited : paths[p.colorIndex]
        path.moveTo(x + v1x, y + v1y)
        path.lineTo(x + v2x, y + v2y)
        path.lineTo(x + v3x, y + v3y)
        path.closePath()
      }

      for (let i = 0; i < paths.length; i++) {
        ctx.globalAlpha = CFG.BASE_ALPHA[i]
        ctx.strokeStyle = CFG.PALETTE[i]
        ctx.stroke(paths[i])
      }
      ctx.globalAlpha = 1
      ctx.lineWidth = CFG.EXCITED_LINE_WIDTH
      ctx.strokeStyle = CFG.EXCITED_COLOR
      ctx.stroke(excited)
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
    }

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        pointer.tx = FAR_AWAY
        pointer.ty = FAR_AWAY
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
