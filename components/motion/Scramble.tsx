'use client'

import { useRef, type ElementType } from 'react'
import { gsap, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'

interface ScrambleProps {
  text: string
  as?: ElementType
  className?: string
  trigger?: 'scroll' | 'intro' | 'hover'
  /** Re-scramble on hover in addition to the entrance. */
  hover?: boolean
  delay?: number
  duration?: number
  start?: string
}

// Decodes a mono label from noise into its text — the operational "read-out"
// voice of the page. The final text is server-rendered for crawlers.
export default function Scramble({
  text,
  as: Tag = 'span',
  className,
  trigger = 'scroll',
  hover = false,
  delay = 0,
  duration,
  start = 'top 92%',
}: ScrambleProps) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const element = ref.current
      if (!element || prefersReducedMotion()) return
      const time = duration ?? Math.min(1.6, 0.5 + text.length * 0.03)

      const run = (d = 0) =>
        gsap.to(element, {
          duration: time,
          delay: d,
          ease: 'none',
          scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.55, revealDelay: 0.15 },
        })

      let unsubscribe: () => void = () => undefined

      if (trigger === 'scroll') {
        gsap.set(element, { opacity: 0 })
        gsap.to(element, {
          opacity: 1,
          duration: 0.2,
          delay,
          scrollTrigger: { trigger: element, start, once: true, onEnter: () => run(delay) },
        })
      } else if (trigger === 'intro') {
        gsap.set(element, { opacity: 0 })
        unsubscribe = onIntroDone(() => {
          gsap.to(element, { opacity: 1, duration: 0.2, delay })
          run(delay)
        })
      }

      const onEnter = () => {
        if (!gsap.isTweening(element)) run()
      }
      if (hover || trigger === 'hover') {
        const host = element.closest('a, button') ?? element
        host.addEventListener('mouseenter', onEnter)
        return () => {
          unsubscribe()
          host.removeEventListener('mouseenter', onEnter)
        }
      }
      return unsubscribe
    },
    { scope: ref, dependencies: [text] },
  )

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
