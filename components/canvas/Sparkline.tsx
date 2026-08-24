'use client'

import { useEffect, useRef } from 'react'
import { useInView } from '@/lib/hooks/useInView'

interface SparklineProps {
  seed: number
}

export default function Sparkline({ seed }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ref, inView] = useInView<HTMLCanvasElement>(0.4)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = 132
    const h = 38
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let state = seed >>> 0
    const rand = () => {
      state = (state + 0x6d2b79f5) | 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const COUNT = 26
    const values: number[] = []
    let v = 0.55
    for (let i = 0; i < COUNT; i += 1) {
      v += (rand() - 0.42) * 0.16
      v = Math.max(0.12, Math.min(0.92, v))
      values.push(v)
    }

    const pad = 3
    const stepX = (w - pad * 2) / (COUNT - 1)
    const points = values.map((value, index) => ({
      x: pad + index * stepX,
      y: h - pad - value * (h - pad * 2),
    }))

    const drawLine = (progress: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(149, 255, 42, 0.85)'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.beginPath()
      const lastX = pad + (COUNT - 1) * stepX * progress
      for (let i = 0; i < COUNT; i += 1) {
        if (points[i].x > lastX) break
        if (i === 0) ctx.moveTo(points[i].x, points[i].y)
        else ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()

      const tipIndex = Math.min(
        Math.floor(progress * (COUNT - 1)),
        COUNT - 1,
      )
      ctx.fillStyle = '#95ff2a'
      ctx.beginPath()
      ctx.arc(points[tipIndex].x, points[tipIndex].y, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }

    if (reduced) {
      drawLine(1)
      return
    }

    const start = performance.now()
    const DURATION = 1400
    let raf = requestAnimationFrame(function tick(now: number) {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      drawLine(eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [inView, seed])

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node
        ref.current = node
      }}
      className="metric-spark"
      width={132}
      height={38}
      aria-hidden="true"
    />
  )
}
