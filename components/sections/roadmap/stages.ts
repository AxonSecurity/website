export interface RoadmapStage {
  id: string
  word: string
  when: string
  title: string
  text: string
  keywords: string[]
  /** Panel width on the horizontal track, sized for the word at full width axis. */
  width: string
}

export const STAGES: RoadmapStage[] = [
  {
    id: 'now',
    word: 'NOW',
    when: 'Today',
    title: 'Discover. Observe. Judge.',
    text: 'The whole agent estate as one graph, what agents actually do beside what they were allowed to do, and findings grounded in public frameworks. Report-first.',
    keywords: ['Security graph', 'Sensor', 'Findings', 'AI-BOM'],
    width: '64vw',
  },
  {
    id: 'next',
    word: 'NEXT',
    when: 'Next phase',
    title: 'Enforce.',
    text: 'Real-time blocking at the MCP gateway, in-process vetoes and coding-agent hooks — every component was built so the switch is a policy change. Cloud-hosted agents join the graph.',
    keywords: ['Real-time blocking', 'Policy guardrails', 'Cloud agents'],
    width: '66vw',
  },
  {
    id: 'thereafter',
    word: 'THEREAFTER',
    when: 'After that',
    title: 'Posture and governance.',
    text: 'Risk scoring and prioritization, framework-mapped reporting, and evidence exports built for compliance record-keeping.',
    keywords: ['Risk scoring', 'Framework mapping', 'Evidence exports'],
    width: '96vw',
  },
]
