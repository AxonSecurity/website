'use client'

import { useEffect, useRef, useState } from 'react'
import Magnetic from '@/components/motion/Magnetic'
import SplitReveal from '@/components/motion/SplitReveal'
import Eyebrow from '@/components/ui/Eyebrow'
import Pill from '@/components/ui/Pill'
import { ArrowDownRight } from '@/components/icons'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'
import { buildEstate, TYPE_LABEL } from './estateData'
import type EstateGraph from './EstateGraph'
import type { FocusSnapshot } from './EstateGraph'
import HeroHud from './HeroHud'
import HeroTitle from './HeroTitle'
import StaticGraph from './StaticGraph'
import './hero.css'

type Mode = 'pending' | 'webgl' | 'static'

const MOBILE_QUERY = '(max-width: 760px)'

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tipRef = useRef<HTMLDivElement | null>(null)
  const [mode, setMode] = useState<Mode>('pending')
  const [focus, setFocus] = useState<FocusSnapshot | null>(null)
  // Card width is measured once per focus change, never inside the frame loop.
  const cardWidthRef = useRef(220)

  useEffect(() => {
    const card = tipRef.current?.querySelector<HTMLElement>('.hero-tip-card')
    if (card) cardWidthRef.current = card.offsetWidth
  }, [focus])
  const [stats, setStats] = useState<EstateGraph['stats'] | null>(null)
  const [live, setLive] = useState(false)
  const [mobile, setMobile] = useState(false)

  // ---- WebGL estate graph
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const isMobile = window.matchMedia(MOBILE_QUERY).matches
    setMobile(isMobile)
    const estate = buildEstate(isMobile ? 7 : 10)
    const fallback = () => {
      setStats({ nodes: estate.nodes.length, edges: estate.edges.length, signalsPerSecond: 0 })
      setMode('static')
    }
    if (prefersReducedMotion()) {
      fallback()
      return
    }

    // three.js loads only for visitors who will actually see the WebGL graph.
    let disposed = false
    let teardown: () => void = () => undefined
    import('./EstateGraph')
      .then(({ default: EstateGraphClass }) => {
        if (disposed) return
        teardown = mountGraph(EstateGraphClass)
      })
      .catch(fallback)

    const mountGraph = (EstateGraphClass: typeof EstateGraph): (() => void) => {
      let graph: EstateGraph
      // The tooltip only touches the DOM when something actually changed.
      const last = { x: '', y: '', visible: '', flipX: '', flipY: '' }
      const write = (tip: HTMLElement, key: keyof typeof last, value: string, apply: () => void) => {
        if (last[key] === value) return
        last[key] = value
        apply()
      }
      try {
        graph = new EstateGraphClass(canvas, estate, {
          mobile: isMobile,
          finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
          onFocus: setFocus,
          onFrame: (x, y, visible) => {
            const tip = tipRef.current
            if (!tip) return
            const shown = visible ? 'true' : 'false'
            write(tip, 'visible', shown, () => (tip.dataset.visible = shown))
            if (!visible) return
            const tx = x.toFixed(1)
            const ty = y.toFixed(1)
            if (tx !== last.x || ty !== last.y) {
              last.x = tx
              last.y = ty
              tip.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
            }
            // Flip the card below/left when it would leave the stage; on narrow
            // screens keep it on whichever side has room.
            const reach = 44 + cardWidthRef.current + 12
            const width = canvas.clientWidth
            const overflowsRight = x + reach > width
            const fitsLeft = x - reach >= 0
            const flipY = y < 190 ? 'true' : 'false'
            const flipX = overflowsRight && (fitsLeft || x > width / 2) ? 'true' : 'false'
            write(tip, 'flipY', flipY, () => (tip.dataset.flipY = flipY))
            write(tip, 'flipX', flipX, () => (tip.dataset.flipX = flipX))
          },
        })
      } catch {
        fallback()
        return () => undefined
      }
      setMode('webgl')
      setStats(graph.stats)

      let inView = true
      let pageVisible = !document.hidden
      const sync = () => (inView && pageVisible ? graph.start() : graph.stop())
      sync()

      // Deferred a tick so the graph's timeline isn't recorded into whichever
      // GSAP context happened to announce the intro.
      let introTimer = 0
      const unsubscribe = onIntroDone(() => {
        introTimer = window.setTimeout(() => {
          graph.playIntro()
          setLive(true)
        }, 0)
      })

      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        sync()
      })
      io.observe(section)

      const onVisibility = () => {
        pageVisible = !document.hidden
        sync()
      }
      // The copy layer is pointer-events:none, so test its boxes geometrically.
      const copyBlocks = Array.from(
        section.querySelectorAll<HTMLElement>('.ht-word, .hero-lead, .hero-ctas, .hud'),
      )
      // Pointer work is batched to one pass per frame, and the copy boxes
      // are measured once and re-measured only after a scroll or resize.
      let canvasBox: DOMRect | null = null
      let copyBoxes: DOMRect[] | null = null
      const invalidate = () => {
        canvasBox = null
        copyBoxes = null
      }
      let pending: { x: number; y: number } | null = null
      let pointerFrame = 0
      const flushPointer = () => {
        pointerFrame = 0
        if (!pending) return
        const { x, y } = pending
        pending = null
        canvasBox ??= canvas.getBoundingClientRect()
        copyBoxes ??= copyBlocks.map((block) => block.getBoundingClientRect())
        const overCopy = copyBoxes.some(
          (box) => x >= box.left - 12 && x <= box.right + 12 && y >= box.top - 12 && y <= box.bottom + 12,
        )
        graph.setPointer(x - canvasBox.left, y - canvasBox.top, true, !overCopy)
      }
      const onPointer = (event: PointerEvent) => {
        pending = { x: event.clientX, y: event.clientY }
        if (!pointerFrame) pointerFrame = requestAnimationFrame(flushPointer)
      }
      const onLeave = () => {
        pending = null
        graph.setPointer(-9999, -9999, false)
      }
      const resize = new ResizeObserver(() => {
        invalidate()
        graph.resize()
      })
      resize.observe(canvas)
      window.addEventListener('scroll', invalidate, { passive: true })

      document.addEventListener('visibilitychange', onVisibility)
      section.addEventListener('pointermove', onPointer)
      section.addEventListener('pointerleave', onLeave)

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => graph.setScroll(self.progress),
      })

      return () => {
        unsubscribe()
        window.clearTimeout(introTimer)
        trigger.kill()
        io.disconnect()
        resize.disconnect()
        cancelAnimationFrame(pointerFrame)
        window.removeEventListener('scroll', invalidate)
        document.removeEventListener('visibilitychange', onVisibility)
        section.removeEventListener('pointermove', onPointer)
        section.removeEventListener('pointerleave', onLeave)
        graph.dispose()
      }
    }

    return () => {
      disposed = true
      teardown()
    }
  }, [])

  useEffect(() => {
    if (mode !== 'static') return
    return onIntroDone(() => setLive(true))
  }, [mode])

  // ---- Entrances + scroll-out
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.set('.hero-rule', { scaleX: 0 })
      gsap.set('.hero-ctas > *, .hud, .hero-cue > *', { opacity: 0, y: 24 })

      // Built paused inside this scope: onIntroDone may fire from inside the
      // preloader's GSAP context, where scoped selectors would miss.
      const entrance = gsap
        .timeline({ paused: true, delay: 0.9 })
        .to('.hero-rule', { scaleX: 1, duration: 1.6, ease: 'axon-io' }, 0)
        .to('.hero-ctas > *', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.35)
        .to('.hud', { opacity: 1, y: 0, duration: 1.2 }, 0.6)
        .to('.hero-cue > *', { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 1)
      const unsubscribe = onIntroDone(() => entrance.play())

      const scrub = { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap
        .timeline({ scrollTrigger: scrub, defaults: { ease: 'none' } })
        .to('.hero-content', { yPercent: -14, duration: 1 }, 0)
        .to('.hero-content', { opacity: 0, duration: 0.45 }, 0.55)
        .to('.hero-cue', { opacity: 0, duration: 0.15 }, 0)
      gsap.to('.hero-stage', { yPercent: 26, ease: 'none', scrollTrigger: scrub })
      gsap.to('.hud-shell', {
        yPercent: -40,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { ...scrub, end: '45% top' },
      })

      return unsubscribe
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="top" className="hero" data-mode={mode}>
      <div className="hero-stage" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-canvas" />
        {mode === 'static' ? <StaticGraph clusters={mobile ? 7 : 10} /> : null}
        <div className="hero-vignette" />
      </div>
      <div className="hero-fade" aria-hidden="true" />

      <div ref={tipRef} className="hero-tip" data-visible="false" aria-hidden="true">
        <span className="hero-tip-ring" />
        <span className="hero-tip-line" />
        <span className="hero-tip-card mono">
          <span className="hero-tip-type">
            {focus ? `${TYPE_LABEL[focus.node.type]} · ${focus.node.name}` : ''}
          </span>
          <span className="hero-tip-reach">
            {focus
              ? focus.direction === 'out'
                ? `Blast radius · ${focus.reach} nodes`
                : `Reached by · ${focus.reach} nodes`
              : ''}
          </span>
        </span>
      </div>

      <div className="hud-shell">
        <HeroHud stats={stats} focus={focus} live={live} still={mode === 'static'} />
      </div>

      <div className="hero-content wrap">
        <Eyebrow label="Agent security · In-tenant" trigger="intro" className="hero-eyebrow" />
        <HeroTitle />
        <div className="hero-rule" aria-hidden="true" />
        <div className="hero-foot">
          <SplitReveal as="p" className="lead hero-lead" trigger="intro" delay={1.05}>
            Axon discovers every agent in your stack — who it acts for, what it can reach, where it runs — and
            judges the paths that matter.
          </SplitReveal>
          <div className="hero-ctas">
            <Magnetic>
              <Pill href="#access" cursor="GO">
                Get covered
              </Pill>
            </Magnetic>
            <a className="text-link" href="#premise">
              See how it works <ArrowDownRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="hero-cue mono" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero-cue-line" />
      </div>
    </section>
  )
}
