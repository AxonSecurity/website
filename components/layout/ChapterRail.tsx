'use client'

import { useEffect, useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { scrollToTarget } from '@/lib/scroll'
import './chapter-rail.css'

interface Chapter {
  id: string
  name: string
}

// Right-edge chapter index. Sections opt in with id + data-chapter="Name".
export default function ChapterRail() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    setChapters(sections.map((section) => ({ id: section.id, name: section.dataset.chapter ?? '' })))

    const triggers = sections.map((section, index) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setActive(index)
        },
        onLeaveBack: () => {
          if (index === 0) setActive(-1)
        },
        onLeave: () => {
          if (index === sections.length - 1) setActive(-1)
        },
      }),
    )
    return () => triggers.forEach((trigger) => trigger.kill())
  }, [])

  if (chapters.length === 0) return null

  return (
    <nav className={`rail ${active >= 0 ? 'rail-on' : ''}`} aria-label="Chapters">
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className={index === active ? 'is-active' : ''}>
            <button
              type="button"
              onClick={() => scrollToTarget(`#${chapter.id}`)}
              aria-current={index === active ? 'true' : undefined}
            >
              <span className="rail-name mono">
                <span className="rail-num">{String(index + 1).padStart(2, '0')}</span> {chapter.name}
              </span>
              <span className="rail-tick" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
