'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import StaticTide from './StaticTide'

const TideScene = dynamic(() => import('./TideScene'), {
  ssr: false,
  loading: () => <StaticTide />,
})

type Mode = 'static' | 'webgl'

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    )
  } catch {
    return false
  }
}

interface TideCanvasProps {
  introspect: boolean
}

export default function TideCanvas({ introspect }: TideCanvasProps) {
  const [mode, setMode] = useState<Mode>('static')
  const [active, setActive] = useState(true)
  const [simSize, setSimSize] = useState(512)
  const holderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!detectWebGL()) return

    setSimSize(window.innerWidth < 768 ? 256 : 512)
    setMode('webgl')

    const controller = new AbortController()
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    )
    if (holderRef.current) observer.observe(holderRef.current)
    window.addEventListener(
      'resize',
      () => setSimSize(window.innerWidth < 768 ? 256 : 512),
      { signal: controller.signal },
    )

    return () => {
      controller.abort()
      observer.disconnect()
    }
  }, [])

  return (
    <div className="tide-canvas" ref={holderRef} aria-hidden="true">
      {mode === 'webgl' ? (
        <TideScene simSize={simSize} introspect={introspect} active={active} />
      ) : (
        <StaticTide />
      )}
      <div className="tide-vignette" />
    </div>
  )
}
