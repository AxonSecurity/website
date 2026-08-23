/**
 * ParticleConstellation tuning surface.
 * Every physics/visual knob for the hero brain lives here.
 */
export const CANVAS_CONFIG = {
  /** Total outlined triangles forming the constellation. */
  PARTICLE_COUNT: 3200,
  TRIANGLE_SIZE_MIN: 1.4,
  TRIANGLE_SIZE_MAX: 3.8,

  /** Ambient drift. */
  DRIFT_AMPLITUDE: 3.4,
  DRIFT_SPEED: 0.9,

  /** Per-particle triangle spin (rad/s). */
  SPIN_SPEED: 0.4,
  /** Whole-constellation rotation (rad/s). */
  CONSTELLATION_ROTATION: 0.015,

  /** Cursor physics. */
  REACTION_RADIUS: 150,
  REACTION_PUSH: 30,
  POINTER_HALF_LIFE_MS: 70,
  EXCITATION_THRESHOLD: 0.3,

  /** Silhouette mapping. */
  BRAIN_SCALE: 1.58,

  /** Geometry sampler inputs. */
  FISSURE_WIDTH: 0.038,
  FOLD_INTENSITY: 0.45,
  CONTOUR_RATIO: 0.3,
  SEED: 20260823,

  /** Render style. Palette order matches COLOR_WEIGHTS / BASE_ALPHA. */
  LINE_WIDTH: 1,
  EXCITED_LINE_WIDTH: 1.5,
  PALETTE: ['#89F336', '#C8F336', '#A8F336'],
  EXCITED_COLOR: '#E7F336',
  COLOR_WEIGHTS: [0.56, 0.27, 0.17],
  BASE_ALPHA: [0.9, 0.62, 0.4],

  DPR_CAP: 2,
} as const
