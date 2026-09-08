import {
  AnthropicMark,
  AwsMark,
  HackNationMark,
} from '@/components/partners/marks'

const ANTHROPIC_CVP_URL =
  'https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet'

const GROUPS = [
  {
    heading: 'Backed by',
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
    heading: 'Member of',
    items: [
      {
        name: 'Anthropic Cyber Verification Program',
        href: ANTHROPIC_CVP_URL,
        Mark: AnthropicMark,
      },
    ],
  },
]

export default function Partners() {
  return (
    <section className="partners" aria-label="Backed by and member of">
      <div className="shell partners-inner">
        {GROUPS.map((group) => (
          <div className="partners-group" key={group.heading}>
            <p className="partners-label">{group.heading}</p>
            <ul className="partners-list">
              {group.items.map(({ name, href, Mark }) => (
                <li key={name}>
                  <a
                    className="partners-link"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                  >
                    <span className="partners-mark">
                      <Mark />
                    </span>
                    <span className="partners-name">{name}</span>
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