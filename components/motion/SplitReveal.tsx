'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'

interface SplitRevealProps {
  as?: ElementType
  children: ReactNode
  className?: string
  id?: string
  /** lines: masked line rise · words: masked word rise · chars: masked char rise */
  type?: 'lines' | 'words' | 'chars'
  /** scroll: when it enters · intro: after the preloader · manual: never */
  trigger?: 'scroll' | 'intro'
  delay?: number
  stagger?: number
  duration?: number
  start?: string
}

// Masked text rise. SplitText re-splits on resize/font load (autoSplit), and
// the returned tween is re-created against the new lines automatically.
export default function SplitReveal({
  as: Tag = 'div',
  children,
  className,
  id,
  type = 'lines',
  trigger = 'scroll',
  delay = 0,
  stagger,
  duration = 1.25,
  start = 'top 86%',
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const element = ref.current
      if (!element || prefersReducedMotion()) return

      const splitType = type === 'lines' ? 'lines' : type === 'words' ? 'lines,words' : 'lines,words,chars'
      const defaultStagger = type === 'lines' ? 0.1 : type === 'words' ? 0.045 : 0.018
      let tween: gsap.core.Tween | null = null
      let released = trigger !== 'intro'
      let unsubscribe: () => void = () => undefined

      const split = SplitText.create(element, {
        type: splitType,
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'lines' ? self.lines : type === 'words' ? self.words : self.chars
          tween = gsap.from(targets, {
            yPercent: 115,
            rotate: type === 'chars' ? 6 : 2.5,
            transformOrigin: '0% 100%',
            duration,
            stagger: stagger ?? defaultStagger,
            delay,
            ease: 'axon',
            paused: !released,
            scrollTrigger:
              trigger === 'scroll'
                ? { trigger: element, start, once: true }
                : undefined,
          })
          return tween
        },
      })

      if (trigger === 'intro') {
        unsubscribe = onIntroDone(() => {
          released = true
          tween?.play()
        })
      }

      return () => {
        unsubscribe()
        split.revert()
      }
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  )
}
