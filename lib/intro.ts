'use client'

import { useEffect, useState } from 'react'

// A tiny one-shot bus: the preloader announces when the stage is revealed,
// and above-the-fold entrances wait for it instead of animating underneath.

type Listener = () => void

let done = false
const listeners = new Set<Listener>()

export function markIntroDone(): void {
  if (done) return
  done = true
  const pending = [...listeners]
  listeners.clear()
  // Deferred on purpose: the preloader fires this from inside its own GSAP
  // timeline, and GSAP would otherwise run listeners in the preloader's
  // context, where scoped selector strings resolve to nothing.
  window.setTimeout(() => {
    for (const listener of pending) listener()
  }, 0)
}

export function isIntroDone(): boolean {
  return done
}

export function onIntroDone(listener: Listener): () => void {
  if (done) {
    listener()
    return () => undefined
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useIntroDone(): boolean {
  const [value, setValue] = useState(done)
  useEffect(() => onIntroDone(() => setValue(true)), [])
  return value
}
