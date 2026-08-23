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

/**
 * Constellation v2 layers: depth planes, breathing, synaptic signal pulses.
 */
export const CONSTELLATION_V2 = {
  /** Back-to-front depth planes. */
  DEPTH_PLANES: [
    { SCALE: 0.84, ALPHA: 0.5, ROT: 0.75, DRIFT: 0.65, PARALLAX: 10 },
    { SCALE: 1.0, ALPHA: 0.78, ROT: 1.0, DRIFT: 1.0, PARALLAX: 18 },
    { SCALE: 1.14, ALPHA: 1.0, ROT: 1.25, DRIFT: 1.25, PARALLAX: 28 },
  ],
  BREATHING: { AMPLITUDE: 0.018, ANGULAR_SPEED: 0.5 },
  SIGNALS: {
    /** Every Nth particle is a signal hub. */
    NODE_STRIDE: 6,
    /** Nearest-hub edges per hub. */
    NEIGHBORS: 3,
    MAX_ACTIVE: 7,
    SPAWN_EVERY_MS: 380,
    TRAVEL_MS_MIN: 650,
    TRAVEL_MS_MAX: 1400,
    DOT_RADIUS: 2.1,
    COMET_SEGMENTS: 6,
    SEGMENT_GAP_MS: 46,
    FLASH_MS: 620,
    FLASH_RADIUS: 3.4,
    GLOW_BLUR: 9,
  },
} as const

/**
 * AmbientField tuning surface: sparse outlined triangles drifting across
 * the whole page behind all content.
 */
export const AMBIENT_CONFIG = {
  COUNT: 26,
  SIZE_MIN: 42,
  SIZE_MAX: 150,
  ALPHA_MIN: 0.035,
  ALPHA_MAX: 0.09,
  /** Upward drift speed, px/s. */
  SPEED_MIN: 4,
  SPEED_MAX: 12,
  SPIN_MAX: 0.05,
  SWAY_AMP: 14,
  PARALLAX_MAX: 22,
  POINTER_HALF_LIFE_MS: 400,
  DPR_CAP: 2,
  SEED: 20260823,
  COLORS: ['#89F336', '#C8F336', '#A8F336', '#9A9A9A'],
  COLOR_WEIGHTS: [0.35, 0.22, 0.22, 0.21],
} as const
