import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'

const SURFACES = [
  'Claude Code',
  'Cursor',
  'Copilot',
  'Codex',
  'Gemini CLI',
  'MCP servers',
  'Skills',
  'Hooks',
  'LangGraph',
  'CrewAI',
  'AutoGen',
  'OpenAI Agents',
  'Pydantic-AI',
  'Google ADK',
  'Anthropic agents',
]

const PHASES = [
  {
    phase: 'Now',
    title: 'Discover and graph',
    text: 'Your AI stack as one interactive graph, with first declared-state findings.',
  },
  {
    phase: 'Next',
    title: 'Real-time protection',
    text: 'Sensors record what agents actually do against what they were allowed to do. Capability breach, dormant agency, and shadow paths surface as deltas — report-first, enforceable after.',
  },
  {
    phase: 'Thereafter',
    title: 'Posture and governance',
    text: 'Risk scoring and prioritization, framework-mapped reporting, and evidence exports built for compliance record-keeping.',
  },
] as const

const PHASE_DELAYS = [1, 2, 3] as const

export default function Path() {
  return (
    <section className="path shell" id="path">
      <div className="path-head">
        <Reveal>
          <p className="eyebrow">Day-one coverage</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            Where Axon starts: the coding-agent estate.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="path-body body-copy">
            No enterprise cloud access is needed to see value on day one.
            Cloud, identity providers, and SaaS agent platforms plug into the
            same graph next.
          </p>
        </Reveal>
      </div>

      <Reveal delay={2}>
        <ul className="path-chips" aria-label="Agent surfaces covered on day one">
          {SURFACES.map((surface) => (
            <li className="path-chip" key={surface}>
              {surface}
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="path-roadmap">
        <Reveal>
          <p className="eyebrow">The road ahead</p>
        </Reveal>
        {PHASES.map((phase, index) => (
          <Reveal delay={PHASE_DELAYS[index]} key={phase.phase}>
            <article className="path-row">
              <span className="path-phase">{phase.phase}</span>
              <div className="path-copy">
                <h3>{phase.title}</h3>
                <p>{phase.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}