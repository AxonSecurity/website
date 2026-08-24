'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { useInView } from '@/lib/hooks/useInView'

interface CountUpProps {
  value: number
  decimals?: number
  durationMs?: number
  prefix?: string
  suffix?: string
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

function format(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function CountUp({
  value,
  decimals = 0,
  durationMs = 1700,
  prefix = '',
  suffix = '',
}: CountUpProps) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5)
  const reducedMotion = useReducedMotion()
  // SSR renders the final value; animation takes over on the client.
  const [display, setDisplay] = useState(value)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setDisplay(value)
      setDone(true)
      return
    }
    const start = performance.now()
    let raf = requestAnimationFrame(function tick(now: number) {
      const t = Math.min((now - start) / durationMs, 1)
      setDisplay(value * easeOutExpo(t))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDone(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [inView, reducedMotion, value, durationMs])

  return (
    <span ref={ref} className={done ? 'count-done' : undefined}>
      {prefix}
      {format(display, decimals)}
      {suffix}
    </span>
  )
}
