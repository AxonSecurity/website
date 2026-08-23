import PillButton from '@/components/layout/PillButton'
import Reveal from '@/components/Reveal'
import { ArrowRight } from '@/components/icons'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Eyebrow from '@/components/typography/Eyebrow'
import NodeVisual from './NodeVisual'

const FEATURES: Array<[string, string, string]> = [
  [
    'DISCOVER',
    'Every model. Every route. Every dependency.',
    'Axon inventories the AI systems your teams build, buy, and quietly ship.',
  ],
  [
    'UNDERSTAND',
    'Context over noise.',
    'Trace data, permissions, prompts, and vendors into one continuously updated risk picture.',
  ],
  [
    'GOVERN',
    'Make responsible AI operational.',
    'Turn policy into guardrails that move at the speed of your organization.',
  ],
]

export default function FeatureFlow() {
  return (
    <section className="section-shell feature-flow" id="platform">
      <Reveal>
        <Eyebrow>The Axon difference</Eyebrow>
        <DisplayHeading secondary>
          Security posture
          <br />
          with a pulse.
        </DisplayHeading>
      </Reveal>
      {FEATURES.map(([label, title, text], index) => (
        <Reveal
          key={label}
          className={`feature-row ${index % 2 ? 'reverse' : ''}`}
        >
          <div className="feature-copy">
            <span className="feature-label">{label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <a className="text-link" href="#access">
              Explore {label.toLowerCase()} <ArrowRight size={15} />
            </a>
          </div>
          <NodeVisual variant={index} />
        </Reveal>
      ))}
    </section>
  )
}
