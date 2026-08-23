'use client'

import { memo, useEffect, useRef } from 'react'
import { AMBIENT_CONFIG as CFG } from './config'
import { lerp, mulberry32, smoothing } from '@/lib/animation'

interface Mote {
  x: number
  y: number
  size: number
  speed: number
  angle: number
  spinRate: number
  swayPhase: number
  swaySpeed: number
  colorIndex: number
  alpha: number
}

function pickColorIndex(rand: () => number): number {
  const roll = rand()
  let acc = 0
  for (let i = 0; i < CFG.COLOR_WEIGHTS.length; i++) {
    acc += CFG.COLOR_WEIGHTS[i]
    if (roll < acc) return i
  }
  return CFG.COLOR_WEIGHTS.length - 1
}

/** Fixed full-page field of sparse outlined triangles behind all content. */
function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = window.innerWidth
    let height = window.innerHeight

    const rand = mulberry32(CFG.SEED ^ 0x51ab3f7)
    const motes: Mote[] = Array.from({ length: CFG.COUNT }, () => ({
      x: rand() * width,
      y: rand() * height,
      size: CFG.SIZE_MIN + rand() * (CFG.SIZE_MAX - CFG.SIZE_MIN),
      speed: CFG.SPEED_MIN + rand() * (CFG.SPEED_MAX - CFG.SPEED_MIN),
      angle: rand() * Math.PI * 2,
      spinRate: (rand() - 0.5) * 2 * CFG.SPIN_MAX,
      swayPhase: rand() * Math.PI * 2,
      swaySpeed: 0.1 + rand() * 0.15,
      colorIndex: pickColorIndex(rand),
      alpha: CFG.ALPHA_MIN + rand() * (CFG.ALPHA_MAX - CFG.ALPHA_MIN),
    }))

    const pointer = {
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
      presence: 0,
      presenceT: 0,
    }
    let raf = 0
    let last = performance.now()
    let elapsedMs = 0

    const fit = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, CFG.DPR_CAP)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** Simulation step + draw. */
    const renderFrame = (dtMs: number) => {
      elapsedMs += dtMs
      const t = elapsedMs / 1000

      const ease = smoothing(CFG.POINTER_HALF_LIFE_MS, dtMs)
      pointer.x = lerp(pointer.x, pointer.tx, ease)
      pointer.y = lerp(pointer.y, pointer.ty, ease)
      pointer.presence = lerp(pointer.presence, pointer.presenceT, ease)

      const nx = Math.max(-1, Math.min(1, (pointer.x / width) * 2 - 1))
      const ny = Math.max(-1, Math.min(1, (pointer.y / height) * 2 - 1))
      const parallaxX = nx * CFG.PARALLAX_MAX * pointer.presence
      const parallaxY = ny * CFG.PARALLAX_MAX * 0.6 * pointer.presence

      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1

      for (const m of motes) {
        if (!reducedMotion) {
          m.y -= (m.speed * dtMs) / 1000
          if (m.y < -m.size * 2) {
            m.y = height + m.size * 2
            m.x = Math.random() * width
          }
        }

        const depth = (m.size - CFG.SIZE_MIN) / (CFG.SIZE_MAX - CFG.SIZE_MIN)
        const sway = Math.sin(t * m.swaySpeed * Math.PI * 2 + m.swayPhase) *
          CFG.SWAY_AMP * (0.4 + depth)
        const cxp = m.x + sway + parallaxX * (0.35 + depth)
        const cyp = m.y + parallaxY * (0.35 + depth)
        const s = m.size
        const angle = m.angle + t * m.spinRate * Math.PI
        const ca = Math.cos(angle)
        const sa = Math.sin(angle)

        ctx.globalAlpha = m.alpha
        ctx.strokeStyle = CFG.COLORS[m.colorIndex]
        ctx.beginPath()
        ctx.moveTo(cxp + sa * s, cyp - ca * s)
        ctx.lineTo(cxp + (ca * 0.866 - sa * 0.5) * s, cyp + (sa * 0.866 + ca * 0.5) * s)
        ctx.lineTo(cxp + (-ca * 0.866 - sa * 0.5) * s, cyp + (-sa * 0.866 + ca * 0.5) * s)
        ctx.closePath()
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const dt = Math.min(now - last, 34)
      last = now
      renderFrame(dt)
      raf = requestAnimationFrame(frame)
    }

    const startLoop = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const stopLoop = () => cancelAnimationFrame(raf)

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX
      pointer.ty = event.clientY
      pointer.presenceT = 1
    }

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer.presenceT = 0
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop()
      else startLoop()
    }

    const controller = new AbortController()
    const { signal } = controller

    fit()
    renderFrame(16)
    window.addEventListener('resize', fit, { signal })
    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { signal, passive: true })
      document.addEventListener('pointerout', onPointerOut, { signal })
      document.addEventListener('visibilitychange', onVisibilityChange, { signal })
      startLoop()
    }

    return () => {
      stopLoop()
      controller.abort()
    }
  }, [])

  return <canvas ref={canvasRef} className="ambient-field" aria-hidden="true" />
}

export default memo(AmbientField)
