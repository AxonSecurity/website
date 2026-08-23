'use client'

import { memo, useEffect, useRef } from 'react'
import { ORB_CONFIG as CFG } from './config'
import { lerp, mulberry32, smoothing } from '@/lib/animation'

interface OrbDot {
  x: number
  y: number
  z: number
  colorIndex: number
  size: number
  phase: number
}

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

/** Even deterministic fibonacci-lattice distribution on the unit sphere. */
function buildDots(): OrbDot[] {
  const rand = mulberry32(CFG.SEED ^ 0x1f2e3d4c)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const dots: OrbDot[] = []
  for (let i = 0; i < CFG.COUNT; i++) {
    const y = 1 - ((i + 0.5) * 2) / CFG.COUNT
    const ringRadius = Math.sqrt(1 - y * y)
    const theta = golden * i
    dots.push({
      x: Math.cos(theta) * ringRadius,
      y,
      z: Math.sin(theta) * ringRadius,
      colorIndex: pickColorIndex(rand),
      size:
        (CFG.DOT_SIZE_MIN +
          rand() * (CFG.DOT_SIZE_MAX - CFG.DOT_SIZE_MIN)) *
        (1 + (rand() - 0.5) * 2 * CFG.SIZE_JITTER),
      phase: rand() * TAU,
    })
  }
  return dots
}

