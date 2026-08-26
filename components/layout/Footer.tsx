import Logo from '@/components/brand/Logo'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#loop', label: 'Protocol' },
  { href: '#governance', label: 'Governance' },
  { href: '#access', label: 'Request early access' },
]

export default function Footer() {
  return (
    <footer className="footer shell">
      <a href="#top" aria-label="Axon home">
        <Logo compact />
      </a>
      <nav className="footer-nav" aria-label="Footer navigation">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <span className="footer-tagline">Continuous AI posture &amp; governance for security teams.</span>
      <span>© 2026 Axon Security, Inc.</span>
    </footer>
  )
}
