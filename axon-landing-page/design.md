# AXON Design System — v2 "SIGNAL" Contract

Single source of truth for the landing page. Every component and animation
derives from this document. The palette is **locked**: effects (opacity, glow,
stroke) are the only allowed expression — never new hues.

Sources of DNA:
- **The axon itself** — the nerve fiber that carries a signal. One idea owns
  the page: signals in → clarity out. Particles converge into the mark; the
  protocol section walks DISCOVER → UNDERSTAND → GOVERN → ACT.
- **Brand file (`AXON Logo lime.html`)** — canonical mark path, exact palette,
  Syne / JetBrains Mono / Lora type stack.
- **v1 lessons** — reduced-motion parity, rAF hygiene, AbortController
  teardown, pill-only affordances, depth-without-shadows all carried forward.
  Absolute-positioned content blocks are banned (they caused the orbit-card
  overflow).

---

## 1 · Brand Assets

Single vector source of truth: the mark path
`M14 80 L50 20 L86 80 M31 58 H43 M57 58 H69`, viewBox `0 0 100 100`,
stroke-width `11/100`, `stroke-linecap="square"`.

| Surface | Implementation |
|---|---|
| In-page logo & hero | Inline SVG (`components/brand/Logo.tsx`, Hero `DrawnMark`) — `currentColor`, infinitely crisp |
| Favicons / tiles / OG embed | Rasterized from the same path by `scripts/generate-brand.mjs` via `rsvg-convert`. Outputs: `icon-{dark,light}-32x32.png`, `apple-icon.png` (180), `brand/axon-tile.png` (512 lime tile + ink A), `brand/axon-tile-inverse.png`, `brand/axon-mark-lime.png` |

Regenerate after any brand change: `node scripts/generate-brand.mjs`.

Usage rules:
- Never redraw, skew, outline, or re-space the mark. Never substitute fonts
  for the wordmark glyph shapes — wordmark is live text in Syne 700,
  letter-spacing `.06em`.
- Mark color derives from context (`currentColor`): lime on ink, ink on lime.
- Tiles are square, corners never rounded.

---

## 2 · Color Tokens — LOCKED

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0b0c0a` | Page background (from brand file) |
| `--paper` | `#f3f2f2` | Primary text (from brand file) |
| `--lime` | `#95ff2a` | Primary accent: eyebrow, pills, CTAs, orb particles, progress, ring |
| `--lime-hover` | `#b7ff6b` | Hover fill, ticker emphasis |
| `--ghost` | `rgba(243,242,242,.58)` | Secondary text (opacity-derived) |
| `--faint` | `rgba(243,242,242,.34)` | Tertiary text, diagram strokes |
| `--hairline` | `rgba(243,242,242,.10)` | Separators, base ring |

Rules:
- Derived colors come from opacity of paper/lime only. No tints, no new hues.
- Glow ceilings: pill `rgba(149,255,42,.33)` · ring/needle drop-shadow `.45–.5`
  · count-up completion `.4` · drawn-mark `.28`.
- Selection: lime background, ink text. Focus-visible: 2px lime outline.

---

## 3 · Typography

All self-hosted by `next/font/google`: **Syne 700** display
(`--font-syne`), **JetBrains Mono 400/600** operational labels
(`--font-mono`), **Lora 400/500 (+italic)** body (`--font-lora`).

