import { mulberry32 } from '@/lib/animation'

// The fourteen node types of the Axon graph (AXON-SYSTEM.md §3), each with a
// 24×24 line glyph. The same path strings feed the canvas (Path2D) and the
// SVG legend, so the two can never drift apart.

export type NodeKind =
  | 'agent'
  | 'model'
  | 'identity'
  | 'human'
  | 'tool'
  | 'mcp'
  | 'skill'
  | 'memory'
  | 'context'
  | 'datastore'
  | 'runtime'
  | 'framework'
  | 'endpoint'
  | 'finding'

export interface KindSpec {
  kind: NodeKind
  label: string
  path: string
  /** Filled glyphs (finding) are painted, not stroked. */
  filled?: boolean
}

export const KINDS: KindSpec[] = [
  { kind: 'agent', label: 'Agent', path: 'M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0Z M14.6 12a2.6 2.6 0 1 1-5.2 0a2.6 2.6 0 1 1 5.2 0Z' },
  { kind: 'model', label: 'Model', path: 'M12 3.5L19.4 7.75V16.25L12 20.5L4.6 16.25V7.75Z M12 3.5V12 M4.6 16.25L12 12L19.4 16.25' },
  { kind: 'identity', label: 'Identity', path: 'M12 3.5L20.5 12L12 20.5L3.5 12Z M9 12H15' },
  { kind: 'human', label: 'Human', path: 'M14.8 7.8a2.8 2.8 0 1 1-5.6 0a2.8 2.8 0 1 1 5.6 0Z M5.5 20C5.5 15.6 8.4 13.4 12 13.4C15.6 13.4 18.5 15.6 18.5 20' },
  { kind: 'tool', label: 'Tool', path: 'M5 5H19V19H5Z M9 12H15' },
  { kind: 'mcp', label: 'MCP server', path: 'M4.5 5H19.5V10.5H4.5Z M4.5 13.5H19.5V19H4.5Z M7.5 7.75H9 M7.5 16.25H9' },
  { kind: 'skill', label: 'Skill', path: 'M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z' },
  { kind: 'memory', label: 'Memory', path: 'M7 7H17V17H7Z M10 4V7 M14 4V7 M10 17V20 M14 17V20 M4 10H7 M4 14H7 M17 10H20 M17 14H20' },
  { kind: 'context', label: 'Context source', path: 'M6.5 3.5H14L18 7.5V20.5H6.5Z M14 3.5V7.5H18 M9.5 12H15 M9.5 15.5H15' },
  { kind: 'datastore', label: 'Data store', path: 'M5 6.5C5 4.5 19 4.5 19 6.5C19 8.5 5 8.5 5 6.5Z M5 6.5V17.5C5 19.5 19 19.5 19 17.5V6.5 M5 12C5 14 19 14 19 12' },
  { kind: 'runtime', label: 'Runtime', path: 'M4 7.5L12 3.5L20 7.5V16.5L12 20.5L4 16.5Z M4 7.5L12 11.5L20 7.5 M12 11.5V20.5' },
  { kind: 'framework', label: 'Framework', path: 'M4.5 4.5H19.5V19.5H4.5Z M12 4.5V19.5 M4.5 12H19.5' },
  { kind: 'endpoint', label: 'Endpoint', path: 'M20 12a8 8 0 1 1-16 0a8 8 0 1 1 16 0Z M4 12H20 M12 4C8.6 8 8.6 16 12 20 M12 4C15.4 8 15.4 16 12 20' },
  { kind: 'finding', label: 'Finding', path: 'M12 3.5L20.5 19.5H3.5Z', filled: true },
]

export const KIND_BY_ID: Record<NodeKind, KindSpec> = Object.fromEntries(
  KINDS.map((spec) => [spec.kind, spec]),
) as Record<NodeKind, KindSpec>

export type EdgeMode = 'declared' | 'observed' | 'both' | 'finding'

export interface EstateNode {
  id: number
  kind: NodeKind
  x: number
  y: number
  hub: boolean
  name: string
  phase: number
}

export interface EstateEdge {
  a: number
  b: number
  mode: EdgeMode
  seed: number
}

export interface Estate {
  nodes: EstateNode[]
  edges: EstateEdge[]
}

const AGENT_NAMES = [
  'claude-code@dev-07',
  'cursor@ana-mbp',
  'refund-triage',
  'support-crew',
  'codex@ci-runner',
  'billing-graph',
  'adk-concierge',
  'n8n:lead-router',
  'roo@ops-02',
  'copilot@web-11',
]

const SATELLITE_POOL: NodeKind[] = [
  'model',
  'identity',
  'tool',
  'mcp',
  'tool',
  'datastore',
  'skill',
  'memory',
  'context',
  'runtime',
  'framework',
  'endpoint',
  'human',
  'tool',
  'identity',
  'mcp',
]

export const SOURCES = [
  '~/.claude/settings.json',
  '.cursor/mcp.json',
  'repos/refunds/graph.py',
  '~/.codex/config.toml',
  'crew/agents.yaml',
  '.vscode/mcp.json',
  'workflows/lead-router.json',
  'adk/concierge/agent.py',
  'uv.lock',
  'CODEOWNERS',
]

