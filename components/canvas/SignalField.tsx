'use client'

import { useEffect, useRef } from 'react'
import { FIELD_CONFIG } from './config'
import { mulberry32, clamp, lerp, smoothing } from '@/lib/animation'

interface Mote {
  x: number
  y: number
  size: number
  alpha: number
  speed: number
  spin: number
  angle: number
  lime: boolean
  depth: number
}

export default function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rng = mulberry32(FIELD_CONFIG.SEED)
    let width = 0
    let height = 0
    let raf = 0
    let last = performance.now()
    const motes: Mote[] = []
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, FIELD_CONFIG.DPR_CAP)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (mote: Mote, initial: boolean) => {
      mote.x = rng() * (width + 200) - 100
      mote.y = initial ? rng() * height : height + 60
      mote.size =
        FIELD_CONFIG.SIZE_MIN +
        rng() * (FIELD_CONFIG.SIZE_MAX - FIELD_CONFIG.SIZE_MIN)
      mote.alpha =
        FIELD_CONFIG.ALPHA_MIN +
        rng() * (FIELD_CONFIG.ALPHA_MAX - FIELD_CONFIG.ALPHA_MIN)
      mote.speed =
        FIELD_CONFIG.SPEED_MIN +
        rng() * (FIELD_CONFIG.SPEED_MAX - FIELD_CONFIG.SPEED_MIN)
      mote.spin = (rng() - 0.5) * 2 * FIELD_CONFIG.SPIN_MAX
      mote.angle = rng() * Math.PI * 2
      mote.lime = rng() < FIELD_CONFIG.LIME_RATIO
      mote.depth = 0.4 + rng() * 0.6
    }

    const seed = () => {
      motes.length = 0
      for (let i = 0; i < FIELD_CONFIG.COUNT; i += 1) {
        const mote = {} as Mote
        spawn(mote, true)
        motes.push(mote)
      }
    }

    const drawMote = (mote: Mote, offsetX: number, offsetY: number) => {
      const parallaxX = offsetX * mote.depth
      const parallaxY = offsetY * mote.depth
      ctx.save()
      ctx.translate(mote.x + parallaxX, mote.y + parallaxY)
      ctx.rotate(mote.angle)
      ctx.strokeStyle = mote.lime ? '149, 255, 42' : '243, 242, 242'
      ctx.globalAlpha = mote.alpha * mote.depth
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-mote.size / 2, 0)
      ctx.lineTo(mote.size / 2, 0)
      ctx.stroke()
      ctx.restore()
    }

    const frame = (now: number) => {
      const dt = clamp((now - last) / 1000, 0, 0.034)
      last = now
      pointer.x = lerp(pointer.x, pointer.tx, smoothing(
        FIELD_CONFIG.POINTER_HALF_LIFE_MS,
        dt * 1000,
      ))
      pointer.y = lerp(pointer.y, pointer.ty, smoothing(
        FIELD_CONFIG.POINTER_HALF_LIFE_MS,
        dt * 1000,
      ))

      ctx.clearRect(0, 0, width, height)
      for (const mote of motes) {
        mote.y -= mote.speed * dt
        mote.x -= mote.speed * dt * 0.22
        mote.angle += mote.spin * dt
        if (mote.y < -80 || mote.x < -80) spawn(mote, false)
        drawMote(mote, pointer.x, pointer.y)
      }
      raf = requestAnimationFrame(frame)
    }

    const staticFrame = () => {
      ctx.clearRect(0, 0, width, height)
      for (const mote of motes) drawMote(mote, 0, 0)
    }

    const onPointer = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      pointer.tx = -nx * FIELD_CONFIG.PARALLAX_MAX
      pointer.ty = -ny * FIELD_CONFIG.PARALLAX_MAX
    }

    resize()
    seed()

    if (reduced) {
      staticFrame()
      return
    }

    const controller = new AbortController()
    window.addEventListener('resize', () => {
      resize()
      seed()
      if (!raf) staticFrame()
    }, { signal: controller.signal })
    window.addEventListener('pointermove', onPointer, {
      signal: controller.signal,
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }, { signal: controller.signal })

    raf = requestAnimationFrame(frame)

    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="signal-canvas" aria-hidden="true" />
  )
}
