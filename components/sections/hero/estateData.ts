import { mulberry32 } from '@/lib/animation'

// A deterministic, plausible AI estate: agent hubs with their models,
// identities, tools, MCP servers and stores, cross-wired the way real
// estates are (shared credentials, shared servers, delegation chains).

export const NODE_TYPES = ['agent', 'mcp', 'store', 'identity', 'model', 'tool'] as const
export type NodeType = (typeof NODE_TYPES)[number]

export const TYPE_LABEL: Record<NodeType, string> = {
  agent: 'Agent',
  mcp: 'MCP server',
  store: 'Data store',
  identity: 'Identity',
  model: 'Model',
  tool: 'Tool',
}

export interface EstateNode {
  index: number
  type: NodeType
  name: string
  position: [number, number, number]
  scatter: [number, number, number]
  delay: number
  seed: number
  size: number
}

export interface EstateEdge {
  from: number
  to: number
  delay: number
}

export interface Estate {
  nodes: EstateNode[]
  edges: EstateEdge[]
  /** outgoing adjacency (directed: who can reach what) */
  out: number[][]
  /** incoming adjacency */
  into: number[][]
  hubs: number[]
}

const AGENTS = [
  'claude-code@build-01',
  'support-triage',
  'langgraph:refunds',
  'cursor@eng-laptop-14',
  'crewai:research',
  'codex-cli@ci-runner',
  'adk:billing-assistant',
  'openai-agents:onboarding',
  'n8n:lead-router',
  'pydantic-ai:contracts',
  'gemini-cli@data-02',
]
const SUB_AGENTS = ['sub:reviewer', 'sub:planner', 'sub:summarizer', 'sub:sql-writer']
const MODELS = ['model:claude-sonnet', 'model:gpt-5', 'model:gemini-pro']
const IDENTITIES = [
  'sa:billing-bot',
  'gh-app:axon-ci',
  'aws-role:agent-exec',
  'oauth:gworkspace',
  'key:stripe-restricted',
  'sa:etl-runner',
  'token:zendesk',
  'role:crm-sync',
  'key:openai-shared',
  'sa:docs-indexer',
  'pat:ops-oncall',
]
const TOOLS = [
  'read_file',
  'write_file',
  'run_shell',
  'http_fetch',
  'send_email',
  'query_sql',
  'create_ticket',
  'refund_payment',
  'search_docs',
  'git_push',
  'slack_post',
  'browser_open',
  'update_crm',
  'export_csv',
  'schedule_job',
  'delete_record',
]
const LOCAL_MCP = ['mcp:postgres', 'mcp:filesystem', 'mcp:jira', 'mcp:stripe', 'mcp:gdrive', 'mcp:linear', 'mcp:notion']
const STORES = [
  'orders-db',
  'warehouse:finance',
  's3:contracts',
  'vector:support-kb',
  'memory:session-cache',
  'crm:salesforce',
  'bucket:ml-artifacts',
  'memory:agent-notes',
  'ledger:payments',
  'tickets:zendesk',
  'docs:handbook',
]

type Vec3 = [number, number, number]

