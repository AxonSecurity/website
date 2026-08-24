'use client'

import { useEffect, useRef } from 'react'
import { ORB_CONFIG } from './config'
import { mulberry32, clamp, lerp, smoothing } from '@/lib/animation'

interface Particle {
  angle: number
  radiusRatio: number
  radialSpeed: number
  angularSpeed: number
  size: number
  jitter: number
  paper: boolean
}

export default function SignalOrb() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rng = mulberry32(ORB_CONFIG.SEED)
    const particles: Particle[] = []
    let width = 0
    let height = 0
    let maxRadius = 0
    let raf = 0
    let last = performance.now()
    const pointer = { tx: 0, ty: 0, x: 0, y: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, ORB_CONFIG.DPR_CAP)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      maxRadius =
        Math.min(width, height) / 2 - ORB_CONFIG.RADIUS_MARGIN -
        ORB_CONFIG.POINTER_TILT_MAX
    }

    const spawn = (particle: Particle) => {
      particle.angle = rng() * Math.PI * 2
      particle.radiusRatio = ORB_CONFIG.RESPAWN_BAND + rng() * (1 - ORB_CONFIG.RESPAWN_BAND)
      particle.radialSpeed =
        ORB_CONFIG.RADIAL_SPEED_MIN +
        rng() * (ORB_CONFIG.RADIAL_SPEED_MAX - ORB_CONFIG.RADIAL_SPEED_MIN)
      particle.angularSpeed = (rng() - 0.5) * 2 * ORB_CONFIG.ANGULAR_SPEED_MAX
      particle.size =
        ORB_CONFIG.DOT_SIZE_MIN +
        rng() * (ORB_CONFIG.DOT_SIZE_MAX - ORB_CONFIG.DOT_SIZE_MIN)
      particle.jitter = rng() * Math.PI * 2
      particle.paper = rng() < ORB_CONFIG.PAPER_RATIO
    }

    for (let i = 0; i < ORB_CONFIG.COUNT; i += 1) {
      const particle = {} as Particle
      spawn(particle)
      particles.push(particle)
    }

    const frame = (now: number) => {
      const dtMs = clamp(now - last, 0, 34)
      last = now
      const dt = dtMs / 1000
      pointer.x = lerp(pointer.x, pointer.tx, smoothing(
        ORB_CONFIG.POINTER_HALF_LIFE_MS,
        dtMs,
      ))
      pointer.y = lerp(pointer.y, pointer.ty, smoothing(
        ORB_CONFIG.POINTER_HALF_LIFE_MS,
        dtMs,
      ))

      const breath =
        1 + Math.sin(now * 0.001 * ORB_CONFIG.BREATH_SPEED) *
          ORB_CONFIG.BREATH_AMP

      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(
        width / 2 + pointer.x,
        height / 2 + pointer.y,
      )

      for (const particle of particles) {
        particle.angle += particle.angularSpeed * dt
        particle.radiusRatio -=
          (particle.radialSpeed * dt) / maxRadius

        if (particle.radiusRatio < ORB_CONFIG.RESPAWN_BAND * 0.35) {
          spawn(particle)
          continue
        }

        const wobble =
          Math.sin(now * 0.0012 + particle.jitter) * 0.012
        const radius =
          clamp(particle.radiusRatio + wobble, 0, 1) *
          maxRadius *
          breath
        const depth = particle.radiusRatio
        const alpha = lerp(
          ORB_CONFIG.ALPHA_CORE,
          ORB_CONFIG.ALPHA_EDGE,
          depth,
        )
        const coreBoost =
          depth < ORB_CONFIG.CORE_RATIO ? 1.6 : 1
        ctx.fillStyle = particle.paper
          ? '243, 242, 242'
          : '149, 255, 42'
        ctx.globalAlpha = clamp(alpha * coreBoost, 0, 1)
        ctx.beginPath()
        ctx.arc(
          Math.cos(particle.angle) * radius,
          Math.sin(particle.angle) * radius,
          particle.size * (0.7 + depth * 0.5),
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      ctx.restore()
      raf = requestAnimationFrame(frame)
    }

    const staticFrame = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(width / 2, height / 2)
      for (const particle of particles) {
        const radius = clamp(particle.radiusRatio, 0, 1) * maxRadius
        const alpha = lerp(ORB_CONFIG.ALPHA_CORE, ORB_CONFIG.ALPHA_EDGE, particle.radiusRatio)
        ctx.fillStyle = particle.paper ? '243, 242, 242' : '149, 255, 42'
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(
          Math.cos(particle.angle) * radius,
          Math.sin(particle.angle) * radius,
          particle.size,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
      ctx.restore()
    }

    const onPointer = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      pointer.tx = -nx * ORB_CONFIG.POINTER_TILT_MAX
      pointer.ty = -ny * ORB_CONFIG.POINTER_TILT_MAX
    }

    resize()

    if (reduced) {
      staticFrame()
      return
    }

    const controller = new AbortController()
    window.addEventListener('resize', () => {
      resize()
      staticFrame()
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
    <canvas ref={canvasRef} aria-hidden="true" />
  )
}
