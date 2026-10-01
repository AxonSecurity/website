'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MARK_PATH, MARK_STROKE } from '@/components/brand/Logo'

// Butt-capped twins of the mark's strokes. A square cap paints an 11-unit
// stub the moment a dash starts, which made the crossbars pop in. Extending
// each leg by half a stroke, and starting each bar inside its leg, gives the
// exact same finished silhouette while every stroke grows from nothing.
const LEGS = 'M11.17 84.72 L50 20 L88.83 84.72'
const BAR_LEFT = 'M30 58 H48.5'
const BAR_RIGHT = 'M70 58 H51.5'

const STEPS = [
  {
    num: '01',
    name: 'Reach',
    title: 'It can reach something that matters.',
    sub: 'A regulated data store. A production credential.',
  },
  {
    num: '02',
    name: 'Influence',
    title: 'Something untrusted can steer it.',
    sub: 'A public endpoint. A poisoned tool description. External input.',
  },
  {
    num: '03',
    name: 'No boundary',
    title: 'Nothing in between compensates.',
    sub: 'No auth. No per-user key. No private network.',
  },
] as const

// Scroll progress at which each stage begins. Stage 4 = the mark ignites.
const STAGE_AT = [0.07, 0.29, 0.51, 0.75] as const

function stageFor(progress: number): number {
  let stage = 0
  STAGE_AT.forEach((at, index) => {
    if (progress >= at) stage = index + 1
  })
  return stage
}

// The Axon mark, assembled leg by leg: reach + influence + the missing
// boundary (the gapped crossbar). Only when all three hold is it a finding.
export default function ThreeLegs() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const steps = gsap.utils.toArray<HTMLElement>('.tl-step', root)

      const applyStage = (stage: number) => {
        if (root.dataset.stage === String(stage)) return
        root.dataset.stage = String(stage)
        root.style.setProperty('--stage', String(stage))
        steps.forEach((step, index) => {
          step.classList.toggle('is-on', index < stage)
          step.classList.toggle('is-current', index === stage - 1 && stage < 4)
        })
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        applyStage(0)
        gsap.set('.tl-legs, .tl-bar, .tl-lead', { drawSVG: '0% 0%' })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=300%',
            pin: true,
            refreshPriority: 1,
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => applyStage(stageFor(self.progress)),
          },
        })

        // Only stroke lengths are scrubbed. Everything else (labels, glow,
        // rings) is a CSS transition on opacity/transform keyed off the
        // stage, so it runs on the compositor instead of every scroll frame.
        tl
          // 01 · reach: left leg, apex-bound.
          .to('.tl-legs', { drawSVG: '0% 50%', duration: 0.2, ease: 'sine.inOut' }, STAGE_AT[0])
          .to('.tl-lead-1', { drawSVG: '0% 100%', duration: 0.08 }, STAGE_AT[0] + 0.12)
          // 02 · influence: right leg completes the apex.
          .to('.tl-legs', { drawSVG: '0% 100%', duration: 0.2, ease: 'sine.inOut' }, STAGE_AT[1])
          .to('.tl-lead-2', { drawSVG: '0% 100%', duration: 0.08 }, STAGE_AT[1] + 0.12)
          // 03 · no boundary: both bars grow out of their legs and stop short.
          .to('.tl-bar', { drawSVG: '0% 100%', duration: 0.2, ease: 'sine.inOut' }, STAGE_AT[2])
          .to('.tl-lead-3', { drawSVG: '0% 100%', duration: 0.08 }, STAGE_AT[2] + 0.12)
          // Ignite.
          .to('.tl-ghost', { opacity: 0, duration: 0.08 }, STAGE_AT[3])
          .to('.tl-lead', { opacity: 0.25, duration: 0.08 }, STAGE_AT[3])
          .to({}, { duration: 0.13 }, 0.87)

        return () => {
          root.dataset.stage = '4'
          root.style.removeProperty('--stage')
          steps.forEach((step) => step.classList.remove('is-on', 'is-current'))
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        applyStage(4)
        root.classList.add('is-static')
        return () => root.classList.remove('is-static')
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="tl" data-stage="4">
      <div className="tl-stage wrap">
        <ol className="tl-steps mono" aria-label="The three legs of a finding">
          {STEPS.map((step, index) => (
            <li className="tl-step is-on" key={step.num}>
              <span className="tl-step-dot" aria-hidden="true" />
              <span className="tl-step-num">{step.num}</span>
              <span className="tl-step-name">{step.name}</span>
              {index < STEPS.length - 1 ? <span className="tl-step-rule" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>

        {STEPS.map((step, index) => (
          <div className={`tl-label tl-label-${index + 1}`} key={step.num}>
            <div className="tl-label-top">
              <p className="tl-label-kicker mono">
                <span className="lime">{step.num}</span> · {step.name}
              </p>
              <h3 className="tl-label-title">{step.title}</h3>
            </div>
            <span className="tl-label-rule" aria-hidden="true" />
            <p className="tl-label-sub">{step.sub}</p>
          </div>
        ))}

        <p className="tl-verdict">
          Then it&apos;s <span className="serif-i lime">a finding.</span>
        </p>

        <div className="tl-markcell" aria-hidden="true">
          <div className="tl-glow" />
          <div className="tl-markbox">
            {/* HTML, not SVG: transform/opacity on HTML runs on the compositor. */}
            <span className="tl-ring" />
            <span className="tl-ring" />
            <svg className="tl-svg" viewBox="0 6 100 86" fill="none">
              <g className="tl-ghost">
                <path d={MARK_PATH} className="tl-ghost-edge" strokeWidth={MARK_STROKE} strokeLinecap="square" />
                <path d={MARK_PATH} className="tl-ghost-fill" strokeWidth={MARK_STROKE - 1.3} strokeLinecap="square" />
              </g>
              <g className="tl-leads">
                <path className="tl-lead tl-lead-1" d="M27.4 49 H0" />
                <path className="tl-lead tl-lead-2" d="M72.6 49 H100" />
                <path className="tl-lead tl-lead-3" d="M50 66 V92" />
                <circle className="tl-lead-dot tl-lead-dot-1" cx="27.4" cy="49" r="0.9" />
                <circle className="tl-lead-dot tl-lead-dot-2" cx="72.6" cy="49" r="0.9" />
                <circle className="tl-lead-dot tl-lead-dot-3" cx="50" cy="66" r="0.9" />
              </g>
              <g className="tl-lime">
                <path className="tl-legs" d={LEGS} strokeWidth={MARK_STROKE} />
                <path className="tl-bar" d={BAR_LEFT} strokeWidth={MARK_STROKE} />
                <path className="tl-bar" d={BAR_RIGHT} strokeWidth={MARK_STROKE} />
              </g>
              <rect className="tl-gap-box" x="48.7" y="52.9" width="2.6" height="10.2" />
            </svg>
            <span className="tl-gap-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
