const STATES = [
  { id: 'declared', name: 'Declared', text: 'From configuration or code.' },
  { id: 'observed', name: 'Observed', text: 'The sensor saw it happen.' },
  { id: 'both', name: 'Both', text: 'Declared, and exercised.' },
] as const

const DELTAS = [
  {
    glyph: 'declared',
    name: 'Grant unused in the window',
    text: 'Declared, never exercised — judged only for agents the sensor covers, after it has run the full window.',
  },
  {
    glyph: 'observed',
    name: 'Action outside any declared grant',
    text: 'Exercised, never declared — after a grace period for grants that just changed.',
  },
  {
    glyph: 'chain',
    name: 'Undeclared delegation or chain',
    text: 'Across applications or runtimes, or reaching data the first agent could not.',
  },
] as const

function EdgeGlyph({ kind }: { kind: string }) {
  if (kind === 'chain') {
    return (
      <svg className="eg-glyph" viewBox="0 0 120 24" aria-hidden="true">
        <line className="eg-line eg-observed" x1="10" y1="12" x2="54" y2="12" />
        <line className="eg-line eg-observed" x1="66" y1="12" x2="110" y2="12" />
        <circle className="eg-node" cx="6" cy="12" r="3.5" />
        <circle className="eg-node eg-node-hot" cx="60" cy="12" r="3.5" />
        <circle className="eg-node" cx="114" cy="12" r="3.5" />
      </svg>
    )
  }
  return (
    <svg className="eg-glyph" viewBox="0 0 120 24" aria-hidden="true">
      <line className={`eg-line eg-${kind}`} x1="10" y1="12" x2="110" y2="12" />
      <circle className="eg-node" cx="6" cy="12" r="3.5" />
      <circle className={`eg-node ${kind === 'observed' ? 'eg-node-hot' : ''}`} cx="114" cy="12" r="3.5" />
    </svg>
  )
}

// Every edge in the graph is declared, observed, or both. Where the two
// disagree, the delta engine has something to say.
export default function EdgeStates() {
  return (
    <div className="eg">
      <p className="eg-kicker mono">Declared × observed</p>
      <ul className="eg-states">
        {STATES.map((state) => (
          <li className="eg-state" key={state.id}>
            <svg className="eg-edge" viewBox="0 0 240 28" aria-hidden="true">
              <line className={`eg-line eg-${state.id}`} x1="12" y1="14" x2="228" y2="14" />
              {state.id === 'both' ? <circle className="eg-pulse" cx="12" cy="14" r="3" /> : null}
              <circle className="eg-node" cx="7" cy="14" r="4.5" />
              <circle className="eg-node" cx="233" cy="14" r="4.5" />
            </svg>
            <div className="eg-state-text">
              <p className={`eg-name mono ${state.id === 'both' ? 'lime' : ''}`}>{state.name}</p>
              <p className="eg-desc">{state.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="eg-kicker mono eg-kicker-gap">Where they disagree, Axon finds</p>
      <ul className="eg-deltas">
        {DELTAS.map((delta) => (
          <li className="eg-delta" key={delta.name}>
            <EdgeGlyph kind={delta.glyph} />
            <div>
              <h3 className="eg-delta-name">{delta.name}</h3>
              <p className="eg-delta-text">{delta.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
