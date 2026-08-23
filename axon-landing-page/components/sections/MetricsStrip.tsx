import { Fragment } from 'react'
import Reveal from '@/components/motion/Reveal'
import CountUp from '@/components/motion/CountUp'

interface Metric {
  label: string
  value: number
  decimals?: number
  suffix?: string
}

const METRICS: Metric[] = [
  { label: 'AI SYSTEMS DISCOVERED', value: 2481 },
  { label: 'CONNECTED DATA POINTS', value: 18.7, decimals: 1, suffix: 'k' },
  { label: 'CONTINUOUS COVERAGE', value: 24, suffix: '/7' },
]

export default function MetricsStrip() {
  return (
    <Reveal className="section-shell data-type">
      {METRICS.map((metric) => (
        <Fragment key={metric.label}>
          <span>{metric.label}</span>
          <strong>
            <CountUp
              value={metric.value}
              decimals={metric.decimals ?? 0}
              suffix={metric.suffix ?? ''}
            />
          </strong>
        </Fragment>
      ))}
    </Reveal>
  )
}
