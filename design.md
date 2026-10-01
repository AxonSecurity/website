# AXON Design System — v3 "PULSE"

The landing page as a short film about one idea: **every agent, every path,
seen — and judged only when it matters.** v3 keeps the locked palette and the
brand mark; everything else (type, layout, motion, sections) is new.

---

## 1 · Palette — LOCKED

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0b0c0a` | Background |
| `--paper` | `#f3f2f2` | Primary text |
| `--lime` | `#95ff2a` | The signal: accents, CTAs, active states, pulses |
| `--lime-hover` | `#b7ff6b` | Hover highlight |
| derived | `--ghost .62` `--faint .38` `--dim .2` `--hairline .12` `--hairline-2 .06` (paper α) · `--lime-dim .16` `--lime-glow .38` (lime α) | |

RGB triplets exist for canvas/alpha work: `--ink-rgb`, `--paper-rgb`, `--lime-rgb`.
**No new hues. No gradients between colors.** Gradients are allowed only
between one color and its own transparency (fades, glows, masks).
Canvas/WebGL use the same three colors: ink `#0b0c0a`, paper `#f3f2f2`, lime `#95ff2a`.

## 2 · Type

| Role | Font | Notes |
|---|---|---|
| Display | **Mona Sans** variable (`--font-display`), axes `wght 200–900`, `wdth 75–125` | Width axis is a motion channel: `font-variation-settings: 'wdth' var(--wdth)` |
| Accent | **Instrument Serif** italic (`.serif-i`) | One or two words per heading, never a full sentence |
| Mono | **Geist Mono** (`.mono`, `--font-mono`) | Uppercase operational labels, readouts, counters |

Classes: `.d-mega` `.d-1` `.d-2` `.d-3` (display sizes), `.lead`, `.body`, `.mono`, `.tabular`, `.lime`.
Headlines: sentence case, end with a period. Uppercase only for mono labels.
Canvas text: read the family with
`getComputedStyle(document.documentElement).getPropertyValue('--font-geist-mono')`.

## 3 · Layout

- `.wrap` = max 1840px, `--edge` side padding (`--gutter` + `--inset`). The blueprint
  lines sit on `--gutter`, so content always clears them by `--inset`; never put
  text or a box border on a blueprint line. `.section` = `--section-y` block padding.
- `.grid-12` 12-col grid. Fixed blueprint column lines (6 cols) sit behind everything.
- Chapters: each section root has `id` and `data-chapter` (drives the right-edge rail).
  `01 Premise #premise · 02 Discover #discover · 03 Judge #judge · 04 Observe #observe ·
  05 Sovereign #sovereign · 06 Roadmap #roadmap · 07 Get covered #access`.
- Open every chapter with `<SectionHead index label title lead layout>`.

## 4 · Motion system

Engine: **GSAP 3.15** (all plugins) + **Lenis** smooth scroll, one ticker.
Import only from `@/lib/gsap`: `gsap, ScrollTrigger, SplitText, DrawSVGPlugin,
ScrambleTextPlugin, useGSAP, prefersReducedMotion, SCRAMBLE_CHARS`.
Eases: `'axon'` (0.16,1,0.3,1 — entrances), `'axon-io'` (0.76,0,0.24,1 — wipes, scrubs).

| Primitive | File | Use |
|---|---|---|
| Preloader | `motion/Preloader.tsx` | Boot counter + mark draw → screen collapses into a lime line. Plays once per tab session (`lib/intro-gate.ts` inline script hides it before first paint on repeat loads). `?intro=0` skips, `?intro=1` forces |
| intro bus | `lib/intro.ts` | `onIntroDone(cb)` / `useIntroDone()` — above-the-fold entrances wait for it |
| SmoothScroll | `motion/SmoothScroll.tsx` | Lenis → `ScrollTrigger.update`; velocity via `getScrollVelocity()` |
| Cursor | `motion/Cursor.tsx` | Dot + trailing ring; `data-cursor="LABEL"` shows a label bubble |
| SplitReveal | `motion/SplitReveal.tsx` | Masked lines/words/chars rise; `trigger="scroll" \| "intro"` |
| Scramble | `motion/Scramble.tsx` | Mono text decodes from noise; `trigger="scroll" \| "intro" \| "hover"` |
| Marquee | `motion/Marquee.tsx` | Infinite ticker, scroll-velocity boost/reverse/skew |
| Pill | `ui/Pill.tsx` | The CTA: lime pill + arrow chip; hover is a colour change only (no movement) |
| Eyebrow / SectionHead | `ui/*` | Chapter openers |

