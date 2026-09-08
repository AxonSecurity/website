import Logo from '@/components/brand/Logo'
import {
  AnthropicMark,
  AwsMark,
  HackNationMark,
} from '@/components/partners/marks'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#loop', label: 'Protocol' },
  { href: '#governance', label: 'Governance' },
  { href: '#access', label: 'Request early access' },
]

const ECHO = [
  {
    name: 'HackNation Venture Lab',
    href: 'https://ventures.hack-nation.ai/',
    Mark: HackNationMark,
  },
  {
    name: 'AWS for Startups',
    href: 'https://aws.amazon.com/startups/',
    Mark: AwsMark,
  },
  {
    name: 'Anthropic Cyber Verification Program',
    href: 'https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet',
    Mark: AnthropicMark,
  },
]

export default function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer-top">
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
        <span className="footer-tagline">
          Continuous AI posture &amp; governance for security teams.
        </span>
        <span>© 2026 Axon Security, Inc.</span>
      </div>
      <div className="footer-echo">
        <span className="footer-echo-label">Backed by · Member of</span>
        {ECHO.map(({ name, href, Mark }) => (
          <a
            key={name}
            className="footer-echo-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
          >
            <span className="footer-echo-mark">
              <Mark size={14} />
            </span>
            <span className="footer-echo-name">{name}</span>
          </a>
        ))}
      </div>
    </footer>
  )
}
