/**
 * ParticleOrb tuning surface.
 * The hero orb is a fibonacci-lattice particle sphere, orthographically
 * projected, depth-shaded. All knobs live here.
 *
 * Anti-crop invariant (enforced in fit()):
 *   radius = (min(w,h)/2 - PARALLAX_MAX - SHIMMER_AMP - 2) / (1 + BREATH_AMPLITUDE)
 * Rotation preserves the radius, therefore no dot can ever cross the
 * canvas edge — cropping is impossible by construction.
 */
export const ORB_CONFIG = {
  /** Surface dots. */
  COUNT: 900,
  SEED: 20260823,

  /** Motion. */
  AUTO_ROT_Y: 0.12,
  BASE_TILT_X: 0.26,
  WOBBLE_AMP: 0.05,
  WOBBLE_SPEED: 0.35,
  BREATH_AMPLITUDE: 0.015,
  BREATH_SPEED: 0.4,
  SHIMMER_AMP: 1.6,
  SHIMMER_SPEED: 0.9,

  /** Pointer response. */
  POINTER_TILT: 0.15,
  POINTER_HALF_LIFE_MS: 300,
  PARALLAX_MAX: 18,

  /** Dots. */
  DOT_SIZE_MIN: 0.9,
  DOT_SIZE_MAX: 2.2,
  SIZE_JITTER: 0.35,

  /** Depth shading. */
  DEPTH_BANDS: 8,
  ALPHA_BACK: 0.1,
  ALPHA_FRONT: 0.92,

  /** Soft halo pass under every dot. */
  HALO_SIZE_MULT: 3.0,
  HALO_ALPHA: 0.2,

  /** Silhouette rim light. */
  RIM_INNER: 0.9,
  RIM_BOOST_ALPHA: 0.35,
  RIM_COLOR: '#E7F336',

  /** Palette order matches COLOR_WEIGHTS. */
  PALETTE: ['#89F336', '#C8F336', '#A8F336'],
  COLOR_WEIGHTS: [0.56, 0.27, 0.17],

  DPR_CAP: 2,
} as const

/**
 * AmbientField tuning surface (page-wide triangle field).
 * Untouched by the orb reiteration; kept verbatim from the
 * visibility-tuning pass.
 */
export const AMBIENT_CONFIG = {
  COUNT: 34,
  SIZE_MIN: 42,
  SIZE_MAX: 190,
  ALPHA_MIN: 0.06,
  ALPHA_MAX: 0.14,
  /** Upward drift speed, px/s. */
  SPEED_MIN: 5,
  SPEED_MAX: 14,
  SPIN_MAX: 0.05,
  SWAY_AMP: 14,
  PARALLAX_MAX: 22,
  POINTER_HALF_LIFE_MS: 400,
  DPR_CAP: 2,
  SEED: 20260823,
  COLORS: ['#89F336', '#C8F336', '#A8F336', '#9A9A9A'],
  COLOR_WEIGHTS: [0.35, 0.22, 0.22, 0.21],
} as const
