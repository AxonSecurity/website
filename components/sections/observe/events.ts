import { mulberry32 } from '@/lib/animation'

export type Edge = 'invoked' | 'reads_from' | 'writes_to' | 'delegates_to'
export type Outcome = 'ok' | 'error' | 'timeout'

export interface StreamEvent {
  agent: string
  edge: Edge
  target: string
  duration: string
  outcome: Outcome
}

const AGENTS = ['7f3a9c1e', 'b20e44d1', '5c91ff07', 'e0d7a23b', '91ac5e6f', '3d4b8c02']

const TARGETS: Record<Edge, readonly string[]> = {
  invoked: [
    'tool:crm.search',
    'mcp:github',
    'tool:shell.exec',
    'mcp:jira',
    'tool:slack.post',
    'tool:browser.fetch',
    'tool:payments.refund',
  ],
  reads_from: ['store:billing-db', 'store:customers', 'memory:vector-kb', 'ctx:wiki', 'store:reports'],
  writes_to: ['store:tickets', 'memory:session', 'store:warehouse'],
  delegates_to: ['agent:triage', 'agent:researcher', 'agent:coder', 'agent:reviewer'],
}

const DURATION: Record<Edge, readonly [number, number]> = {
  invoked: [40, 480],
  reads_from: [5, 140],
  writes_to: [10, 200],
  delegates_to: [300, 2400],
}

function pickEdge(roll: number): Edge {
  if (roll < 0.45) return 'invoked'
  if (roll < 0.73) return 'reads_from'
  if (roll < 0.88) return 'writes_to'
  return 'delegates_to'
}

function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

/** Deterministic metadata-only event source: same seed, same stream. */
export function createEventSource(seed: number): () => StreamEvent {
  const random = mulberry32(seed)
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(random() * list.length)]

  return () => {
    const edge = pickEdge(random())
    const [min, max] = DURATION[edge]
    const outcomeRoll = random()
    return {
      agent: pick(AGENTS),
      edge,
      target: pick(TARGETS[edge]),
      duration: formatDuration(min + random() * (max - min)),
      outcome: outcomeRoll < 0.92 ? 'ok' : outcomeRoll < 0.98 ? 'error' : 'timeout',
    }
  }
}

export function formatClock(ms: number): string {
  const date = new Date(ms)
  const pad = (value: number, size = 2) => String(value).padStart(size, '0')
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${pad(date.getUTCMilliseconds(), 3)}`
}
