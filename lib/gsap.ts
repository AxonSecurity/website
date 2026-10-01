'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

let registered = false

function register() {
  if (registered || typeof window === 'undefined') return
  registered = true
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    TextPlugin,
    CustomEase,
    useGSAP,
  )
  // Signature curves. "axon" is the long-tail entrance used everywhere;
  // "axon-io" is the symmetric curve for wipes and pinned scrubs.
  CustomEase.create('axon', '0.16,1,0.3,1')
  CustomEase.create('axon-io', '0.76,0,0.24,1')
  gsap.defaults({ ease: 'axon', duration: 1 })
  ScrollTrigger.config({ ignoreMobileResize: true })
}

register()

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches
}

export const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*+-'

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, TextPlugin, useGSAP }
