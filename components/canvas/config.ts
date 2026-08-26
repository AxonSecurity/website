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
    id: 'discover',
    word: 'DISCOVER',
    num: '01',
    title: 'Discover every model you run',
    text: 'Axon sweeps your cloud, code, and contracts to inventory every AI system your teams build, buy, or quietly ship.',
  },
  {
    id: 'understand',
    word: 'UNDERSTAND',
    num: '02',
    title: 'Trace risk to its source',
    text: 'Data, permissions, prompts, and vendors resolve into one continuously updated picture of exposure.',
  },
  {
    id: 'govern',
    word: 'GOVERN',
    num: '03',
    title: 'Enforce policy once',
    text: 'Guardrails encode your standards and enforce them everywhere models appear — before incidents do.',
  },
  {
    id: 'act',
    word: 'ACT',
    num: '04',
    title: 'Fix what matters first',
    text: 'Prioritized findings route straight to owners. Exposure drops. Audit evidence writes itself.',
  },
] as const
