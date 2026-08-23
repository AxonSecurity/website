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
    <div className="marquee" aria-label="Axon capabilities">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul
            className="marquee-group"
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
