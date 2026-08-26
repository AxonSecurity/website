'use client'

import DisplayHeading from '@/components/typography/DisplayHeading'
import Reveal from '@/components/motion/Reveal'
import { usePinnedScene } from '@/lib/hooks/usePinnedScene'
import { LOOP_STAGES } from '@/components/canvas/config'

const RING_RADIUS = 150
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const STATION_ANGLE_DEG = [-90, 0, 90, 180]

function stationPosition(index: number) {
  const radians = (STATION_ANGLE_DEG[index] * Math.PI) / 180
  return {
    x: 200 + RING_RADIUS * Math.cos(radians),
    y: 200 + RING_RADIUS * Math.sin(radians),
  }
}

const LABEL_ANCHOR = ['middle', 'start', 'middle', 'end'] as const
const LABEL_DY = [-14, 4, 22, 4] as const

export default function Loop() {
  const { ref, activeIndex } = usePinnedScene(LOOP_STAGES.length)
  const activeStage = LOOP_STAGES[activeIndex]

  return (
    <section className="loop" id="loop" ref={ref}>
      <div className="shell loop-head">
        <Reveal>
          <p className="eyebrow">The Axon protocol</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            One loop. Total posture.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="body-copy">
            The Axon protocol turns your scattered AI usage into a single,
            continuously updated security posture.
          </p>
        </Reveal>
      </div>

      <div className="loop-mobile-rail">
        <span className="loop-mobile-stage">{activeStage.word}</span>
        <div className="loop-mobile-bar">
          <div className="loop-mobile-fill" />
        </div>
      </div>

      <div className="loop-track">
        <div className="loop-diagram-cell" aria-hidden="true">
          <svg className="loop-diagram" viewBox="0 0 400 400" aria-hidden="true">
            <circle
              className="loop-ring-base"
              cx="200"
              cy="200"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="1"
            />
            <g transform="rotate(-90 200 200)">
              <circle
                className="loop-ring-progress"
                cx="200"
                cy="200"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="2"
                strokeDasharray={CIRCUMFERENCE}
                style={{
                  strokeDashoffset: `calc(${CIRCUMFERENCE}px * (1 - var(--loop-progress, 0)))`,
                }}
              />
            </g>
            <line
              className="loop-needle"
              x1="200"
              y1="200"
              x2="200"
              y2="82"
              style={{
                transform: 'rotate(calc(var(--loop-progress, 0) * 360deg))',
              }}
            />
            {LOOP_STAGES.map((stage, index) => {
              const position = stationPosition(index)
              return (
                <g
                  key={stage.id}
                  className={`loop-node ${index <= activeIndex ? 'is-active' : ''}`}
                >
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={index === activeIndex ? 10 : 7}
                  />
                </g>
              )
            })}
            <text
              className="loop-center-word"
              x="200"
              y="211"
              textAnchor="middle"
            >
              {activeStage.word}
            </text>
          </svg>
        </div>

        <div className="loop-steps">
          {LOOP_STAGES.map((stage, index) => (
            <article
              key={stage.id}
              className={`loop-step ${index === activeIndex ? 'is-active' : ''}`}
            >
              <span className="loop-step-num">{stage.num}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
