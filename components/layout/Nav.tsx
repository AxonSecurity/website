'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Logo from '@/components/brand/Logo'
import Pill from '@/components/ui/Pill'
import Scramble from '@/components/motion/Scramble'
import Menu from '@/components/layout/Menu'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { onIntroDone } from '@/lib/intro'
import { getLenis } from '@/lib/scroll'
import { NAV_LINKS } from '@/components/layout/links'
import './nav.css'

export default function Nav() {
  const ref = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const openRef = useRef(open)
  openRef.current = open
  const closeMenu = useCallback(() => setOpen(false), [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const reveal = gsap.fromTo(
        '.nav-reveal',
        { yPercent: -140, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.06, delay: 0.5, paused: true },
      )
      return onIntroDone(() => reveal.play())
    },
    { scope: ref },
  )

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const y = getLenis()?.scroll ?? window.scrollY
      setScrolled(y > 12)
      if (!openRef.current) {
        if (y > lastY + 6 && y > 200) setHidden(true)
        else if (y < lastY - 6 || y <= 200) setHidden(false)
      }
      lastY = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const classes = ['nav', scrolled ? 'nav-scrolled' : '', hidden && !open ? 'nav-hidden' : '', open ? 'nav-open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header ref={ref} className={classes}>
        <div className="nav-inner wrap">
          <a href="#top" className="nav-logo nav-reveal" aria-label="Axon home" data-cursor="HOME">
            <Logo />
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            {NAV_LINKS.map((link, index) => (
              <a key={link.href} href={link.href} className="nav-link nav-reveal">
                <span className="nav-link-num">{String(index + 1).padStart(2, '0')}</span>
                <Scramble text={link.label} trigger="hover" />
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <span className="nav-reveal nav-cta">
              <Pill href="#access" size="small">
                Get covered
              </Pill>
            </span>
            <button
              type="button"
              className="nav-menu nav-reveal"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="nav-menu-label mono">{open ? 'Close' : 'Menu'}</span>
              <span className="nav-menu-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={closeMenu} />
    </>
  )
}
