export const NAV_LINKS = [
  { href: '#discover', label: 'Discover' },
  { href: '#judge', label: 'Judge' },
  { href: '#observe', label: 'Observe' },
  { href: '#sovereign', label: 'Sovereign' },
  { href: '#roadmap', label: 'Roadmap' },
] as const

export const PARTNER_LINKS = {
  hacknation: { name: 'HackNation Venture Lab', href: 'https://ventures.hack-nation.ai/' },
  aws: { name: 'AWS for Startups', href: 'https://aws.amazon.com/startups/' },
  e2b: { name: 'E2B for Startups', href: 'https://e2b.dev/startups/' },
  anthropic: {
    name: 'Anthropic Cyber Verification Program',
    href: 'https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet',
  },
} as const