function pickMode(random: () => number): EdgeMode {
  const roll = random()
  if (roll < 0.52) return 'declared'
  if (roll < 0.74) return 'observed'
  return 'both'
}

/**
 * Builds a plausible agent estate: `clusters` agent hubs spread left→right
 * (the beam's travel axis), satellites orbiting each, cross-cluster
 * delegations and grants, plus a few findings implicating risky paths.
 * Positions are normalised 0–1; `aspect` (w/h) keeps spacing even.
 */
export function buildEstate(count: number, aspect: number, seed = 20260930): Estate {
  const random = mulberry32(seed)
  const clusters = count >= 70 ? 9 : 5
  const findingCount = count >= 70 ? 6 : 3
  const satellitesTotal = count - clusters - findingCount
  const nodes: EstateNode[] = []
  const edges: EstateEdge[] = []
  const members: number[][] = []

  const push = (kind: NodeKind, x: number, y: number, hub: boolean, name: string) => {
    nodes.push({ id: nodes.length, kind, x, y, hub, name, phase: random() * Math.PI * 2 })
    return nodes.length - 1
  }

  for (let c = 0; c < clusters; c += 1) {
    const cx = 0.07 + ((c + 0.5) / clusters) * 0.86 + (random() - 0.5) * (0.3 / clusters)
    const spread = aspect < 1 ? 0.5 : 0.28
    const cy = 0.5 + (c % 2 === 0 ? -spread / 2 : spread / 2) + (random() - 0.5) * 0.14
    const hub = push('agent', cx, cy, true, AGENT_NAMES[c % AGENT_NAMES.length])
    members.push([hub])
  }

  for (let s = 0; s < satellitesTotal; s += 1) {
    const c = s % clusters
    const hub = nodes[members[c][0]]
    const kind = SATELLITE_POOL[Math.floor(random() * SATELLITE_POOL.length)]
    const angle = random() * Math.PI * 2
    const radius = 0.1 + random() * 0.16
    // Measure orbits against the shorter side so narrow stages don't spill.
    const unit = Math.min(1, aspect)
    const id = push(
      kind,
      hub.x + (Math.cos(angle) * radius * unit) / aspect,
      hub.y + Math.sin(angle) * radius * unit,
      false,
      KIND_BY_ID[kind].label,
    )
    members[c].push(id)
  }

  for (let f = 0; f < findingCount; f += 1) {
    const c = Math.floor(((f + 0.5) / findingCount) * clusters)
    const hub = nodes[members[c][0]]
    const id = push('finding', hub.x + (random() - 0.5) * 0.08, hub.y + (random() < 0.5 ? -0.2 : 0.2), false, 'Finding')
    members[c].push(id)
  }

  relax(nodes, aspect, count >= 70 ? 0.088 : 0.1 * Math.min(1, aspect) + 0.02)

  // Hub → satellite edges, with the typed relationships the collectors emit.
  members.forEach((group, c) => {
    const hub = group[0]
    group.slice(1).forEach((id) => {
      const node = nodes[id]
      if (node.kind === 'finding') {
        edges.push({ a: id, b: hub, mode: 'finding', seed: random() })
        const other = group[1 + Math.floor(random() * (group.length - 2))]
        if (other !== undefined && other !== id) edges.push({ a: id, b: other, mode: 'finding', seed: random() })
        return
      }
      edges.push({ a: hub, b: id, mode: pickMode(random), seed: random() })
    })
    // MCP servers expose tools inside the same cluster.
    const mcp = group.find((id) => nodes[id].kind === 'mcp')
    const tool = group.find((id) => nodes[id].kind === 'tool')
    if (mcp !== undefined && tool !== undefined) edges.push({ a: mcp, b: tool, mode: 'declared', seed: random() })
    // Delegation to the next agent, and a borrowed identity reaching its store.
    if (c < clusters - 1) {
      edges.push({ a: hub, b: members[c + 1][0], mode: random() < 0.5 ? 'observed' : 'both', seed: random() })
      const identity = group.find((id) => nodes[id].kind === 'identity')
      const store = members[c + 1].find((id) => nodes[id].kind === 'datastore')
      if (identity !== undefined && store !== undefined) edges.push({ a: identity, b: store, mode: 'declared', seed: random() })
    }
  })

  return { nodes, edges }
}

/** Pairwise repulsion so glyphs and labels never pile up. */
function relax(nodes: EstateNode[], aspect: number, minDistance: number) {
  const padX = 0.035
  const padY = 0.1
  for (let iteration = 0; iteration < 160; iteration += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = (b.x - a.x) * aspect
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy) || 0.0001
        if (distance >= minDistance) continue
        const push = (minDistance - distance) * 0.5
        const ux = dx / distance
        const uy = dy / distance
        const weightA = a.hub ? 0.2 : 1
        const weightB = b.hub ? 0.2 : 1
        a.x -= (ux * push * weightA) / aspect
        a.y -= uy * push * weightA
        b.x += (ux * push * weightB) / aspect
        b.y += uy * push * weightB
      }
    }
    for (const node of nodes) {
      node.x = Math.min(1 - padX, Math.max(padX, node.x))
      node.y = Math.min(1 - padY, Math.max(padY, node.y))
    }
  }
}
