'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { PARTNER_LINKS } from '@/components/layout/links'
import './partners.css'

interface Partner {
  name: string
  href: string
  src: string
  /** Rendered logo height in px; wordmarks and glyphs need different optical sizes. */
  height: number
  slug: string
}

const GROUPS: { heading: string; items: Partner[] }[] = [
  {
    heading: 'Backed by',
    items: [
      { ...PARTNER_LINKS.hacknation, src: '/partners/hacknation.png', height: 34, slug: 'hacknation' },
      { ...PARTNER_LINKS.aws, src: '/partners/aws-startups.png', height: 30, slug: 'aws' },
      { ...PARTNER_LINKS.e2b, src: '/partners/e2b.png', height: 26, slug: 'e2b' },
    ],
  },
  {
    heading: 'Member of the cybersecurity program of',
    items: [{ ...PARTNER_LINKS.anthropic, src: '/partners/anthropic.svg', height: 26, slug: 'anthropic' }],
  },
]

// Restrained trust band: monochrome paper logos, brightened on hover.
export default function Partners() {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const trigger = { trigger: ref.current, start: 'top 90%', once: true }
      gsap.from('.partners-rule', { scaleX: 0, duration: 1.6, ease: 'axon-io', scrollTrigger: trigger })
      gsap.from('.partners-label', { opacity: 0, x: -16, duration: 1, stagger: 0.12, scrollTrigger: trigger })
      gsap.from('.partners-item', {
        opacity: 0,
        y: 26,
        duration: 1.2,
        stagger: 0.09,
        delay: 0.15,
        scrollTrigger: trigger,
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="partners" aria-label="Backed by and member of">
      <div className="partners-inner wrap">
        <div className="partners-rule" aria-hidden="true" />
        {GROUPS.map((group) => (
          <div className={`partners-group partners-group-${group.items.length > 1 ? 'many' : 'one'}`} key={group.heading}>
            <p className="partners-label mono">{group.heading}</p>
            <ul className="partners-list">
              {group.items.map((item) => (
                <li className="partners-item" key={item.slug}>
                  <a
                    className={`partners-link partners-${item.slug}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    data-cursor="VISIT"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" loading="lazy" style={{ height: item.height }} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
