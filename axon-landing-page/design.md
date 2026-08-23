# AXON Design System — Contract

Single source of truth for the landing page. Every component and animation must
derive from this document. The palette is **locked**: effects (opacity, glow,
stroke) are the only allowed expression — never new hues.

Sources of DNA:
- **Dala** — void black, 113px/−0.04em/weight-400 display, weight-200 body,
  single pill, triangular brain constellation, ambient particle field across
  the whole page, zigzag rhythm, zero containers.
- **Auros** — abyssal terminal instrument-panel language: oversized kinetic
  text as environmental section markers, luminous accent glow on statistics,
  morphing button, particle-sphere depth, depth-without-shadows.
- **Sentra.io** — enterprise proof structure only (problem → platform →
  proof → CTA). Treatment inspiration; never structural additions.

---

## 1 · Brand Assets

Self-hosted under `public/brand/`. Generated from root-directory originals
(drop zone, untracked) via `sips` — zero new dependencies, CSP untouched.

| Asset | File | Content | Usage |
|---|---|---|---|
| Lockup | `public/brand/axon-lockup.png` | Lime compass-needle A + white AXON wordmark | Nav, Footer |
| Mark | `public/brand/axon-mark.png` | Lime compass-needle A alone | Fallbacks, future surfaces |
| Tile | `public/brand/axon-tile.png` | Lime square tile with black A | Favicons, avatars, social |

### Usage rules
- The mark is a sharp compass needle "A". Never redraw, skew, outline, or
  re-space it. Never substitute the hand-drawn SVG.
- The lockup is always used whole. Never set "AXON" in a system font next to
  the mark.
- Tiles are square crops only. Never round their corners — the sharp square
  against the void is the brand gesture.

### Clearspace & minimums
- Clearspace around any asset = **50% of the mark's height**, on all sides.
- Minimum sizes: lockup height ≥ 20px · standalone mark ≥ 16px · tile ≥ 24px.
- On void (`#000000`) backgrounds use the standard assets as-is; assets are
  keyed for pure-black compositing.

### Do / Don't
- ✅ Lime-on-black, generous clearspace, exact crops.
- ❌ Drop shadows on brand assets, rotation, recoloring, gradients, stretching.

Favicon pipeline: `axon-tile.png` → `icon-dark-32x32.png` (lime tile),
`icon-light-32x32.png` (black tile / lime A), `apple-icon.png` (180px lime
tile), all via `sips -z`.

---

## 2 · Color Tokens — LOCKED

| Token | Value | Role |
|---|---|---|
| `--void` | `#000000` | Page background. The container is the void itself. |
| `--text` | `#ffffff` | Primary text, display headings, nav links hover. |
| `--ghost` | `#9a9a9a` | Secondary text, labels at rest, footer. |
| `--lime` | `#89f336` | Primary accent: eyebrows, pills, CTAs, constellation base, progress hairline. |
| `--lime-hover` | `#e7f336` | Hover state, excited particles, marquee-grade emphasis. |
| `--lime-data` | `#c8f336` | Statistics numerals, secondary data accents. |
| `--lime-ambient` | `#a8f336` | Ambient strokes: node visuals, drifting field. |

Rules:
- Effects derive from these seven values only: opacity, box/text-shadow glow,
  stroke. No tints, no blends that create a new hue, no color-mix.
- Glow ceilings: pill `rgba(137,243,54,.33)` · node dots `.75` · spotlight rows
  `≤ .06` radial tint · count-up completion `.4`.
- Selection: lime background, void text.

---

## 3 · Typography

Engine: Inter via `next/font/google`, variable `--font-inter`, self-hosted by
Next. Body weight **200**, display weight **400**, UI labels weight **600**.

