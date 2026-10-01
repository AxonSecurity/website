'use client'

import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { STAGES } from './stages'

const PINNED = '(min-width: 901px) and (prefers-reduced-motion: no-preference)'
const STACKED = '(max-width: 900px) and (prefers-reduced-motion: no-preference)'

// Desktop: the stage pins and vertical scroll drives the panels sideways.
// Each giant stage word breathes open on its width axis as it crosses the
// centre, while a signal pulse rides the rail above. Mobile and reduced
// motion get a plain vertical stack.
export default function RoadmapTrack() {
  const ref = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const stage = ref.current
      if (!stage) return
      const track = stage.querySelector<HTMLElement>('.rm-track')
      const panels = gsap.utils.toArray<HTMLElement>('.rm-panel', stage)
      const stations = gsap.utils.toArray<HTMLElement>('.rm-station', stage)
      const counter = stage.querySelector<HTMLElement>('.rm-count-now')
      // --p lives on the rail only, so a scroll frame restyles three nodes,
      // not the whole stage subtree that would inherit it.
      const rail = stage.querySelector<HTMLElement>('.rm-rail-line')
      if (!track || !rail) return

      const mm = gsap.matchMedia()

      mm.add(PINNED, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
        let lastIndex = -1

        const setProgress = (progress: number) => {
          rail.style.setProperty('--p', progress.toFixed(4))
          const index = Math.min(stations.length - 1, Math.round(progress * (stations.length - 1)))
          stations.forEach((station, i) => {
            station.classList.toggle('is-on', progress >= i / (stations.length - 1) - 0.02)
          })
          if (index !== lastIndex) {
            lastIndex = index
            panels.forEach((panel, i) => panel.classList.toggle('is-current', i === index))
            if (counter) counter.textContent = String(index + 1).padStart(2, '0')
          }
        }

        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${distance() * 1.35}`,
            pin: true,
            refreshPriority: 1,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
            onRefresh: (self) => setProgress(self.progress),
          },
        })

        panels.forEach((panel) => {
          const word = panel.querySelector<HTMLElement>('.rm-word')
          const body = panel.querySelectorAll<HTMLElement>('.rm-title, .rm-text, .rm-keys')
          if (!word) return
          gsap
            .timeline({
              scrollTrigger: {
                trigger: panel,
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            })
            .fromTo(word, { '--rw': 70, xPercent: 6 }, { '--rw': 125, xPercent: 0, ease: 'sine.out', duration: 1 })
            .to(word, { '--rw': 70, xPercent: -6, ease: 'sine.in', duration: 1 })

          gsap.from(body, {
            y: 60,
            opacity: 0,
            stagger: 0.08,
            ease: 'axon',
            duration: 1,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: slide,
              start: 'left 78%',
              toggleActions: 'play none none reverse',
            },
          })
        })

        return () => {
          rail.style.removeProperty('--p')
        }
      })

      mm.add(STACKED, () => {
        panels.forEach((panel) => {
          const word = panel.querySelector<HTMLElement>('.rm-word')
          if (!word) return
          gsap.fromTo(
            word,
            { '--rw': 70 },
            {
              '--rw': 110,
              ease: 'none',
              scrollTrigger: { trigger: panel, start: 'top 90%', end: 'top 30%', scrub: true },
            },
          )
          gsap.from(panel.querySelectorAll('.rm-title, .rm-text, .rm-keys'), {
            y: 40,
            opacity: 0,
            stagger: 0.08,
            duration: 1,
            scrollTrigger: { trigger: panel, start: 'top 70%', once: true },
          })
        })
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="rm-stage">
      <div className="rm-rail wrap" aria-hidden="true">
        <div className="rm-rail-line">
          <div className="rm-rail-fill" />
          <div className="rm-rail-rider">
            <div className="rm-rail-pulse" />
          </div>
          {STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`rm-station ${index === 0 ? 'is-on' : ''}`}
              style={{ '--at': `${(index / (STAGES.length - 1)) * 100}%` } as CSSProperties}
            >
              <span className="rm-station-dot" />
              <span className="rm-station-label mono">{stage.word}</span>
            </div>
          ))}
        </div>
        <p className="rm-count mono tabular">
          Stage <span className="rm-count-now">01</span> / {String(STAGES.length).padStart(2, '0')}
        </p>
      </div>

      <div className="rm-track">
        {STAGES.map((stage, index) => (
          <article
            key={stage.id}
            className={`rm-panel ${index === 0 ? 'is-current' : ''}`}
            style={{ '--pw': stage.width } as CSSProperties}
          >
            <div className="rm-panel-meta mono">
              <span className="rm-panel-num tabular">{String(index + 1).padStart(2, '0')}</span>
              <span className="rm-panel-when">{stage.when}</span>
            </div>
            <p className="rm-word" aria-hidden="true">
              {stage.word}
            </p>
            <div className="rm-panel-body">
              <h3 className="rm-title">
                <span className="sr-only">{stage.word}: </span>
                {stage.title}
              </h3>
              <div className="rm-panel-copy">
                <p className="rm-text">{stage.text}</p>
                <ul className="rm-keys mono" aria-label="Capabilities">
                  {stage.keywords.map((keyword) => (
                    <li key={keyword}>{keyword}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
