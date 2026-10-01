'use client'

import type Lenis from 'lenis'

// Shared handle on the smooth-scroll engine so any component can read
// scroll velocity (marquees, skew) or request a programmatic scroll.

let instance: Lenis | null = null
let velocity = 0

export function setLenis(lenis: Lenis | null): void {
  instance = lenis
  if (!lenis) velocity = 0
}

export function getLenis(): Lenis | null {
  return instance
}

export function setScrollVelocity(value: number): void {
  velocity = value
}

/** Pixels per frame, signed. Zero when smooth scroll is off. */
export function getScrollVelocity(): number {
  return velocity
}

export function scrollToTarget(target: string | number | HTMLElement): void {
  if (instance) {
    instance.scrollTo(target, { duration: 1.6 })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target })
    return
  }
  const element =
    typeof target === 'string' ? document.querySelector(target) : target
  element?.scrollIntoView()
}

export function lockScroll(locked: boolean): void {
  if (instance) {
    if (locked) instance.stop()
    else instance.start()
  }
  document.documentElement.classList.toggle('is-locked', locked)
}
