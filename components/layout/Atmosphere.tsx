'use client'

import { useEffect, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'
import './atmosphere.css'

const GRAIN_SIZE = 180
const COLUMNS = 6

function paintGrain(): string {
  const canvas = document.createElement('canvas')
  canvas.width = GRAIN_SIZE
  canvas.height = GRAIN_SIZE
  const context = canvas.getContext('2d')
  if (!context) return ''
  const image = context.createImageData(GRAIN_SIZE, GRAIN_SIZE)
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255
    image.data[i] = value
    image.data[i + 1] = value
    image.data[i + 2] = value
    image.data[i + 3] = Math.random() * 38
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

// Film grain + blueprint column lines: the fixed "paper" the page sits on.
export default function Atmosphere() {
  const grainRef = useRef<HTMLDivElement | null>(null)
  const linesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const grain = grainRef.current
    if (!grain) return
    const url = paintGrain()
    if (url) grain.style.backgroundImage = `url(${url})`
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const lines = gsap.utils.toArray<HTMLElement>('.gridlines-col', linesRef.current)
      const reveal = gsap.fromTo(
        lines,
        { scaleY: 0 },
        { scaleY: 1, duration: 2.2, stagger: 0.08, ease: 'axon-io', delay: 0.2, paused: true },
      )
      return onIntroDone(() => reveal.play())
    },
    { scope: linesRef },
  )

  return (
    <>
      <div ref={linesRef} className="gridlines" aria-hidden="true">
        <div className="gridlines-inner">
          {Array.from({ length: COLUMNS }, (_, index) => (
            <span className="gridlines-col" key={index} />
          ))}
        </div>
      </div>
      <div ref={grainRef} className="grain" aria-hidden="true" />
    </>
  )
}
