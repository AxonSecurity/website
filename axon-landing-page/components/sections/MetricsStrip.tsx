import { Fragment } from 'react'
import Reveal from '@/components/Reveal'

const METRICS: Array<[string, string]> = [
  ['AI SYSTEMS DISCOVERED', '2,481'],
  ['CONNECTED DATA POINTS', '18.7k'],
  ['CONTINUOUS COVERAGE', '24/7'],
]

export default function MetricsStrip() {
  return (
    <Reveal className="section-shell data-type">
      {METRICS.map(([label, value]) => (
        <Fragment key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </Fragment>
      ))}
    </Reveal>
  )
}