| Style | Size | Font | Tracking | Notes |
|---|---|---|---|---|
| Display H1 | `clamp(52px, 8vw, 118px)` lh .98 | Syne 700 | −0.02em | Hero only, word-reveal masked |
| Display H2 | `clamp(38px, 5.6vw, 78px)` lh 1.02 | Syne 700 | −0.02em | Section statements |
| Display H3 | `clamp(26px, 3.2vw, 42px)` lh 1.08 | Syne 700 | −0.01em | Capability titles, step titles |
| Cap numeral | `clamp(72px, 9vw, 128px)` | Syne 700 | — | Stroke-only lime α .5, fills on hover |
| Kinetic word | `clamp(120px, 22vw, 300px)` | Syne 700 | .02em | Ghost stroke α .09, aria-hidden |
| Body | 18px lh 1.68 | Lora 400 | normal | Max-width 520px, `--ghost`; `<strong>` paper/500 |
| Eyebrow | 12px 600 | JetBrains Mono | .14em | Uppercase lime, hairline dash prefix |
| Label mono | 11–12px 600 | JetBrains Mono | .12–.16em | Uppercase, operational only |
| Metric numeral | `clamp(30px, 3.6vw, 48px)` | JetBrains Mono 600 | tabular | Lime, CountUp-driven |
| Nav link | 12px 600 | JetBrains Mono | .1em | Uppercase ghost → paper on hover |
| Pill label | 13px 600 | JetBrains Mono | .06em | Uppercase ink-on-lime |

Rules: display type is architecture — never shrink to fit, let it crop.
Uppercase reserved for mono labels ≤14px. Numerals always tabular.

---

## 4 · Spacing & Rhythm

Shell: `min(1200px, calc(100% - 48px))` (40px gutters ≤760px).

| Zone | Rhythm |
|---|---|
| Nav | sticky, min-height 88 (72 mobile), hide-on-scroll past 140px |
| Hero | 72/96 padding, grid min-height `min(78vh, 720px)` |
| Loop | 150 top padding; steps at `92vh` each (72vh ≤900px) |
| Telemetry | 46px vertical, hairline top+bottom |
| Capabilities | 150 top; rows 74px vertical, hairlines between |
| Governance | 190/170, kinetic word behind |
| Access | 170/190, two-column grid |
| Footer | 38/54, hairline top |

Cinematic gaps live in the 46–190px band. Zigzag rhythm: even capability rows
mirror column order (grid `order` swap — no absolute positioning).

---

## 5 · Shape

- **Pill-only rule.** Every interactive affordance is a pill (radius 9999px,
  17×26px padding, mono 13px/600 uppercase). Hover: −3px lift ×1.02,
  `.33` glow, `--lime-hover`.
- No cards, no bordered boxes. Hairlines separate; they never enclose.
- Triangle motifs: ticker separators and access-point markers use the
  clip-path triangle; the field drifts with dash-motes.

---

## 6 · Motion Principles

Durations: 150ms micro · 250–400ms UI · 700–850ms reveals/draw-ins · up to
1700ms count-ups/sparklines · 36s linear ticker. Easing:
`cubic-bezier(0.16,1,0.3,1)` entrances; linear tickers; exponential
smoothing `smoothing(halfLifeMs, dt)` for physics.

Primitives inventory:

| Primitive | File | Contract |
|---|---|---|
| SmoothScroll | `motion/SmoothScroll.tsx` | rAF-lerp wheel (~110 half-life). Off for reduced-motion/coarse pointers; native anchors resync |
| Reveal | `motion/Reveal.tsx` | IO 0.14, translateY 30→0, 850ms, delays .12/.22/.32 |
| Word reveal | `typography/DisplayHeading.tsx` + CSS | Per-word clip-mask stagger 85ms; SSR-safe words in HTML |
| CountUp | `motion/CountUp.tsx` | IO-triggered ease-out-expo sweep; instant final value when reduced |
| Magnetic | `motion/Magnetic.tsx` | Cursor spring on CTA wrapper; off reduced/touch |
| Marquee/Ticker | `motion/Marquee.tsx` | Pure-CSS duplicated track, pause on hover; reduced → static wrapped row |
| DrawnMark | `sections/Hero.tsx` | Two paths `pathLength=1`, dash draw-in on Reveal; crossbars delayed 550ms |
| Sparkline | `canvas/Sparkline.tsx` | Deterministic seeded polyline, draws once in view; static frame when reduced |
| usePinnedScene | `hooks/usePinnedScene.ts` | Scroll→progress var `--loop-progress` + active index; rAF throttled; reduced → final state |

