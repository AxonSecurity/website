const ITEMS = [
  'DISCOVERY',
  'CONTEXT MAPPING',
  'RISK PRIORITIZATION',
  'POLICY GUARDRAILS',
  'CONTINUOUS AUDIT',
  'VENDOR INTELLIGENCE',
]

export default function Marquee() {
  return (
    <div className="ticker" aria-label="Axon capabilities">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <ul
            className="ticker-group"
            key={copy}
            aria-hidden={copy === 1 || undefined}
          >
            {ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