| Style | Size | Weight | Tracking | Leading | Notes |
|---|---|---|---|---|---|
| Display H1 | `clamp(62px, 8.4vw, 113px)` | 400 | −0.04em | 0.92 | Hero only. Word-reveal masked. |
| Display H2 | `clamp(56px, 7vw, 94px)` | 400 | −0.04em | 0.92 | Section statements. |
| Feature H3 | `clamp(30px, 4vw, 56px)` | 400 | −0.04em | 1.0 | Zigzag rows. |
| Step H3 | 34px → 28px @≤760 | 400 | −0.04em | default | Process list. |
| Metric numeral | `clamp(30px, 4vw, 54px)` | 400 | −0.04em | default | `tabular-nums`, `--lime-data`, CountUp-driven. |
| Kinetic marker | `clamp(150px, 21vw, 230px)` | 700 | −0.02em | 1.0 | Outline ghost words behind sections. Stroke-only, α .12. |
| Body | 18px | 200 | normal | 1.55–1.6 | Max-width 500px, `--ghost`. |
| Nav link | 14px | 600 | 0.03em | — | Uppercase, `--ghost` → white on hover. |
| Eyebrow / label | 12px | 600 | 0.14em | — | Uppercase, `--lime`. |
| Small label | 11px | 600 | 0.08–0.12em | — | Uppercase, `--ghost`. |

Rules:
- Display type is environmental — oversized words are architecture, not just
  content (Auros). Never shrink display headings to fit; let them crop.
- Uppercase + wide tracking is reserved for 11–14px operational labels.
  Display stays sentence case.
- Numerals in statistics are always tabular to prevent layout shift during
  count-up.

---

## 4 · Spacing & Rhythm

Shell: `min(1180px, calc(100% - 64px))` centered (36px gutters ≤760px).

| Zone | Rhythm |
|---|---|
| Hero | 96px top / 110px bottom (72/84 mobile) |
| Metrics strip | 68px top / 80px bottom |
| Feature flow / Process sections | 170px vertical |
| Feature rows | 110px padding, min-height 410px, 90px copy↔visual gap |
| Governance band | 140px vertical, min-height 720px |
| Access section | 170px top / 190px bottom |
| Footer | 34px top / 50px bottom |

- Cinematic gaps live in the **68–170px** band. Nothing touches the viewport
  edges except full-bleed canvases.
- Zigzag rhythm: feature rows alternate direction (`row-reverse`) — Dala DNA,
  never converted to card grids.

---

## 5 · Shape

- **Pill-only rule.** Every interactive affordance is a pill
  (`border-radius: 9999px`, padding 16px×23px, 14px/600). One pill style:
  lime fill, void text, hover lifts −3px ×1.025 with `.33` glow and
  `--lime-hover` fill.
- No cards, no borders-as-containers, no rounded rectangles anywhere else.
- Visual motifs are triangles (particles, ambient field, marquee separators).

---

## 6 · Motion Principles

Durations: **150ms** (micro) · **250–400ms** (UI transitions: nav hide, pill,
spotlight fade) · **700–850ms** (reveals, word masks) · up to **1700ms**
count-up sweep. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out expo) for
entrances; linear for tickers; exponential smoothing for physics lerp
(`smoothing(halfLifeMs, dt)`).

Primitives inventory:

| Primitive | File | Contract |
|---|---|---|
| SmoothScroll | `components/motion/SmoothScroll.tsx` | rAF-lerp wheel scrolling (~40 lines). Bypassed entirely for reduced-motion and coarse pointers. Native anchors/keyboard untouched via resync. |
| Reveal | `components/motion/Reveal.tsx` | IO threshold 0.14, translateY 28px→0, 850ms, delays .12/.22/.32s. |
| WordReveal (CSS) | `components/typography/DisplayHeading.tsx` | Per-word clip-mask stagger, 80ms/word, SSR-safe: words exist in HTML. |
| CountUp | `components/motion/CountUp.tsx` | IO-triggered ease-out-expo sweep, tabular-nums, lime glow on completion. Reduced-motion renders final value instantly. |
| Magnetic | `components/motion/Magnetic.tsx` | Cursor-attracted spring translate on CTA wrapper. Disabled for reduced-motion/coarse pointers. |
| Marquee | `components/motion/Marquee.tsx` | Pure-CSS ticker, duplicated track, pauses on hover. Reduced-motion → static wrapped row. |
| KineticMarker | `components/motion/KineticMarker.tsx` | Scroll-parallax ghost words, factor 0.16. Static when reduced-motion. |
| Spotlight | `components/motion/Spotlight.tsx` | Pointer-following lime radial on feature rows, alpha ≤ .06. Off for reduced-motion/touch. |
| AmbientField | `components/canvas/AmbientField.tsx` | Fixed full-page canvas behind all content; sparse outlined triangles; pointer parallax. |
| Constellation v2 | `components/canvas/ParticleConstellation.tsx` | Signal pulses, 3 parallax depth planes, breathing scale, luminous edge pickup. |

