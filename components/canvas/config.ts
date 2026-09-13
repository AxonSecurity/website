export const FIELD_CONFIG = {
  COUNT: 26,
  SEED: 20260824,
  SIZE_MIN: 7,
  SIZE_MAX: 17,
  ALPHA_MIN: 0.05,
  ALPHA_MAX: 0.13,
  SPEED_MIN: 4,
  SPEED_MAX: 11,
  SPIN_MAX: 0.04,
  LIME_RATIO: 0.35,
  PARALLAX_MAX: 14,
  POINTER_HALF_LIFE_MS: 400,
  DPR_CAP: 2,
} as const

export const LOOP_STAGES = [
  {
    id: 'now',
    word: 'NOW',
    num: '01',
    title: 'Discover and graph',
    text: 'Your AI stack as one interactive graph, with first declared-state findings.',
    keywords: ['INTERACTIVE GRAPH', 'DECLARED STATE'],
  },
  {
    id: 'next',
    word: 'NEXT',
    num: '02',
    title: 'Real-time protection',
    text: 'Sensors record what agents actually do against what they were allowed to do. Capability breach, dormant agency, and shadow paths surface as deltas \u2014 report-first, enforceable after.',
    keywords: ['REAL-TIME DELTAS', 'REPORT-FIRST'],
  },
  {
    id: 'thereafter',
    word: 'THEREAFTER',
    num: '03',
    title: 'Posture and governance',
    text: 'Risk scoring and prioritization, framework-mapped reporting, and evidence exports built for compliance record-keeping.',
    keywords: ['RISK SCORING', 'EVIDENCE EXPORTS'],
  },
] as const
