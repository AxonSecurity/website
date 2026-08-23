import Reveal from '@/components/motion/Reveal'
import OrbitCards from '@/components/motion/OrbitCards'
import Eyebrow from '@/components/typography/Eyebrow'
import type { OrbitFeature } from '@/components/motion/OrbitCards'

const FEATURES: OrbitFeature[] = [
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
      <OrbitCards features={FEATURES} />
    </section>
  )
}