Hard rules:
- **Reduced-motion contract:** every animation collapses to its static/end
  state via `prefers-reduced-motion` (CSS) or `useReducedMotion()` (JS).
  SmoothScroll and Magnetic disable completely.
- **rAF hygiene:** delta-time clamped (≤34ms), loop stops on
  `visibilitychange`, single `requestAnimationFrame` chain per canvas.
- **Teardown:** every listener registered through an `AbortController`
  `signal`; observers disconnected; no leaks on unmount.

---

## 7 · Canvas Specs

### Constellation (hero brain)
3200 outlined triangles mapped onto the brain silhouette
(`lib/brainGeometry.ts`, seed `20260823`). Tuning surface:
`components/canvas/config.ts`.

| Knob | Value | Meaning |
|---|---|---|
| `PARTICLE_COUNT` | 3200 | Total triangles |
| `TRIANGLE_SIZE_MIN/MAX` | 1.4 / 3.8 | px radius range |
| `DRIFT_AMPLITUDE / SPEED` | 3.4 / 0.9 | Ambient jitter |
| `SPIN_SPEED` | 0.4 rad/s | Per-particle spin |
| `CONSTELLATION_ROTATION` | 0.015 rad/s | Whole-form rotation |
| `REACTION_RADIUS / PUSH` | 150 / 30 | Cursor repulsion |
| `POINTER_HALF_LIFE_MS` | 70 | Pointer easing |
| `EXCITATION_THRESHOLD` | 0.3 | Force → excited path |
| `BRAIN_SCALE` | 1.58 | Silhouette fit |
| `FISSURE_WIDTH / FOLD_INTENSITY / CONTOUR_RATIO` | 0.038 / 0.45 / 0.3 | Geometry sampler |
| `PALETTE / WEIGHTS / BASE_ALPHA` | lime trio / [.56 .27 .17] / [.9 .62 .4] | Stroke batching |
| `EXCITED_COLOR / LINE_WIDTHS / DPR_CAP` | #E7F336 / 1 & 1.5 / 2 | Render style |

**v2 layers:**

| Layer | Knobs | Behavior |
|---|---|---|
| Depth planes ×3 | back/mid/front: scale .84/1.0/1.14 · alpha ×.55/.85/1.0 · rot ×.75/1/1.25 · drift ×.65/1/1.25 · pointer-parallax 10/18/28px | Differential rotation + pointer shift = depth without shadows |
| Breathing | amplitude .018, angular speed .5 rad/s (~12.5s cycle) | Whole-form slow inhale/exhale |
| Signal pulses | hub stride 6 · kNN k=3 · max 9 active · spawn ~300ms · travel 700–1200ms · dot r 2.8 · comet 6 segments @ α .7 · flash 750ms r 4.2 · glow blur 13 | Bright `#E7F336` dot fires between neighboring hub particles with fading trail; arrival flashes destination ("an axon firing"); `lighter` composite |

### Ambient field (full page)
Fixed canvas, z-index 0, behind all content, `pointer-events: none`.

| Knob | Value | Meaning |
|---|---|---|
| `COUNT` | 34 | Sparse outlined triangles |
| `SIZE_MIN/MAX` | 42 / 190px | Depth mix |
| `ALPHA_MIN/MAX` | .06 / .14 | Whisper-level presence |
| `SPEED_MIN/MAX` | 5 / 14 px/s | Upward-left drift |
| `SPIN_MAX` | .05 rad/s | Slow tumble |
| `SWAY_AMP` | 14px | Sine sway |
| `PARALLAX_MAX` | 22px | Pointer shift (bigger = closer) |
| `POINTER_HALF_LIFE_MS` | 400 | Lazy follow |