Hard rules:
- **Reduced-motion parity:** every animation collapses to its end state via
  CSS media block or JS `matchMedia`. SmoothScroll/Magnetic disable fully.
- **rAF hygiene:** dt clamped ≤34ms; loops stop on `visibilitychange`;
  one chain per canvas.
- **Teardown:** every listener via AbortController signal; observers
  disconnected.

---

## 7 · Canvas Specs

### SignalOrb (hero)
380 particles spiral inward along curved paths toward the mark, respawn at
the rim. Depth = radius ratio drives alpha (.07 edge → .85 core) and size;
core 16% boosted ×1.6 alpha. 72% lime / 28% paper dots. Breathing ±1.5% over
~15s. Pointer tilt ±10px, 300ms half-life.

**Anti-crop invariant (law):** `maxRadius = min(w,h)/2 − MARGIN − TILT_MAX`;
all radii ≤ maxRadius × breath(≤1.015) < available half-extent. Cropping
impossible by construction.

Knobs in `canvas/config.ts → ORB_CONFIG` (COUNT, SEED, speeds, alphas,
breath, pointer, DPR_CAP=2).

### SignalField (page ambient)
Fixed full-page canvas behind everything, `pointer-events:none`. 26 dash
motes drifting up-left, alpha .05–.13, 35% lime, per-mote parallax by depth,
pointer shift ±14px @400ms half-life. Reduced motion → single static frame.

Knobs in `canvas/config.ts → FIELD_CONFIG`.

### THE LOOP (scrollytelling)
Structure: `.loop-track` grid `[diagram-cell | steps]`. Diagram cell is
`position: sticky; height: 100vh` — sticky inside its own grid column while
the steps column scrolls four ~92vh stages. **Zero absolute positioning of
content.**

