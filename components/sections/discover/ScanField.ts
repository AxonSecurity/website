import { gsap } from '@/lib/gsap'
import { clamp, lerp } from '@/lib/animation'
import { buildEstate, KIND_BY_ID, type Estate, type EstateEdge, type EstateNode, type NodeKind } from './estate'

const LIME = [149, 255, 42] as const
const PAPER = [243, 242, 242] as const
const LABEL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>*+'
const GRID_STEP = 32
/** How far behind the beam (normalised x) a node stays "freshly scanned". */
const RECENCY_SPAN = 0.22
const BEAM_FROM = -0.04
const BEAM_TO = 1.04

interface LabelSpot {
  dx: number
  dy: number
  align: CanvasTextAlign
}

interface Box {
  x1: number
  y1: number
  x2: number
  y2: number
}

function overlap(a: Box, b: Box): number {
  const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
  const h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
  return w > 0 && h > 0 ? w * h : 0
}

interface NodeState {
  state: number
  passed: boolean
  flashAt: number
  scramble: string
  scrambledAt: number
}

export interface ScanOptions {
  count: number
  mobile: boolean
  reduced: boolean
  onStats?: (resolved: number, total: number) => void
}

function rgba(color: readonly [number, number, number], alpha: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha.toFixed(3)})`
}

const BEAM_GLOW_WIDE = rgba(LIME, 0.07)
const BEAM_GLOW_NEAR = rgba(LIME, 0.2)
const BEAM_CORE = rgba(LIME, 0.95)
const FINDING_EDGE = rgba(LIME, 0.6)
const SIGNAL_DOT = rgba(LIME, 0.95)
const SIGNAL_HALO = rgba(LIME, 0.18)
const LABEL_PLATE = [11, 12, 10] as const

interface LabelDraw {
  text: string
  x: number
  y: number
  align: CanvasTextAlign
  fill: string
  accent?: string
  secondary?: string
}

function mix(amount: number, alpha: number): string {
  const t = clamp(amount, 0, 1)
  return `rgba(${Math.round(lerp(PAPER[0], LIME[0], t))}, ${Math.round(lerp(PAPER[1], LIME[1], t))}, ${Math.round(
    lerp(PAPER[2], LIME[2], t),
  )}, ${alpha.toFixed(3)})`
}

function easeOutBack(t: number): number {
  const c1 = 1.9
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function scrambled(length: number): string {
  let out = ''
  for (let i = 0; i < length; i += 1) out += LABEL_CHARS[Math.floor(Math.random() * LABEL_CHARS.length)]
  return out
}

/**
 * The Discover stage: an unmapped estate of jittering points that a lime
 * beam resolves into typed nodes as scroll progress sweeps it left → right.
 * Resolution is time-eased per node (snappy at any scroll speed) but keyed to
 * the beam, so scrubbing backwards un-resolves cleanly.
 */
export class ScanField {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly options: ScanOptions
  private readonly estate: Estate
  private readonly nodeStates: NodeState[]
  private readonly edgeProgress: number[]
  private readonly paths: Record<NodeKind, Path2D>
  private readonly grid: HTMLCanvasElement
  private readonly font: string
  private readonly resizeObserver: ResizeObserver
  private readonly intersection: IntersectionObserver
  private width = 0
  private height = 0
  private dpr = 1
  private progress = 0
  private time = 0
  private running = false
  private visible = false
  private ticking = false
  // Ambient-only frames (scan settled, no pointer) render at half rate.
  private lastProgress = -1
  private pointerMoved = false
  private idleFor = 0
  private skipFrame = false
  private edgeOrder: number[] = []
  private resolved = -1
  private pointer: { x: number; y: number } | null = null
  private labels: LabelSpot[] = []
  private plates: Array<{ w: number; h: number } | null> = []

  constructor(canvas: HTMLCanvasElement, options: ScanOptions) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('2D canvas unavailable')
    this.canvas = canvas
    this.ctx = context
    this.options = options
    this.grid = document.createElement('canvas')
    this.font =
      getComputedStyle(document.documentElement).getPropertyValue('--font-geist-mono').trim() || 'ui-monospace, monospace'

    const rect = canvas.getBoundingClientRect()
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 2.2
    this.estate = buildEstate(options.count, aspect)
    this.nodeStates = this.estate.nodes.map(() => ({
      state: options.reduced ? 1 : 0,
      passed: options.reduced,
      flashAt: -10,
      scramble: '',
      scrambledAt: -1,
    }))
    this.edgeProgress = this.estate.edges.map(() => (options.reduced ? 1 : 0))
    this.paths = Object.fromEntries(
      Object.values(KIND_BY_ID).map((spec) => [spec.kind, new Path2D(spec.path)]),
    ) as Record<NodeKind, Path2D>
    if (options.reduced) this.progress = 1

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas.parentElement ?? canvas)
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      this.syncTicker()
    })
    this.intersection.observe(canvas)
    document.addEventListener('visibilitychange', this.syncTicker)
    this.resize()
    document.fonts?.ready
      .then(() => {
        this.layoutLabels()
        this.draw()
      })
      .catch(() => undefined)
  }

  get total(): number {
    return this.estate.nodes.length
  }

  start(): void {
    this.running = true
    this.syncTicker()
  }

  setProgress(value: number): void {
    this.progress = clamp(value, 0, 1)
  }

  setPointer(x: number | null, y: number | null): void {
    this.pointer = x === null || y === null ? null : { x, y }
    this.pointerMoved = true
  }

  destroy(): void {
    this.running = false
    this.syncTicker()
    this.resizeObserver.disconnect()
    this.intersection.disconnect()
    document.removeEventListener('visibilitychange', this.syncTicker)
  }

  private syncTicker = (): void => {
    const shouldTick = this.running && this.visible && !document.hidden
    if (shouldTick && !this.ticking) {
      this.ticking = true
      gsap.ticker.add(this.tick)
    } else if (!shouldTick && this.ticking) {
      this.ticking = false
      gsap.ticker.remove(this.tick)
    }
  }

  private resize(): void {
    const parent = this.canvas.parentElement ?? this.canvas
    const rect = parent.getBoundingClientRect()
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.width = Math.max(1, Math.round(rect.width))
    this.height = Math.max(1, Math.round(rect.height))
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.paintGrid()
    this.layoutLabels()
    this.draw()
  }

  /**
   * Greedy label placement: hubs first, then findings, then the rest. Each
   * label tries right / left / below / above its glyph and takes the spot
   * that collides least with labels already placed and with other glyphs.
   */
  private layoutLabels(): void {
    const { ctx } = this
    const context2d = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    const small = this.options.mobile ? 9 : 9.5
    const nodes = this.estate.nodes
    const glyphs: Box[] = nodes.map((node) => {
      const r = this.glyphSize(node) + 3
      const x = this.px(node)
      const y = this.py(node)
      return { x1: x - r, y1: y - r, x2: x + r, y2: y + r }
    })
    const placed: Box[] = []
    const spots: LabelSpot[] = nodes.map(() => ({ dx: 0, dy: 0, align: 'left' }))
    const plates: Array<{ w: number; h: number } | null> = nodes.map(() => null)
    const rank = (node: EstateNode) => (node.hub ? 0 : node.kind === 'finding' ? 1 : 2)
    const order = nodes.map((_, index) => index).sort((a, b) => rank(nodes[a]) - rank(nodes[b]))

    for (const index of order) {
      const node = nodes[index]
      if (this.options.mobile && !node.hub && node.kind !== 'finding') continue
      const { primary, secondary } = this.labelFor(node)
      let width: number
      if (node.hub) {
        context2d.letterSpacing = '0.02em'
        ctx.font = `600 ${small + 2}px ${this.font}`
        width = ctx.measureText(primary).width
        context2d.letterSpacing = '0.14em'
        ctx.font = `500 ${small - 1}px ${this.font}`
        width = Math.max(width, ctx.measureText(secondary ?? '').width)
      } else {
        context2d.letterSpacing = '0.12em'
        ctx.font = `500 ${small}px ${this.font}`
        width = ctx.measureText(primary).width
      }
      const height = node.hub ? 28 : 12
      const size = this.glyphSize(node)
      const x = this.px(node)
      const y = this.py(node)
      const gap = size + 9
      const candidates: Array<LabelSpot & { box: Box; bias: number }> = [
        { dx: gap, dy: 0, align: 'left', box: { x1: x + gap, y1: y - height / 2, x2: x + gap + width, y2: y + height / 2 }, bias: 0 },
        { dx: -gap, dy: 0, align: 'right', box: { x1: x - gap - width, y1: y - height / 2, x2: x - gap, y2: y + height / 2 }, bias: 6 },
        { dx: 0, dy: size + 8 + height / 2, align: 'center', box: { x1: x - width / 2, y1: y + size + 8, x2: x + width / 2, y2: y + size + 8 + height }, bias: 12 },
        { dx: 0, dy: -(size + 8 + height / 2), align: 'center', box: { x1: x - width / 2, y1: y - size - 8 - height, x2: x + width / 2, y2: y - size - 8 }, bias: 14 },
      ]
      let best = candidates[0]
      let bestScore = Number.POSITIVE_INFINITY
      for (const candidate of candidates) {
        const { box } = candidate
        let score = candidate.bias
        for (const other of placed) score += overlap(box, other)
        glyphs.forEach((glyph, glyphIndex) => {
          if (glyphIndex !== index) score += overlap(box, glyph) * 1.5
        })
        const outside =
          Math.max(0, 6 - box.x1) + Math.max(0, box.x2 - (this.width - 6)) +
          Math.max(0, 22 - box.y1) + Math.max(0, box.y2 - (this.height - 22))
        score += outside * 40
        if (score < bestScore) {
          bestScore = score
          best = candidate
        }
      }
      placed.push(best.box)
      spots[index] = { dx: best.dx, dy: best.dy, align: best.align }
      plates[index] = { w: width, h: height }
    }
    context2d.letterSpacing = '0px'
    this.labels = spots
    this.plates = plates
  }

  private paintGrid(): void {
    this.grid.width = this.canvas.width
    this.grid.height = this.canvas.height
    const g = this.grid.getContext('2d')
    if (!g) return
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    g.clearRect(0, 0, this.width, this.height)
    const offsetX = (this.width % GRID_STEP) / 2
    const offsetY = (this.height % GRID_STEP) / 2
    let column = 0
    for (let x = offsetX; x <= this.width; x += GRID_STEP, column += 1) {
      let row = 0
      for (let y = offsetY; y <= this.height; y += GRID_STEP, row += 1) {
        if (column % 4 === 0 && row % 4 === 0) {
          g.fillStyle = rgba(PAPER, 0.16)
          g.fillRect(x - 3, y - 0.5, 7, 1)
          g.fillRect(x - 0.5, y - 3, 1, 7)
        } else {
          g.fillStyle = rgba(PAPER, 0.07)
          g.fillRect(x - 0.5, y - 0.5, 1, 1)
        }
      }
    }
  }

  private tick = (_time: number, deltaMs: number): void => {
    const dt = Math.min(deltaMs, 34) / 1000
    this.time += dt
    this.update(dt)
    const active = this.progress !== this.lastProgress || this.pointerMoved
    this.lastProgress = this.progress
    this.pointerMoved = false
    this.idleFor = active ? 0 : this.idleFor + dt
    if (this.idleFor > 0.6) {
      this.skipFrame = !this.skipFrame
      if (this.skipFrame) return
    }
    this.draw()
  }

  private beamX(): number {
    return lerp(BEAM_FROM, BEAM_TO, this.progress)
  }

  private update(dt: number): void {
    const beam = this.beamX()
    let resolved = 0
    this.estate.nodes.forEach((node, index) => {
      const s = this.nodeStates[index]
      const passed = node.x <= beam
      if (passed && !s.passed) s.flashAt = this.time
      s.passed = passed
      const target = passed ? 1 : 0
      const rate = passed ? 4.2 : 7
      s.state += (target - s.state) * Math.min(1, dt * rate)
      if (Math.abs(target - s.state) < 0.002) s.state = target
      if (passed) resolved += 1
    })
    this.estate.edges.forEach((edge, index) => {
      const ready = this.nodeStates[edge.a].state > 0.82 && this.nodeStates[edge.b].state > 0.82
      const next = this.edgeProgress[index] + (ready ? dt * 2.1 : -dt * 3.2)
      this.edgeProgress[index] = clamp(next, 0, 1)
    })
    if (resolved !== this.resolved) {
      this.resolved = resolved
      this.options.onStats?.(resolved, this.total)
    }
  }

  private px(node: EstateNode): number {
    return node.x * this.width
  }

  private py(node: EstateNode): number {
    return node.y * this.height
  }

  private glyphSize(node: EstateNode): number {
    const base = node.hub ? 11.5 : node.kind === 'finding' ? 9.5 : 8.5
    return this.options.mobile ? base * 0.82 : base
  }

  private recency(node: EstateNode): number {
    if (this.options.reduced) return 0
    const behind = this.beamX() - node.x
    return behind < 0 ? 0 : clamp(1 - behind / RECENCY_SPAN, 0, 1)
  }

  private pointerHeat(x: number, y: number): number {
    if (!this.pointer) return 0
    return clamp(1 - Math.hypot(x - this.pointer.x, y - this.pointer.y) / 120, 0, 1)
  }

  private draw(): void {
    const { ctx } = this
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.drawImage(this.grid, 0, 0, this.width, this.height)

    const beamPx = this.beamX() * this.width
    const beamOn = !this.options.reduced && this.progress > 0 && this.progress < 1
    if (beamOn) this.drawTrail(beamPx)
    this.drawEdges()
    this.drawNodes()
    this.drawLabels()
    if (beamOn) this.drawBeam(beamPx)
    if (this.pointer) this.drawPointer()
  }

  private drawTrail(beamPx: number): void {
    const { ctx } = this
    const trail = Math.min(240, this.width * 0.2)
    const back = ctx.createLinearGradient(beamPx - trail, 0, beamPx, 0)
    back.addColorStop(0, rgba(LIME, 0))
    back.addColorStop(0.65, rgba(LIME, 0.018))
    back.addColorStop(1, rgba(LIME, 0.065))
    ctx.fillStyle = back
    ctx.fillRect(beamPx - trail, 0, trail, this.height)
    const front = ctx.createLinearGradient(beamPx, 0, beamPx + 26, 0)
    front.addColorStop(0, rgba(LIME, 0.12))
    front.addColorStop(1, rgba(LIME, 0))
    ctx.fillStyle = front
    ctx.fillRect(beamPx, 0, 26, this.height)
  }

  private edgeEnds(edge: EstateEdge): [number, number, number, number] {
    const a = this.estate.nodes[edge.a]
    const b = this.estate.nodes[edge.b]
    const ax = this.px(a)
    const ay = this.py(a)
    const bx = this.px(b)
    const by = this.py(b)
    const length = Math.hypot(bx - ax, by - ay) || 1
    const ux = (bx - ax) / length
    const uy = (by - ay) / length
    const ra = this.glyphSize(a) + 4
    const rb = this.glyphSize(b) + 4
    return [ax + ux * ra, ay + uy * ra, bx - ux * rb, by - uy * rb]
  }

  private drawEdges(): void {
    const { ctx } = this
    const { edges } = this.estate
    // Edges are walked grouped by mode so dash state changes three times a
    // frame, not once per edge; signal dots are gathered into two paths.
    if (this.edgeOrder.length !== edges.length) {
      const rank = { finding: 0, declared: 1, observed: 2, both: 3 } as const
      this.edgeOrder = edges.map((_, index) => index).sort((a, b) => rank[edges[a].mode] - rank[edges[b].mode])
    }
    ctx.lineCap = 'round'
    const dots = new Path2D()
    const halos = new Path2D()
    let mode: EstateEdge['mode'] | null = null

    for (const index of this.edgeOrder) {
      const edge = edges[index]
      const t = easeInOut(this.edgeProgress[index])
      if (t <= 0) continue
      const [x1, y1, x2, y2] = this.edgeEnds(edge)
      const fresh = Math.max(this.recency(this.estate.nodes[edge.a]), this.recency(this.estate.nodes[edge.b]))

      if (edge.mode !== mode) {
        mode = edge.mode
        if (mode === 'finding') {
          ctx.setLineDash([2, 4])
          ctx.lineDashOffset = -this.time * 10
          ctx.lineWidth = 1.1
        } else if (mode === 'declared') {
          ctx.setLineDash([3, 5])
          ctx.lineDashOffset = 0
          ctx.lineWidth = 1
        } else {
          ctx.setLineDash([])
          ctx.lineWidth = mode === 'both' ? 1.3 : 1
        }
      }
      ctx.strokeStyle =
        mode === 'finding'
          ? FINDING_EDGE
          : mode === 'declared'
            ? mix(fresh * 0.6, 0.22 + fresh * 0.3)
            : mix(fresh * 0.6, (mode === 'both' ? 0.46 : 0.32) + fresh * 0.3)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(lerp(x1, x2, t), lerp(y1, y2, t))
      ctx.stroke()

      // Observed traffic: a lime signal riding the solid edges.
      if (t >= 1 && (mode === 'observed' || mode === 'both') && !this.options.reduced) {
        const along = (this.time * 0.26 + edge.seed) % 1
        const sx = lerp(x1, x2, along)
        const sy = lerp(y1, y2, along)
        dots.moveTo(sx + 1.7, sy)
        dots.arc(sx, sy, 1.7, 0, Math.PI * 2)
        halos.moveTo(sx + 5, sy)
        halos.arc(sx, sy, 5, 0, Math.PI * 2)
      }
    }
    ctx.setLineDash([])
    ctx.fillStyle = SIGNAL_HALO
    ctx.fill(halos)
    ctx.fillStyle = SIGNAL_DOT
    ctx.fill(dots)
  }

  private drawNodes(): void {
    const { ctx } = this
    const jitterScale = this.options.reduced ? 0 : 1
    this.estate.nodes.forEach((node, index) => {
      const s = this.nodeStates[index]
      const amp = 1.8 * (1 - s.state) * jitterScale
      const x = this.px(node) + Math.sin(this.time * 1.7 + node.phase) * amp
      const y = this.py(node) + Math.cos(this.time * 1.3 + node.phase * 1.7) * amp

      // Unmapped: a faint dot inside a ghost ring.
      if (s.state < 1) {
        const unknown = 1 - s.state
        ctx.fillStyle = rgba(PAPER, 0.42 * unknown)
        ctx.beginPath()
        ctx.arc(x, y, 1.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = rgba(PAPER, 0.1 * unknown)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, 5.5, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Resolution flash: a lime ring racing outward.
      const e = (this.time - s.flashAt) / 0.9
      if (e >= 0 && e < 1 && s.passed) {
        ctx.strokeStyle = rgba(LIME, 0.75 * (1 - e) * (1 - e))
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(x, y, this.glyphSize(node) + 3 + e * 22, 0, Math.PI * 2)
        ctx.stroke()
      }

      if (s.state <= 0.01) return
      const spec = KIND_BY_ID[node.kind]
      const size = this.glyphSize(node)
      const scale = (size / 12) * Math.max(0, easeOutBack(Math.min(1, s.state)))
      const heat = this.pointerHeat(x, y)
      const fresh = this.recency(node)
      const limeAmount = node.kind === 'finding' ? 1 : Math.max(fresh * 0.95, heat * 0.5)
      const alpha = Math.min(1, s.state) * (node.hub ? 0.95 : node.kind === 'finding' ? 1 : 0.74 + heat * 0.26)

      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale * (1 + heat * 0.12), scale * (1 + heat * 0.12))
      ctx.translate(-12, -12)
      if (spec.filled) {
        ctx.fillStyle = rgba(LIME, alpha)
        ctx.fill(this.paths[node.kind])
      } else {
        if (node.hub) {
          ctx.fillStyle = rgba([11, 12, 10], 0.9)
          ctx.beginPath()
          ctx.arc(12, 12, 8, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.strokeStyle = mix(limeAmount, alpha)
        ctx.lineWidth = (node.hub ? 1.7 : 1.5) / Math.max(scale, 0.3)
        ctx.lineJoin = 'miter'
        ctx.stroke(this.paths[node.kind])
      }
      ctx.restore()

      if (node.kind === 'finding' && !this.options.reduced) {
        const pulse = (this.time * 0.8 + node.phase) % 1
        ctx.strokeStyle = rgba(LIME, 0.4 * (1 - pulse))
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y + 1, size + 2 + pulse * 12, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  }

  private labelFor(node: EstateNode): { primary: string; secondary?: string } {
    if (node.hub) return { primary: node.name, secondary: 'AGENT' }
    return { primary: KIND_BY_ID[node.kind].label.toUpperCase() }
  }

  private drawLabels(): void {
    const { ctx } = this
    const small = this.options.mobile ? 9 : 9.5
    const context2d = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    ctx.textBaseline = 'middle'
    // Font + letter-spacing changes force the canvas to re-resolve the font,
    // so labels are queued and drawn in three style batches.
    const hubs: LabelDraw[] = []
    const smalls: LabelDraw[] = []

    this.estate.nodes.forEach((node, index) => {
      const s = this.nodeStates[index]
      if (s.state < 0.2) return
      const heat = this.pointerHeat(this.px(node), this.py(node))
      const fresh = this.recency(node)
      const isLoud = node.hub || node.kind === 'finding'
      if (this.options.mobile && !isLoud) return

      const base = node.hub ? 0.82 : node.kind === 'finding' ? 0.75 : 0.3
      const alpha = Math.min(1, s.state) * (base + (1 - base) * Math.max(fresh, heat))
      if (alpha < 0.03) return

      const { primary, secondary } = this.labelFor(node)
      const reveal = clamp((s.state - 0.25) / 0.6, 0, 1)
      const shown = Math.floor(reveal * primary.length)
      if (shown < primary.length && this.time - s.scrambledAt > 0.055) {
        s.scramble = scrambled(primary.length)
        s.scrambledAt = this.time
      }
      const text = shown >= primary.length ? primary : primary.slice(0, shown) + s.scramble.slice(shown)

      const spot = this.labels[index] ?? { dx: this.glyphSize(node) + 9, dy: 0, align: 'left' as CanvasTextAlign }
      const x = this.px(node) + spot.dx
      const y = this.py(node) + spot.dy

      const plate = this.plates[index]
      if (plate) {
        const left = spot.align === 'left' ? x : spot.align === 'right' ? x - plate.w : x - plate.w / 2
        ctx.fillStyle = rgba(LABEL_PLATE, 0.78 * Math.min(1, s.state))
        ctx.fillRect(left - 4, y - plate.h / 2 - 1, plate.w + 8, plate.h + 2)
      }

      if (node.hub) {
        hubs.push({
          text,
          x,
          y,
          align: spot.align,
          fill: mix(fresh * 0.9, alpha),
          accent: rgba(LIME, alpha * 0.85),
          secondary: secondary ?? '',
        })
      } else {
        smalls.push({
          text,
          x,
          y,
          align: spot.align,
          fill: node.kind === 'finding' ? rgba(LIME, alpha) : mix(fresh * 0.8, alpha),
        })
      }
    })

    const batch = (items: LabelDraw[], font: string, spacing: string, draw: (item: LabelDraw) => void) => {
      if (items.length === 0) return
      context2d.letterSpacing = spacing
      ctx.font = font
      for (const item of items) {
        ctx.textAlign = item.align
        draw(item)
      }
    }
    batch(smalls, `500 ${small}px ${this.font}`, '0.12em', (item) => {
      ctx.fillStyle = item.fill
      ctx.fillText(item.text, item.x, item.y + 0.5)
    })
    batch(hubs, `600 ${small + 2}px ${this.font}`, '0.02em', (item) => {
      ctx.fillStyle = item.fill
      ctx.fillText(item.text, item.x, item.y - 6)
    })
    batch(hubs, `500 ${small - 1}px ${this.font}`, '0.14em', (item) => {
      ctx.fillStyle = item.accent ?? item.fill
      ctx.fillText(item.secondary ?? '', item.x, item.y + 8)
    })
    context2d.letterSpacing = '0px'
  }

  private drawBeam(beamPx: number): void {
    const { ctx } = this
    const context2d = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    // Layered fills fake the glow; shadowBlur would blur the full stage
    // height on every frame.
    ctx.fillStyle = BEAM_GLOW_WIDE
    ctx.fillRect(beamPx - 7, 0, 14, this.height)
    ctx.fillStyle = BEAM_GLOW_NEAR
    ctx.fillRect(beamPx - 3, 0, 6, this.height)
    ctx.fillStyle = BEAM_CORE
    ctx.fillRect(beamPx - 0.75, 0, 1.5, this.height)

    // Brackets top and bottom, plus a live read-out riding the beam.
    ctx.strokeStyle = rgba(LIME, 0.9)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(beamPx - 9, 0.5)
    ctx.lineTo(beamPx + 9, 0.5)
    ctx.moveTo(beamPx - 9, this.height - 0.5)
    ctx.lineTo(beamPx + 9, this.height - 0.5)
    ctx.stroke()

    context2d.letterSpacing = '0.14em'
    ctx.font = `600 9.5px ${this.font}`
    ctx.textBaseline = 'middle'
    const flip = beamPx > this.width - 120
    ctx.textAlign = flip ? 'right' : 'left'
    const anchor = clamp(beamPx + (flip ? -12 : 12), 12, this.width - 12)
    ctx.fillStyle = rgba(LIME, 0.95)
    ctx.fillText(`SCAN ${String(Math.round(this.progress * 100)).padStart(3, '0')}%`, anchor, 16)
    ctx.fillStyle = rgba(PAPER, 0.45)
    ctx.fillText(`X ${clamp(this.beamX(), 0, 1).toFixed(3)}`, anchor, this.height - 16)
    context2d.letterSpacing = '0px'
  }

  private drawPointer(): void {
    if (!this.pointer) return
    const { ctx } = this
    const context2d = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    const { x, y } = this.pointer
    ctx.fillStyle = rgba(PAPER, 0.07)
    ctx.fillRect(0, Math.round(y) - 0.5, this.width, 1)
    ctx.fillRect(Math.round(x) - 0.5, 0, 1, this.height)
    context2d.letterSpacing = '0.12em'
    ctx.font = `500 9px ${this.font}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = rgba(PAPER, 0.4)
    ctx.fillText(`${(x / this.width).toFixed(2)} / ${(y / this.height).toFixed(2)}`, x + 10, y - 10)
    context2d.letterSpacing = '0px'
  }
}
