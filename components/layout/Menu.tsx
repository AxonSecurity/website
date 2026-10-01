'use client'

import { useEffect, useRef, useState } from 'react'
import { Mark } from '@/components/brand/Logo'
import { gsap, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS } from '@/lib/gsap'
import { lockScroll, scrollToTarget } from '@/lib/scroll'
import { NAV_LINKS, PARTNER_LINKS } from '@/components/layout/links'
import './menu.css'

interface MenuProps {
  open: boolean
  onClose: () => void
}

const ITEMS = [...NAV_LINKS, { href: '#access', label: 'Get covered' }]

const PREVIEWS: Record<string, string> = {
  '#discover': 'Every agent, identity, tool and MCP server — one graph.',
  '#judge': 'Three legs, or it isn’t a finding.',
  '#observe': 'Metadata only. Never the message.',
  '#sovereign': 'Your data never leaves your tenant.',
  '#roadmap': 'Now. Next. Thereafter.',
  '#access': 'A read-only scan of your own stack, in your own tenant.',
}

const IDLE_PREVIEW = 'Agent security for the AI stack you already run.'

// Full-screen index. Opens as a circle bursting from the menu button; the
// links rise on masked lines and swell in width under the pointer.
export default function Menu({ open, onClose }: MenuProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const previewRef = useRef<HTMLParagraphElement | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const element = previewRef.current
    if (!element) return
    const text = hovered ? PREVIEWS[hovered] : IDLE_PREVIEW
    if (prefersReducedMotion()) {
      element.textContent = text
      return
    }
    const tween = gsap.to(element, {
      duration: 0.7,
      ease: 'none',
      scrambleText: { text, chars: SCRAMBLE_CHARS.toLowerCase(), speed: 1, revealDelay: 0.1 },
    })
    return () => {
      tween.kill()
    }
  }, [hovered])

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()
      const tl = gsap.timeline({ paused: true })
      tl.set(ref.current, { visibility: 'visible' })
        .fromTo(
          ref.current,
          { clipPath: 'circle(0% at calc(100% - 60px) 38px)' },
          { clipPath: 'circle(150% at calc(100% - 60px) 38px)', duration: reduced ? 0.01 : 1.1, ease: 'axon-io' },
        )
        .from(
          '.menu-link-inner',
          { yPercent: 110, duration: reduced ? 0.01 : 1.1, stagger: reduced ? 0 : 0.06, ease: 'axon' },
          reduced ? 0 : 0.35,
        )
      if (!reduced) {
        tl.from('.menu-foot > *', { opacity: 0, y: 20, duration: 0.8, stagger: 0.05 }, 0.6)
          .from('.menu-aside > *', { opacity: 0, y: 40, duration: 1, stagger: 0.08 }, 0.5)
          .from('.menu-mark', { rotate: -24, scale: 0.7, duration: 1.4 }, 0.4)
      }
      timeline.current = tl
    },
    { scope: ref },
  )

  useEffect(() => {
    const tl = timeline.current
    if (!tl) return
    const menu = ref.current
    const toggle = document.querySelector<HTMLButtonElement>('.nav-menu')
    if (open && menu) {
      lockScroll(true)
      tl.timeScale(1).play()
      // The menu turns visible on the timeline's first tick; focus after it.
      const focusTimer = window.setTimeout(() => {
        menu.querySelector<HTMLElement>('.menu-link')?.focus({ preventScroll: true })
      }, 60)
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        // Trap focus between the menu's links and the close toggle.
        const focusables = [
          ...menu.querySelectorAll<HTMLElement>('a[href], button'),
          ...(toggle ? [toggle] : []),
        ]
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || !focusables.includes(active as HTMLElement))) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && (active === last || !focusables.includes(active as HTMLElement))) {
          event.preventDefault()
          first?.focus()
        }
      }
      window.addEventListener('keydown', onKey)
      return () => {
        window.clearTimeout(focusTimer)
        window.removeEventListener('keydown', onKey)
      }
    }
    if (tl.progress() > 0) {
      const hadFocus = !!menu?.contains(document.activeElement)
      tl.timeScale(1.6).reverse()
      lockScroll(false)
      if (hadFocus || document.activeElement === document.body) toggle?.focus({ preventScroll: true })
    }
    return undefined
  }, [open, onClose])

  const go = (href: string) => {
    onClose()
    // Wait for the scroll lock to lift before travelling.
    window.setTimeout(() => scrollToTarget(href), 80)
  }

  return (
    <div
      ref={ref}
      id="site-menu"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="menu-inner wrap">
        <div className="menu-body">
          <ol className="menu-links" onMouseLeave={() => setHovered(null)}>
            {ITEMS.map((item, index) => (
              <li key={item.href}>
                <a
                  className="menu-link"
                  href={item.href}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onClick={(event) => {
                    event.preventDefault()
                    go(item.href)
                  }}
                >
                  <span className="menu-link-inner">
                    <span className="menu-link-num mono">{String(index + 1).padStart(2, '0')}</span>
                    <span className="menu-link-text">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <div className="menu-aside" aria-hidden="true">
            <p className="mono menu-aside-label">{hovered ? 'Chapter' : 'Axon'}</p>
            <p ref={previewRef} className="menu-preview">
              {IDLE_PREVIEW}
            </p>
            <Mark size={220} className="menu-mark" />
          </div>
        </div>
        <div className="menu-foot">
          <p className="mono menu-foot-label">Agent security for the AI stack you already run.</p>
          <div className="menu-foot-partners mono">
            {Object.values(PARTNER_LINKS).map((partner) => (
              <a key={partner.href} href={partner.href} target="_blank" rel="noopener noreferrer">
                {partner.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
