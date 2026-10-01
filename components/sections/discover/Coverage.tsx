import { Fragment } from 'react'
import Marquee from '@/components/motion/Marquee'
import SplitReveal from '@/components/motion/SplitReveal'
import Scramble from '@/components/motion/Scramble'

const CLIENTS = [
  'Claude Code',
  'Cursor',
  'Codex CLI',
  'Gemini CLI',
  'Copilot CLI',
  'VS Code Copilot',
  'Windsurf',
  'Cline',
  'Roo Code',
  'Junie',
]

const FRAMEWORKS = [
  'LangGraph',
  'CrewAI',
  'AutoGen',
  'OpenAI Agents SDK',
  'Google ADK',
  'PydanticAI',
  'LlamaIndex',
  'Claude Agent SDK',
  'n8n',
]

const FACTS = [
  {
    label: 'Read-only',
    text: 'Collectors read configs, lockfiles and source trees. They never write to them, and never start an MCP server to find out.',
  },
  {
    label: 'No network probes',
    text: 'Exposure is derived from addresses, config keys, launch commands and lockfiles — not from scanning your network.',
  },
  {
    label: 'Idempotent',
    text: 'Every node and edge has a content-derived identity. Run discovery again and the graph updates; it never duplicates.',
  },
]

function Row({ items, outlineEvery }: { items: string[]; outlineEvery: number }) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item}>
          <span className={`dm-item ${index % outlineEvery === 1 ? 'dm-item-outline' : ''}`.trim()}>{item}</span>
          <span className="dm-sep" aria-hidden="true" />
        </Fragment>
      ))}
    </>
  )
}

// What the collectors read today: the facts strip and two opposing tickers.
export default function Coverage() {
  return (
    <div className="discover-coverage">
      <div className="wrap discover-facts">
        {FACTS.map((fact, index) => (
          <div className="discover-fact" key={fact.label}>
            <p className="mono discover-fact-label">
              <span className="discover-fact-num">{String(index + 1).padStart(2, '0')}</span>
              <Scramble text={fact.label} />
            </p>
            <SplitReveal as="p" className="body discover-fact-text" delay={0.08 * index}>
              {fact.text}
            </SplitReveal>
          </div>
        ))}
      </div>

      <div className="discover-rows">
        <div className="discover-row">
          <p className="wrap mono discover-row-label">
            <span>Coding-agent clients</span>
            <span className="discover-row-count">{String(CLIENTS.length).padStart(2, '0')}</span>
          </p>
          <Marquee speed={46} direction={-1} skew label={`Coding-agent clients: ${CLIENTS.join(', ')}`}>
            <Row items={CLIENTS} outlineEvery={2} />
          </Marquee>
        </div>
        <div className="discover-row">
          <p className="wrap mono discover-row-label">
            <span>Agent frameworks</span>
            <span className="discover-row-count">{String(FRAMEWORKS.length).padStart(2, '0')}</span>
          </p>
          <Marquee speed={40} direction={1} skew label={`Agent frameworks: ${FRAMEWORKS.join(', ')}`}>
            <Row items={FRAMEWORKS} outlineEvery={2} />
          </Marquee>
        </div>
      </div>
    </div>
  )
}
