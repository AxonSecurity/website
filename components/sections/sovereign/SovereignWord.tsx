'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const WORD = 'SOVEREIGN'
const WIDE = 125
const NARROW = 75

// Full-bleed kinetic word. Its font size is solved so the widest setting
// spans the viewport; scroll then scrubs the width axis open while a lime
// fill wipes across the hairline outline.
export default function SovereignWord() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const probe = root.querySelector<HTMLElement>('.sov-word-stroke')
      if (!probe) return

      const fit = () => {
        const previous = root.style.getPropertyValue('--sw')
        root.style.setProperty('--sw', String(WIDE))
        root.style.fontSize = '100px'
        const width = probe.getBoundingClientRect().width
        const styles = getComputedStyle(root)
        const target =
          (root.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)) * 0.995
        if (width > 0) root.style.fontSize = `${(100 * target) / width}px`
        root.style.setProperty('--sw', previous || String(WIDE))
      }
      fit()
      document.fonts?.ready.then(fit).catch(() => undefined)
      const observer = new ResizeObserver(fit)
      observer.observe(root)

      if (prefersReducedMotion()) {
        root.style.setProperty('--sw', String(WIDE))
        root.style.setProperty('--fill', '0%')
        return () => observer.disconnect()
      }

      root.style.setProperty('--sw', String(NARROW))
      root.style.setProperty('--fill', '100%')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 92%',
          end: 'bottom 20%',
          scrub: 1,
        },
      })
      tl.to(root, { '--sw': WIDE, duration: 1, ease: 'axon-io' }, 0)
        .to(root, { '--fill': '0%', duration: 0.75, ease: 'power2.inOut' }, 0.22)
        .fromTo(root, { '--lift': '0.18em' }, { '--lift': '0em', duration: 0.6, ease: 'power2.out' }, 0)

      return () => observer.disconnect()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="sov-word" aria-hidden="true">
      <span className="sov-word-stroke">{WORD}</span>
      <span className="sov-word-fill">{WORD}</span>
    </div>
  )
}