Diagram (viewBox 400², aria-hidden): base ring (hairline), progress arc
(lime, `strokeDashoffset: calc(C * (1 - var(--loop-progress)))`, rotated to
start at 12 o'clock), needle rotating
`rotate(calc(var(--loop-progress) * 360deg))`, four station nodes lighting up
progressively, center word swaps to active stage. Station numerals sit
inward-facing so nothing can exit the viewBox (v1 overflow class eliminated).

Mobile ≤900px: diagram hidden; slim sticky rail shows stage word +
`scaleX(var(--loop-progress))` lime bar.

Reduced motion: hook pins progress=1, last stage active, all steps opacity 1.

---

## 8 · Component Inventory

```
app/
├── layout.tsx                     fonts, metadata, SignalField + SmoothScroll mount
├── page.tsx                       JSON-LD graph + section order
├── globals.css                    v2 token/type/section styles
├── api/access/route.ts            POST: JSON-only, size cap, validation, honeypot,
│                                  rate limit 5/10min/IP, dev JSONL store (.data/),
│                                  masked PII log in prod, generic responses
├── opengraph-image.tsx            1200×630 satori card: Syne TTF + mark PNG, glows
├── twitter-image.tsx              re-export of OG card
├── robots.ts · sitemap.ts · manifest.ts   crawler plumbing off SITE_URL
components/
├── brand/Logo.tsx                 inline-SVG mark (currentColor) + Syne wordmark
├── canvas/config.ts               ORB_CONFIG · FIELD_CONFIG · LOOP_STAGES
├── canvas/SignalOrb.tsx           hero convergence orb
├── canvas/SignalField.tsx         page ambient motes
├── canvas/Sparkline.tsx           telemetry sparklines
├── motion/SmoothScroll.tsx        inertial wheel scroll
├── motion/Reveal.tsx              IO reveal wrapper
├── motion/CountUp.tsx             metric sweep
├── motion/Magnetic.tsx            CTA attraction
├── motion/Marquee.tsx             capability ticker
├── typography/DisplayHeading.tsx  h1/h2/h3 + word-reveal split
├── layout/Nav.tsx                 hide/show, blur, progress hairline, mobile menu
├── layout/PillButton.tsx          the single pill (link | submit, disabled state)
├── layout/Footer.tsx              lockup, nav links, status pulse, copyright
├── icons.tsx                      ArrowRight, ArrowDownRight, Menu, Close
└── sections/
    ├── Hero.tsx                   copy + SignalOrb + DrawnMark
    ├── Loop.tsx                   pinned protocol scrollytelling
    ├── Telemetry.tsx              metrics + sparklines
    ├── Capabilities.tsx           editorial rows + SVG micro-diagrams
    ├── Governance.tsx             manifesto band + kinetic word
    └── AccessForm.tsx             early-access form (client states)
lib/
├── animation.ts                   mulberry32 · clamp · lerp · smoothing
├── site.ts                        SITE_URL/name/title/locale constants
├── hooks/useReducedMotion.ts · useInView.ts · usePinnedScene.ts
scripts/generate-brand.mjs         true-SVG → PNG pipeline (rsvg-convert)
lib/fonts/Syne-Bold.ttf            satori-only font for OG card (Google Fonts, OFL)
```

Server components by default; `'use client'` only where state/canvas lives.

Page order: Nav → Hero → Ticker → Loop → Telemetry → Capabilities →
Governance → AccessForm → Footer.

---

## 9 · Voice & Copy Rules

- Short declarative sentences. Full stops as punctuation marks of confidence:
  "No blind spots. No alert fatigue."
- Sentence case headlines ending in a period. Uppercase only for operational
  labels (eyebrows, metrics, markers, ticker).
- Concrete over abstract: numbers, systems, routes, dependencies — never
  "revolutionary", "cutting-edge", "seamless".
- Second person plural for the customer ("your company"); Axon speaks third
  person singular.
- Capabilities vocabulary (ticker + rows): DISCOVERY · CONTEXT MAPPING · RISK
  PRIORITIZATION · POLICY GUARDRAILS · CONTINUOUS AUDIT · VENDOR INTELLIGENCE.
- Protocol stages: DISCOVER → UNDERSTAND → GOVERN → ACT.

---

## 10 · SEO & Metadata Contract

- **Canonical origin:** `NEXT_PUBLIC_SITE_URL` env var; placeholder fallback
  `https://axon.example.com`. Domain swap later = one env var. All absolute
  URLs derive from `lib/site.ts` — never hard-coded.
- **Metadata:** title/description single-source in `lib/site.ts`; canonical
  `/`; OG via file convention; Twitter `summary_large_image` reusing the card.
- **Structured data:** server-rendered JSON-LD entity graph (Organization ·
  WebSite · WebPage · SoftwareApplication SecurityApplication).
- **Crawler files** read the same constant; `/api/` never indexed.
- **Semantics:** exactly one h1; sections carry h2 statements; cards/steps
  h3; canvases/kinetic words/diagrams aria-hidden decoration.
- **Keywords** woven through voice, not stuffing: "AI security posture
  management" (eyebrow + meta), "AI governance", "every model your company
  runs" (h1 + meta).
- **Form endpoint:** POSTs `{ email, company_website }`; honeypot visually
  hidden + out of tab order; distinct copy for invalid_email/rate_limited.

---

## 11 · Do / Don't (distilled guardrails)

- ✅ Flow/grid layout. ❌ Absolutely-positioned content blocks (decor exempt:
  aria-hidden, contained, pointer-events none).
- ✅ Depth without shadows — glow, stroke, parallax. ❌ Drop shadows on text
  containers.
- ✅ Void as container. ❌ Cards, bordered boxes, background fills behind copy.
- ✅ One pill per action hierarchy. ❌ Ghost buttons, secondary styles.
- ✅ Oversized Syne as environment. ❌ Shrinking display into tidy columns.
- ✅ Effects from locked tokens. ❌ New hues, gradient blends between colors.
- ✅ Motion as physics. ❌ Bounce easings, attention loops outside orb/ticker.
- ✅ Sparse canvases (380-dot orb, 26 motes). ❌ Density that competes with copy.
- ✅ Reduced-motion parity everywhere. ❌ Effects that only have an animated
  state.
