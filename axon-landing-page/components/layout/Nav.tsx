'use client'

import { useState } from 'react'
import { ArrowRight, AxonMark, CloseIcon, MenuIcon } from '@/components/icons'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#discovery', label: 'Discovery' },
  { href: '#governance', label: 'Governance' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="nav" aria-label="Main navigation">
      <a href="#top">
        <span className="brand" aria-label="Axon home">
          <AxonMark />
          <span>AXON</span>
        </span>
      </a>
      <div className={`nav-links ${open ? 'nav-links-open' : ''}`}>
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
        className="menu-button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
    </nav>
  )
}
