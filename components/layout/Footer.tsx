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

const ECHO_GROUPS = [
  {
    label: 'Backed by',
    items: [
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
    ],
  },
  {
    label: 'Member of the cybersecurity program of',
    items: [
      {
        name: 'Anthropic Cyber Verification Program',
        href: 'https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet',
        Mark: AnthropicMark,
      },
    ],
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
        {ECHO_GROUPS.map((group) => (
          <div className="footer-echo-group" key={group.label}>
            <span className="footer-echo-label">{group.label}</span>
            {group.items.map(({ name, href, Mark }) => (
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
              </a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  )
}