'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { setLenis, setScrollVelocity } from '@/lib/scroll'

// Lenis drives an inertial native scroll; GSAP's ticker is the single rAF
// for both, so pinned ScrollTriggers never drift a frame behind the scroll.
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      anchors: { offset: 0, duration: 1.6 },
      autoRaf: false,
    })
    setLenis(lenis)
    // The preloader may have locked scroll before Lenis existed.
    if (document.documentElement.classList.contains('is-locked')) lenis.stop()

    const onScroll = (instance: Lenis) => {
      setScrollVelocity(instance.velocity)
      ScrollTrigger.update()
    }
    lenis.on('scroll', onScroll)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Fonts and late images change layout; re-measure every trigger once.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh).catch(() => undefined)
    window.addEventListener('load', refresh, { once: true })

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