export function buildEstate(clusterCount = 10, seed = 20260930): Estate {
  const random = mulberry32(seed)
  const range = (min: number, max: number) => min + random() * (max - min)
  const pick = <T,>(list: readonly T[], i: number) => list[i % list.length]

  const nodes: EstateNode[] = []
  const edges: EstateEdge[] = []
  const hubs: number[] = []

  const unit = (): Vec3 => {
    const u = range(-1, 1)
    const theta = range(0, Math.PI * 2)
    const s = Math.sqrt(1 - u * u)
    return [s * Math.cos(theta), u, s * Math.sin(theta)]
  }

  const scatterFor = (): Vec3 => {
    const [x, y, z] = unit()
    const r = range(7, 13)
    return [x * r * 1.4, y * r, z * r]
  }

  const add = (type: NodeType, name: string, position: Vec3, delay: number, size: number) => {
    const index = nodes.length
    nodes.push({
      index,
      type,
      name,
      position,
      scatter: scatterFor(),
      delay: Math.min(1, Math.max(0, delay)),
      seed: random(),
      size,
    })
    return index
  }

  const link = (from: number, to: number) => {
    if (from === to) return
    if (edges.some((e) => e.from === from && e.to === to)) return
    const delay = Math.max(nodes[from].delay, nodes[to].delay)
    edges.push({ from, to, delay: Math.min(1, delay + random() * 0.15) })
  }

  const near = (origin: Vec3, rMin: number, rMax: number, flatten = 0.8): Vec3 => {
    const [x, y, z] = unit()
    const r = range(rMin, rMax)
    return [origin[0] + x * r, origin[1] + y * r * flatten, origin[2] + z * r]
  }

  // Shared models sit near the core: every agent depends on one of them.
  const models = MODELS.map((name, i) => {
    const angle = (i / MODELS.length) * Math.PI * 2 + 0.4
    return add('model', name, [Math.cos(angle) * 0.7, Math.sin(angle) * 0.35, Math.sin(angle) * 0.5], 0.02, 1.25)
  })

  // Cluster centres on a golden-angle ellipsoid, wide and shallow for a wide frame.
  const centres: Vec3[] = []
  for (let i = 0; i < clusterCount; i += 1) {
    const t = (i + 0.5) / clusterCount
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = i * Math.PI * (3 - Math.sqrt(5))
    const r = range(2.6, 3.4)
    centres.push([
      Math.sin(inclination) * Math.cos(azimuth) * r * 1.45,
      Math.cos(inclination) * r * 0.62,
      Math.sin(inclination) * Math.sin(azimuth) * r * 0.85,
    ])
  }

  let toolCursor = 0
  let mcpCursor = 0
  const clusterStores: number[] = []
  const clusterIdentities: number[] = []

  centres.forEach((centre, c) => {
    const base = c / clusterCount
    const hub = add('agent', pick(AGENTS, c), centre, base * 0.55, 1.9)
    hubs.push(hub)
    link(hub, models[c % models.length])

    const identity = add('identity', pick(IDENTITIES, c), near(centre, 0.7, 1.0), base * 0.55 + 0.08, 1.15)
    clusterIdentities.push(identity)
    link(hub, identity)

    const store = add(
      'store',
      pick(STORES, c),
      near(centre, 0.8, 1.15),
      base * 0.55 + 0.12,
      1.35,
    )
    clusterStores.push(store)
    link(hub, store)
    link(identity, store)

    const toolCount = 2 + Math.floor(random() * 3)
    for (let t = 0; t < toolCount; t += 1) {
      const tool = add('tool', pick(TOOLS, toolCursor++), near(centre, 0.55, 0.95), base * 0.55 + 0.1 + t * 0.02, 0.85)
      link(hub, tool)
      if (random() < 0.35) link(identity, tool)
    }

    const mcpCount = Math.floor(random() * 3)
    for (let m = 0; m < mcpCount; m += 1) {
      const mcpPos = near(centre, 0.95, 1.35)
      const mcp = add('mcp', pick(LOCAL_MCP, mcpCursor++), mcpPos, base * 0.55 + 0.15, 1.4)
      link(hub, mcp)
      const exposed = 2 + Math.floor(random() * 2)
      for (let e = 0; e < exposed; e += 1) {
        const tool = add('tool', pick(TOOLS, toolCursor++), near(mcpPos, 0.3, 0.55), base * 0.55 + 0.2 + e * 0.02, 0.75)
        link(mcp, tool)
      }
    }

    if (random() < 0.4) {
      const sub = add('agent', pick(SUB_AGENTS, c), near(centre, 0.9, 1.25), base * 0.55 + 0.18, 1.35)
      link(hub, sub)
      link(sub, models[(c + 1) % models.length])
      link(sub, store)
    }
  })

  const centroid = (indices: number[], lift = 1.2): Vec3 => {
    const sum: Vec3 = [0, 0, 0]
    for (const i of indices) {
      sum[0] += nodes[i].position[0]
      sum[1] += nodes[i].position[1]
      sum[2] += nodes[i].position[2]
    }
    return [(sum[0] / indices.length) * lift, (sum[1] / indices.length) * lift + range(-0.3, 0.3), (sum[2] / indices.length) * lift]
  }

  // Shared infrastructure: the paths that make blast radius interesting.
  const sharedGithub = add('mcp', 'mcp:github', centroid([hubs[0], hubs[3], hubs[5]], 0.75), 0.35, 1.55)
  ;[hubs[0], hubs[3], hubs[5]].forEach((h) => link(h, sharedGithub))
  ;['git_push', 'create_pr', 'read_repo'].forEach((name, i) => {
    const tool = add('tool', name, near(nodes[sharedGithub].position, 0.3, 0.5), 0.4 + i * 0.02, 0.8)
    link(sharedGithub, tool)
  })

  const sharedSlack = add('mcp', 'mcp:slack', centroid([hubs[1], hubs[4], hubs[8 % hubs.length]], 0.8), 0.4, 1.5)
  ;[hubs[1], hubs[4], hubs[8 % hubs.length]].forEach((h) => link(h, sharedSlack))
  const slackTool = add('tool', 'slack_post', near(nodes[sharedSlack].position, 0.3, 0.5), 0.45, 0.8)
  link(sharedSlack, slackTool)

  const deploy = add('identity', 'svc-deploy', centroid([hubs[0], hubs[5], hubs[2]], 0.7), 0.38, 1.3)
  ;[hubs[0], hubs[5], hubs[2]].forEach((h) => link(h, deploy))
  link(deploy, clusterStores[2 % clusterStores.length])
  link(deploy, sharedGithub)

  const borrowed = add('identity', 'pat:jdoe', centroid([hubs[3], hubs[6 % hubs.length]], 0.85), 0.42, 1.2)
  ;[hubs[3], hubs[6 % hubs.length]].forEach((h) => link(h, borrowed))
  link(borrowed, clusterStores[6 % clusterStores.length])

  const pii = add('store', 'customers-pii', centroid([hubs[1], hubs[2], hubs[6 % hubs.length], hubs[7 % hubs.length]], 0.55), 0.45, 1.55)
  ;[hubs[1], hubs[2], hubs[7 % hubs.length]].forEach((h) => link(h, pii))
  link(clusterIdentities[1], pii)

  // Delegation chains between hubs.
  const delegations: [number, number][] = [
    [1, 2],
    [2, 6],
    [4, 1],
    [8, 1],
    [9, 7],
    [5, 0],
  ]
  for (const [a, b] of delegations) {
    if (hubs[a] !== undefined && hubs[b] !== undefined) link(hubs[a], hubs[b])
  }

  const out: number[][] = nodes.map(() => [])
  const into: number[][] = nodes.map(() => [])
  for (const edge of edges) {
    out[edge.from].push(edge.to)
    into[edge.to].push(edge.from)
  }

  return { nodes, edges, out, into, hubs }
}

export interface Reach {
  root: number
  depth: Map<number, number>
  direction: 'out' | 'in'
}

/** Directed blast radius (what it can reach); leaves report who reaches them. */
export function traceReach(estate: Estate, root: number, maxDepth = 2): Reach {
  const direction = estate.out[root].length > 0 ? 'out' : 'in'
  const adjacency = direction === 'out' ? estate.out : estate.into
  const limit = direction === 'out' ? maxDepth : 2
  const depth = new Map<number, number>([[root, 0]])
  let frontier = [root]
  for (let d = 1; d <= limit && frontier.length; d += 1) {
    const next: number[] = []
    for (const node of frontier) {
      for (const neighbour of adjacency[node]) {
        // Models don't propagate reach: sharing a model isn't sharing access.
        if (depth.has(neighbour)) continue
        depth.set(neighbour, d)
        if (estate.nodes[neighbour].type !== 'model') next.push(neighbour)
      }
    }
    frontier = next
  }
  return { root, depth, direction }
}