Rules:
- **Reduced motion parity.** Every section renders a complete, legible static end
  state when `prefers-reduced-motion: reduce`: no pins, no scrubs, no loops.
  Use `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`.
- **One loop per canvas**, on `gsap.ticker`, paused off-screen (IntersectionObserver)
  and on `document.hidden`. dt clamped. DPR capped at 2.
- **At most one WebGL context** on the page (the hero).
- Pins: pin the section root, `end: '+=N%'`, `scrub: 1`, `anticipatePin: 1`.
- Teardown: `useGSAP` scopes revert tweens/triggers; manual listeners removed.
- Mobile ≤760px: lighter canvases, horizontal tracks become vertical stacks.

Performance budget (B2B: corporate laptops, integrated GPUs). Verified at 54–60fps
per section with the CPU throttled 6× on an integrated GPU.
- Animate only `transform` and `opacity` on HTML. SVG children are never
  composited, so no infinite CSS animations or filters inside SVG; put rings,
  pulses and glows in HTML overlays.
- No `filter: drop-shadow`, `backdrop-filter` or `mix-blend-mode` on anything that
  sits over a live canvas or moves. Glows are gradient layers faded on opacity.
- Never animate `left`/`top`/`width` per frame: use a full-width "rider" that
  translates by its own width (roadmap pulse, redaction bar).
- Scroll-driven custom properties go on the smallest element that uses them,
  not on a section root (every descendant would restyle).
- Canvas: no `shadowBlur`; batch by style (one font/dash change per group,
  one `Path2D` per colour band); halve the paint rate when idle or when the
  measured frame time says the machine is slow. WebGL DPR ≤ 1.5.
- `will-change` only on the few layers that actually move (never per word/char).
- Decorative canvases/SVG are `aria-hidden`; real copy is real DOM text.

## 5 · Page — the film

| # | Section | Set piece |
|---|---|---|
| — | Preloader | Counter 000→100, mark draws, boot log decodes, screen collapses into the axon line |
| — | Hero | WebGL **estate graph**: scattered points assemble into an agent graph; lime signals ride the edges; hover any node → its **blast radius** lights up (tooltip only, no HUD card). Kinetic width headline on intro (static afterwards, not pointer-reactive) |
| — | Partners | Backed-by band |
| 01 | Premise | Scroll-scrubbed manifesto; words light up, inline glyph chips pop in |
| 02 | Discover | Section head, three outcome-level facts, client/framework marquees. No product visual (IP): no node/edge types, labels, sources or counts |
| 03 | Judge | Pinned **three legs**: reach (left leg) + influence (right leg) + no boundary (the gapped crossbar) *assemble the Axon mark* — only then is it a finding |
| 04 | Observe | Redaction machine (content → metadata), adapters, fail-open / report-first notes |
| 05 | Sovereign | Tenant boundary: metadata never leaves; signed content comes in through the verification ladder (no bundle version shown). Giant width-animated SOVEREIGN |
| 06 | Roadmap | Horizontal pinned track NOW → NEXT → THEREAFTER, a signal travels the line |
| 07 | Get covered | Giant CTA, animated form, success burst. No ticker: the close is deliberately simple |
| — | Footer | Parallax reveal, index, partners, UTC clock. No giant wordmark |

## 6 · Voice

Short declarative sentences with full stops. Concrete nouns (agents, MCP servers,
credentials, blast radius, paths). Never "revolutionary", "cutting-edge", "seamless".
"Your stack" for the customer; Axon in third person. CTA: "Get covered".
Every product claim must be true to `agent-security/docs/AXON-SYSTEM.md`.

## 7 · Plumbing kept from v2

`app/api/access/route.ts` (validation, honeypot, rate limit, Turnstile), `lib/email.ts`,
`lib/site.ts`, OG/Twitter images, robots/sitemap/manifest, CSP in `next.config.mjs`
(`img-src 'self' data:` — no remote assets; COEP `require-corp`).
