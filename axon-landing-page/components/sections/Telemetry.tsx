import Reveal from '@/components/motion/Reveal'
import CountUp from '@/components/motion/CountUp'
import Sparkline from '@/components/canvas/Sparkline'

const METRICS = [
  { label: 'AI SYSTEMS TRACKED', value: 2481, seed: 11 },
  {
    label: 'RISK SIGNALS CORRELATED',
    value: 18.7,
    decimals: 1,
    suffix: 'M',
    seed: 29,
  },
  { label: 'COVERAGE', value: 24, suffix: '/7', seed: 47 },
]

export default function Telemetry() {
  return (
    <Reveal className="shell telemetry">
      {METRICS.map((metric) => (
        <div className="metric" key={metric.label}>
          <span className="metric-label">{metric.label}</span>
          <div className="metric-value-row">
            <strong className="metric-value">
              <CountUp
                value={metric.value}
                decimals={metric.decimals ?? 0}
                suffix={metric.suffix ?? ''}
              />
            </strong>
            <Sparkline seed={metric.seed} />
          </div>
        </div>
      ))}
    </Reveal>
  )
}