Strokes alternate lime-family and ghost-white at the alphas above. Edge
wrap-around. Reduced motion → one static frame.

---

## 8 · Component Inventory

```
components/
├── brand/Logo.tsx              lockup <img>, width/height intrinsic
├── canvas/
│   ├── ParticleConstellation.tsx   hero brain (client)
│   ├── AmbientField.tsx            page-wide field (client)
│   └── config.ts                   CANVAS_CONFIG + AMBIENT_CONFIG
├── motion/
│   ├── SmoothScroll.tsx        mounted once in layout
│   ├── Reveal.tsx              IO reveal wrapper
│   ├── CountUp.tsx             metric numerals
│   ├── Magnetic.tsx            CTA attraction wrapper
│   ├── Marquee.tsx             capability ticker (server-safe)
│   ├── KineticMarker.tsx       ghost words
│   └── Spotlight.tsx           feature-row tint
├── typography/
│   ├── DisplayHeading.tsx      h1/h2 + optional word-reveal
│   ├── Eyebrow.tsx             lime kicker
│   └── BodyText.tsx            ghost paragraph
├── layout/
│   ├── Nav.tsx                 v2: hide/show, blur, progress hairline
│   ├── PillButton.tsx          the single pill
│   └── Footer.tsx
├── icons.tsx                   ArrowRight, ArrowDownRight, Menu, Close
└── sections/                   Hero · MetricsStrip · FeatureFlow · Governance
                                · Process · AccessForm · NodeVisual
lib/animation.ts · lib/brainGeometry.ts
lib/hooks/useReducedMotion.ts · lib/hooks/useInView.ts
```

Server components by default; `'use client'` only where state/canvas lives
(Nav, AccessForm, motion primitives, canvases, Logo consumers stay server).

Page order (unchanged, enriched in place): Nav → Hero → MetricsStrip →
CapabilityMarquee → FeatureFlow (+DISCOVER/UNDERSTAND/GOVERN markers) →
Governance → Process (+ACT marker) → AccessForm → Footer. Metrics keep
2,481 / 18.7k / 24/7 — now animated.

---

## 9 · Voice & Copy Rules

- Short declarative sentences. Full stops as punctuation marks of confidence:
  "No blind spots. No alert fatigue."
- Sentence case headlines ending in a period. Uppercase only for operational
  labels (eyebrows, metrics, markers).
- Concrete over abstract: numbers, systems, routes, dependencies — never
  "revolutionary", "cutting-edge", "seamless".
- Second person plural for the customer ("your company", "your teams");
  Axon speaks in third person singular.
- Capabilities vocabulary (marquee + features): DISCOVERY · CONTEXT MAPPING ·
  RISK PRIORITIZATION · POLICY GUARDRAILS · CONTINUOUS AUDIT · VENDOR
  INTELLIGENCE.
- Ghost words are verbs of the loop: DISCOVER → UNDERSTAND → GOVERN → ACT.

---

## 10 · Do / Don't (distilled guardrails)

- ✅ Depth without shadows — glow, stroke, parallax. ❌ Box-shadows on
  containers, drop-shadowed panels.
- ✅ Void as container. ❌ Cards, bordered boxes, background fills behind text.
- ✅ One pill per action hierarchy. ❌ Secondary button styles, ghost buttons,
  icon buttons beyond menu/close.
- ✅ Oversized type as environment (display 113px, markers 230px). ❌ Shrinking
  display type into tidy columns.
- ✅ Effects derived from the 7 locked tokens. ❌ New hues, gradients between
  colors, opacity stacks that read as a new color.
- ✅ Motion as physics (lerp, spring, drift). ❌ Bounce/elastic easings,
  spin-in entrances, attention-seeking loops outside the constellation.
- ✅ Sparse canvases (34 field triangles, ≤9 signals). ❌ Noise density that
  competes with copy.
- ✅ Reduced-motion parity for every effect. ❌ Animations that only have an
  animated state.