function ParticleOrb() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dots = buildDots()

    let width = 0
    let height = 0
    let radius = 100
    let raf = 0
    let last = performance.now()
    let elapsedMs = 0
    let rect = canvas.getBoundingClientRect()
    const pointer = {
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
      tiltExtra: 0,
      tiltTarget: 0,
      presence: 0,
      presenceT: 0,
    }

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CFG.DPR_CAP)
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (width === 0 || height === 0) return
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const half = Math.min(width, height) / 2
      // Anti-crop invariant: see config.ts header.
      radius =
        Math.max(40, half - CFG.PARALLAX_MAX - CFG.SHIMMER_AMP - 2) /
        (1 + CFG.BREATH_AMPLITUDE)
      rect = canvas.getBoundingClientRect()
    }

    /** Builds and fills all batched paths for one frame state. */
    const drawFrame = (
      t: number,
      rotY: number,
      tiltX: number,
      offX: number,
      offY: number,
    ) => {
      const cx = width / 2 + offX
      const cy = height / 2 + offY
      const rEff = radius * (1 + CFG.BREATH_AMPLITUDE * Math.sin(t * CFG.BREATH_SPEED))
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(tiltX)
      const sinX = Math.sin(tiltX)

      ctx.clearRect(0, 0, width, height)

      const bands = CFG.DEPTH_BANDS
      const cores: Path2D[] = []
      const halos: Path2D[] = []
      for (let i = 0; i < bands * CFG.PALETTE.length; i++) {
        cores.push(new Path2D())
      }
      for (let i = 0; i < bands; i++) halos.push(new Path2D())
      const rim = new Path2D()

      for (const d of dots) {
        const x1 = d.x * cosY + d.z * sinY
        const z1 = -d.x * sinY + d.z * cosY
        const y2 = d.y * cosX - z1 * sinX
        const z2 = d.y * sinX + z1 * cosX

        const depthT = (z2 + 1) / 2
        const band = Math.min(bands - 1, (depthT * bands) | 0)

        const shimmer = reducedMotion
          ? 0
          : Math.sin(t * CFG.SHIMMER_SPEED + d.phase) * CFG.SHIMMER_AMP
        const sx = cx + x1 * rEff + shimmer
        const sy = cy + y2 * rEff

        const dotR = Math.max(
          0.5,
          (CFG.DOT_SIZE_MIN + depthT * (CFG.DOT_SIZE_MAX - CFG.DOT_SIZE_MIN)) *
            (d.size / ((CFG.DOT_SIZE_MIN + CFG.DOT_SIZE_MAX) / 2)),
        )

        const halo = halos[band]
        halo.moveTo(sx + dotR * CFG.HALO_SIZE_MULT, sy)
        halo.arc(sx, sy, dotR * CFG.HALO_SIZE_MULT, 0, TAU)

        const core = cores[band * CFG.PALETTE.length + d.colorIndex]
        core.moveTo(sx + dotR, sy)
        core.arc(sx, sy, dotR, 0, TAU)

        const screenR = Math.sqrt(x1 * x1 + y2 * y2)
        if (screenR >= CFG.RIM_INNER && z2 > -0.2) {
          rim.moveTo(sx + dotR, sy)
          rim.arc(sx, sy, dotR + 0.4, 0, TAU)
        }
      }

      // Halo pass (uniform lime veil), then depth-banded cores.
      ctx.fillStyle = CFG.PALETTE[0]
      for (let b = 0; b < bands; b++) {
        const bandAlpha =
          CFG.ALPHA_BACK +
          ((b + 0.5) / bands) * (CFG.ALPHA_FRONT - CFG.ALPHA_BACK)
        ctx.globalAlpha = bandAlpha * CFG.HALO_ALPHA
        ctx.fill(halos[b])
      }
      for (let b = 0; b < bands; b++) {
        const bandAlpha =
          CFG.ALPHA_BACK +
          ((b + 0.5) / bands) * (CFG.ALPHA_FRONT - CFG.ALPHA_BACK)
        for (let c = 0; c < CFG.PALETTE.length; c++) {
          ctx.globalAlpha = bandAlpha
          ctx.fillStyle = CFG.PALETTE[c]
          ctx.fill(cores[b * CFG.PALETTE.length + c])
        }
      }
      // Rim light, additive.
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = CFG.RIM_BOOST_ALPHA
      ctx.fillStyle = CFG.RIM_COLOR
      ctx.fill(rim)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    const renderFrame = (dtMs: number) => {
      elapsedMs += dtMs
      const t = elapsedMs / 1000

      const ease = smoothing(CFG.POINTER_HALF_LIFE_MS, dtMs)
      pointer.x = lerp(pointer.x, pointer.tx, ease)
      pointer.y = lerp(pointer.y, pointer.ty, ease)
      pointer.presence = lerp(pointer.presence, pointer.presenceT, ease)
      pointer.tiltExtra = lerp(pointer.tiltExtra, pointer.tiltTarget, ease)

      const rotY = reducedMotion ? 0.8 : t * CFG.AUTO_ROT_Y
      const wobble = reducedMotion
        ? 0
        : Math.sin(t * CFG.WOBBLE_SPEED) * CFG.WOBBLE_AMP
      const tiltX = CFG.BASE_TILT_X + wobble + pointer.tiltExtra

      const normX = Math.max(-1, Math.min(1, (pointer.x - rect.left - width / 2) / (width / 2)))
      const normY = Math.max(-1, Math.min(1, (pointer.y - rect.top - height / 2) / (height / 2)))
      drawFrame(
        t,
        rotY,
        tiltX,
        normX * CFG.PARALLAX_MAX * pointer.presence,
        normY * CFG.PARALLAX_MAX * 0.6 * pointer.presence,
      )
      pointer.tiltTarget = normY * CFG.POINTER_TILT * pointer.presence
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
      if (!event.relatedTarget) {
        pointer.presenceT = 0
        pointer.tiltTarget = 0
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
    if (reducedMotion) {
      renderFrame(16)
    } else {
      window.addEventListener('pointermove', onPointerMove, { signal, passive: true })
      document.addEventListener('pointerout', onPointerOut, { signal })
      document.addEventListener('visibilitychange', onVisibilityChange, { signal })
      window.addEventListener('scroll', refreshRect, { signal, passive: true })
      startLoop()
    }
    observer.observe(canvas)

    return () => {
      stopLoop()
      observer.disconnect()
      controller.abort()
    }
  }, [])

  return <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />
}

export default memo(ParticleOrb)
