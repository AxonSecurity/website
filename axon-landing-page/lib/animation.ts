export type Prng = () => number

export function mulberry32(seed: number): Prng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothing(halfLifeMs: number, dtMs: number): number {
  return 1 - Math.pow(2, -dtMs / Math.max(halfLifeMs, 1))
}

export function easeOutCubic(t: number): number {
  const x = clamp(t, 0, 1)
  return 1 - Math.pow(1 - x, 3)
}

export function easeInOutExpo(t: number): number {
  const x = clamp(t, 0, 1)
  if (x <= 0) return 0
  if (x >= 1) return 1
  return x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2
}

/** Docking slots (degrees): top, lower-right, lower-left. */
export const ORBIT_FINALS = [-90, 30, 150]

/**
 * Pure choreography for the capability orbit.
 *
 * Timeline: cards enter staggered from a bottom-of-orbit cluster, then the
 * ring performs exactly one clockwise revolution (+360deg) while fanning
 * open to the 120deg-spaced docking slots. At p >= TURN_END every angle is
 * bit-exact on its slot (mod 360).
 */
const CLUSTER_DEG = 90
const CLUSTER_JITTER = [-8, 8, 0]
const ENTRANCE_START = [0.02, 0.105, 0.19]
const ENTRANCE_DURATION = 0.13
const TURN_START = 0.3
const TURN_END = 0.85

function wrap180(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

export interface OrbitCardState {
  angleDeg: number
  /** 0 hidden -> 1 fully entered. */
  entrance: number
}

export function orbitState(p: number, finals: number[] = ORBIT_FINALS): OrbitCardState[] {
  const turnT = easeInOutExpo((p - TURN_START) / (TURN_END - TURN_START))
  return finals.map((finalDeg, i) => {
    const entryDeg = CLUSTER_DEG + CLUSTER_JITTER[i % CLUSTER_JITTER.length]
    const spread = wrap180(finalDeg - entryDeg)
    const angleDeg =
      entryDeg +
      spread * turnT + // fan open to slot
      360 * turnT // the single revolution
    const localP = (p - ENTRANCE_START[i]) / ENTRANCE_DURATION
    return { angleDeg, entrance: easeOutCubic(localP) }
  })
}
