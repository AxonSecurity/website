'use client'

import { useEffect, useRef, useState } from 'react'
import Logo from '@/components/brand/Logo'
import { AnthropicMark, AwsMark, E2bMark, HackNationMark } from '@/components/partners/marks'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { scrollToTarget } from '@/lib/scroll'
import { NAV_LINKS, PARTNER_LINKS } from '@/components/layout/links'
import './footer.css'

function useClock(): string {
  const [time, setTime] = useState('--:--:--')
  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' })
    setTime(format())
    const id = window.setInterval(() => setTime(format()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

export default function Footer() {
  const ref = useRef<HTMLElement | null>(null)
  const time = useClock()

  useGSAP(
    () => {
      const root = ref.current
      if (!root || prefersReducedMotion()) return
      gsap.fromTo(
        '.footer-inner',
        { yPercent: -18 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <footer ref={ref} className="footer" id="footer">
      <div className="footer-inner wrap">
        <div className="footer-top">
          <div className="footer-lockup">
            <Logo compact />
            <p className="footer-line">
              Every agent, <span className="serif-i">accounted for.</span>
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="mono footer-h">Index</p>
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
                <li>
                  <a href="#access">Get covered</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="mono footer-h">Backed by</p>
              <ul className="footer-marks">
                <li>
                  <a href={PARTNER_LINKS.hacknation.href} target="_blank" rel="noopener noreferrer" aria-label={PARTNER_LINKS.hacknation.name}>
                    <HackNationMark size={20} />
                  </a>
                </li>
                <li>
                  <a href={PARTNER_LINKS.aws.href} target="_blank" rel="noopener noreferrer" aria-label={PARTNER_LINKS.aws.name}>
                    <AwsMark size={20} />
                  </a>
                </li>
                <li>
                  <a href={PARTNER_LINKS.e2b.href} target="_blank" rel="noopener noreferrer" aria-label={PARTNER_LINKS.e2b.name}>
                    <E2bMark size={20} />
                  </a>
                </li>
              </ul>
              <p className="mono footer-h footer-h-gap">Member of</p>
              <ul className="footer-marks">
                <li>
                  <a href={PARTNER_LINKS.anthropic.href} target="_blank" rel="noopener noreferrer" aria-label={PARTNER_LINKS.anthropic.name}>
                    <AnthropicMark size={16} />
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="mono footer-h">Time</p>
              <p className="footer-clock mono tabular">
                {time} <span>UTC</span>
              </p>
              <button type="button" className="footer-top-link mono" onClick={() => scrollToTarget(0)} data-cursor="UP">
                Back to top ↑
              </button>
            </div>
          </div>
        </div>

        <div className="footer-base mono">
          <span>© 2026 Axon Security, Inc.</span>
          <span>Agent security for the AI stack you run.</span>
          <span>In-tenant · Read-only · Signed</span>
        </div>
      </div>
    </footer>
  )
}
