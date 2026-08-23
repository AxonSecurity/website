import { clamp, mulberry32 } from './animation'

export interface BrainPoint {
  x: number
  y: number
}

export interface BrainPointOptions {
  count: number
  seed: number
  fissureWidth?: number
  foldIntensity?: number
  contourRatio?: number
}

const HEMI_CENTER_X = 0.165
const HEMI_RADIUS_X = 0.18
const HEMI_RADIUS_Y = 0.37

const LOBE_WAVES = [
  { freq: 4, amp: 0.1, phase: 0.7 },
  { freq: 6, amp: 0.06, phase: 2.3 },
  { freq: 9, amp: 0.035, phase: 4.1 },
]

const FRONT_TAPER = 0.12

const EXTENT_X = 0.42
const EXTENT_Y = 0.4

/** Spatial frequencies of the fold striations. */
const FOLD_SCALE = { x: 34, y: 30, diag: 19 }

const MAX_ATTEMPTS_FACTOR = 200

function lobeBump(theta: number, sign: number): number {
  let bump = 1
  for (const wave of LOBE_WAVES) {
    bump += wave.amp * Math.sin(theta * wave.freq + sign * wave.phase)
  }
  return bump
}

function frontTaper(y: number): number {
  return 1 - FRONT_TAPER * Math.max(0, -y / HEMI_RADIUS_Y) ** 2
}

function insideLobe(x: number, y: number, sign: number): boolean {
  const lx = x - sign * HEMI_CENTER_X
  const theta = Math.atan2(y, lx)
  const limit =
    lobeBump(theta, sign) *
    frontTaper(y)
  const rn = Math.sqrt((lx / HEMI_RADIUS_X) ** 2 + (y / HEMI_RADIUS_Y) ** 2)
  return rn <= limit
}

function fissureGap(y: number, width: number): number {
  const t = clamp(y / (HEMI_RADIUS_Y * 1.15), -1, 1)
  return width * Math.sqrt(1 - t * t)
}

/**
 * Samples `count` points forming an organic top-down brain:
 * two perturbed hemisphere lobes split by a tapered central fissure,
 * with sine-field gyri striations. Deterministic for a given seed.
 */
export function generateBrainPoints(options: BrainPointOptions): BrainPoint[] {
  const { count, seed } = options
  const fissureWidth = options.fissureWidth ?? 0.04
  const foldIntensity = clamp(options.foldIntensity ?? 0.4, 0, 1)
  const contourRatio = clamp(options.contourRatio ?? 0.3, 0, 0.8)

  const rand = mulberry32(seed)
  const points: BrainPoint[] = []
  const contourCount = Math.round(count * contourRatio)
  let attempts = 0
  const maxAttempts = count * MAX_ATTEMPTS_FACTOR

  const fits = (x: number, y: number): boolean =>
    Math.abs(x) > fissureGap(y, fissureWidth) &&
    (insideLobe(x, y, 1) || insideLobe(x, y, -1))

  const foldGate = (x: number, y: number): number => {
    if (foldIntensity <= 0) return 1
    const n =
      Math.sin(x * FOLD_SCALE.x + 1.7) *
      Math.sin(y * FOLD_SCALE.y - 0.6) *
      Math.sin((x - y) * FOLD_SCALE.diag + 2.9)
    return 1 - foldIntensity * (0.5 - 0.5 * n)
  }

  while (points.length < contourCount && attempts < maxAttempts) {
    attempts++
    const sign = rand() < 0.5 ? 1 : -1
    const theta = rand() * Math.PI * 2
    const bump = lobeBump(theta, sign)
    const y0 = Math.sin(theta) * HEMI_RADIUS_Y * bump
    const edge = 0.96 + rand() * 0.07
    const taper = frontTaper(y0)
    const x =
      sign * HEMI_CENTER_X +
      Math.cos(theta) * HEMI_RADIUS_X * bump * taper * edge
    const y = y0 * edge
    if (fits(x, y)) points.push({ x, y })
  }

  while (points.length < count && attempts < maxAttempts) {
    attempts++
    const x = (rand() * 2 - 1) * EXTENT_X
    const y = (rand() * 2 - 1) * EXTENT_Y
    if (fits(x, y) && rand() < foldGate(x, y)) points.push({ x, y })
  }

  return points
}
