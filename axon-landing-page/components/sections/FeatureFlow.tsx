import Reveal from '@/components/motion/Reveal'
import { ArrowRight } from '@/components/icons'
import Eyebrow from '@/components/typography/Eyebrow'

const FEATURES = [
  {
    label: 'DISCOVER',
    title: 'Every model. Every route. Every dependency.',
    text: 'Axon inventories the AI systems your teams build, buy, and quietly ship.',
  },
  {
    label: 'UNDERSTAND',
    title: 'Context over noise.',
    text: 'Trace data, permissions, prompts, and vendors into one continuously updated risk picture.',
  },
  {
    label: 'GOVERN',
    title: 'Make responsible AI operational.',
    text: 'Turn policy into guardrails that move at the speed of your organization.',
  },
]

export default function FeatureFlow() {
  return (
    <section className="section-shell feature-flow" id="platform">
      <Reveal>
        <Eyebrow>The Axon difference</Eyebrow>
      </Reveal>
      <Reveal className="orbit-stage">
        <div className="orbit-nucleus" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/axon-mark.png" alt="" width={120} height={108} />
          <p className="orbit-subtitle">Security posture with a pulse.</p>
        </div>
        {FEATURES.map((feature) => (
          <article
            key={feature.label}
            className={`orbit-card orbit-card--${feature.label.toLowerCase()}`}
          >
            <span className="feature-label">{feature.label}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            <a className="text-link" href="#access">
              Explore {feature.label.toLowerCase()} <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </Reveal>
    </section>
  )
}
