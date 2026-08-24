'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CloseIcon, MenuIcon } from '@/components/icons'
import Logo from '@/components/brand/Logo'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#loop', label: 'Protocol' },
  { href: '#governance', label: 'Governance' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    window.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          setOpen(false)
          menuButtonRef.current?.focus()
        }
      },
      { signal: controller.signal },
    )
    return () => controller.abort()
  }, [open])

  useEffect(() => {
    let lastY = window.scrollY
    let raf = 0

    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`
      }
      setScrolled(y > 8)
      if (!open) {
        if (y > lastY + 4 && y > 140) setHidden(true)
        else if (y < lastY - 4 || y <= 140) setHidden(false)
      }
      lastY = y
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const controller = new AbortController()
    window.addEventListener('scroll', onScroll, {
      signal: controller.signal,
      passive: true,
    })
    update()
    return () => {
      controller.abort()
      cancelAnimationFrame(raf)
    }
  }, [open])

  const close = () => setOpen(false)

  const classes = [
    'nav',
    scrolled || open ? 'nav-scrolled' : '',
    hidden && !open ? 'nav-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={classes} aria-label="Main navigation">
      <a href="#top" aria-label="Axon home">
        <Logo />
      </a>
      <div id="nav-links" className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={close}>
            {link.label}
          </a>
        ))}
        <a className="nav-cta" href="#access" onClick={close}>
          Request access <ArrowRight size={15} />
        </a>
      </div>
      <button
        ref={menuButtonRef}
        className="menu-button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div ref={progressRef} className="nav-progress" aria-hidden="true" />
    </nav>
  )
}
