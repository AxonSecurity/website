import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import { gsap } from '@/lib/gsap'
import { mulberry32 } from '@/lib/animation'
import { type Estate, type EstateNode, NODE_TYPES, traceReach } from './estateData'
import {
  dustFragment,
  dustVertex,
  edgeFragment,
  edgeVertex,
  nodeFragment,
  nodeVertex,
  signalFragment,
  signalVertex,
} from './shaders'

export interface FocusSnapshot {
  node: EstateNode
  reach: number
  direction: 'out' | 'in'
}

interface GraphOptions {
  mobile: boolean
  finePointer: boolean
  onFocus: (focus: FocusSnapshot | null) => void
  /** Per-frame screen position (canvas px) of the focused node. */
  onFrame: (x: number, y: number, visible: boolean) => void
}

const PAPER = new Color('#f3f2f2')
const LIME = new Color('#95ff2a')
const PICK_RADIUS = 70
const HOLD_RADIUS = 110
const IDLE_MS = 2600
const AUTOPILOT_ON_MS = 2700
const AUTOPILOT_OFF_MS = 900

// The hero's WebGL scene: nodes (typed glyphs), edges (draw-in lines),
// signals (lime points riding edges) and depth dust, plus screen-space
// picking that lights up a node's blast radius.
export default class EstateGraph {
  readonly stats: { nodes: number; edges: number; signalsPerSecond: number }

  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera = new PerspectiveCamera(38, 1, 0.1, 80)
  private readonly group = new Group()
  private readonly canvas: HTMLCanvasElement
  private readonly estate: Estate
  private readonly options: GraphOptions

  private readonly nodeMaterial: ShaderMaterial
  private readonly edgeMaterial: ShaderMaterial
  private readonly signalMaterial: ShaderMaterial
  private readonly dustMaterial: ShaderMaterial
  private readonly geometries: BufferGeometry[] = []

  private readonly nodeHi: Float32Array
  private readonly nodeDim: Float32Array
  private readonly nodeHiTarget: Float32Array
  private readonly nodeDimTarget: Float32Array
  private readonly edgeHi: Float32Array
  private readonly edgeDim: Float32Array
  private readonly edgeHiTarget: Float32Array
  private readonly edgeDimTarget: Float32Array
  private readonly signalEdge: Uint16Array
  private readonly nodeHiAttr: BufferAttribute
  private readonly nodeDimAttr: BufferAttribute
  private readonly edgeHiAttr: BufferAttribute
  private readonly edgeDimAttr: BufferAttribute
  private readonly signalHiAttr: BufferAttribute
  private readonly signalDimAttr: BufferAttribute

  private readonly projected: Float32Array
  private readonly temp = new Vector3()

  private width = 1
  private height = 1
  private elapsed = 0
  private running = false
  private wanted = false
  private contextLost = false
  private formed = false
  private settled = true
  private scroll = 0
  private spin = 0
  private orbitX = 0
  private orbitY = 0
  private pointer = { x: -9999, y: -9999, nx: 0, ny: 0, inside: false, pickable: true, lastMove: -Infinity }
  private focus = -1
  private autopilotAt = 0
  private autopilotOn = false
  private readonly random = mulberry32(7)
  private readonly baseCameraZ: number
  private intro: gsap.core.Timeline | null = null

  constructor(canvas: HTMLCanvasElement, estate: Estate, options: GraphOptions) {
    this.canvas = canvas
    this.estate = estate
    this.options = options
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    // 1.5 is visually indistinguishable for a soft ambient graph and costs
    // ~44% fewer fragments than 2 on retina screens.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    this.baseCameraZ = options.mobile ? 11.5 : 9.6
    this.camera.position.set(0, 0.35, this.baseCameraZ)
    this.camera.lookAt(0, 0, 0)
    this.group.position.set(options.mobile ? 0.2 : 1.35, options.mobile ? 2.3 : 1.0, 0)
    if (options.mobile) this.group.scale.setScalar(0.78)
    this.scene.add(this.group)

    const { nodes, edges } = estate
    const n = nodes.length
    const e = edges.length

    // ---- Nodes
    const nodeGeometry = new BufferGeometry()
    const positions = new Float32Array(n * 3)
    const scatter = new Float32Array(n * 3)
    const types = new Float32Array(n)
    const sizes = new Float32Array(n)
    const delays = new Float32Array(n)
    const seeds = new Float32Array(n)
    nodes.forEach((node, i) => {
      positions.set(node.position, i * 3)
      scatter.set(node.scatter, i * 3)
      types[i] = NODE_TYPES.indexOf(node.type)
      sizes[i] = node.size
      delays[i] = node.delay
      seeds[i] = node.seed
    })
    this.nodeHi = new Float32Array(n)
    this.nodeDim = new Float32Array(n)
    this.nodeHiTarget = new Float32Array(n)
    this.nodeDimTarget = new Float32Array(n)
    nodeGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    nodeGeometry.setAttribute('aScatter', new BufferAttribute(scatter, 3))
    nodeGeometry.setAttribute('aType', new BufferAttribute(types, 1))
    nodeGeometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
    nodeGeometry.setAttribute('aDelay', new BufferAttribute(delays, 1))
    nodeGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
    this.nodeHiAttr = new BufferAttribute(this.nodeHi, 1)
    this.nodeDimAttr = new BufferAttribute(this.nodeDim, 1)
    nodeGeometry.setAttribute('aHi', this.nodeHiAttr)
    nodeGeometry.setAttribute('aDim', this.nodeDimAttr)

    // Uniform objects are shared by reference: one write to uTime/uFade
    // updates every layer.
    const shared = {
      uTime: { value: 0 },
      uPixel: { value: this.renderer.getPixelRatio() },
      uScale: { value: options.mobile ? 96 : 112 },
      uFade: { value: 1 },
      uPaper: { value: PAPER },
      uLime: { value: LIME },
    }

    this.nodeMaterial = new ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: { ...shared, uForm: { value: 0 } },
      transparent: true,
      depthWrite: false,
    })
    this.group.add(new Points(nodeGeometry, this.nodeMaterial))

    // ---- Edges (two vertices each, t = 0 → 1 along the edge)
    const edgeGeometry = new BufferGeometry()
    const edgePositions = new Float32Array(e * 6)
    const edgeT = new Float32Array(e * 2)
    const edgeDelay = new Float32Array(e * 2)
    const edgeSeed = new Float32Array(e * 2)
    edges.forEach((edge, i) => {
      edgePositions.set(nodes[edge.from].position, i * 6)
      edgePositions.set(nodes[edge.to].position, i * 6 + 3)
      edgeT[i * 2] = 0
      edgeT[i * 2 + 1] = 1
      edgeDelay[i * 2] = edge.delay
      edgeDelay[i * 2 + 1] = edge.delay
      edgeSeed[i * 2] = nodes[edge.from].seed
      edgeSeed[i * 2 + 1] = nodes[edge.to].seed
    })
    this.edgeHi = new Float32Array(e * 2)
    this.edgeDim = new Float32Array(e * 2)
    this.edgeHiTarget = new Float32Array(e)
    this.edgeDimTarget = new Float32Array(e)
    edgeGeometry.setAttribute('position', new BufferAttribute(edgePositions, 3))
    edgeGeometry.setAttribute('aT', new BufferAttribute(edgeT, 1))
    edgeGeometry.setAttribute('aDelay', new BufferAttribute(edgeDelay, 1))
    edgeGeometry.setAttribute('aSeed', new BufferAttribute(edgeSeed, 1))
    this.edgeHiAttr = new BufferAttribute(this.edgeHi, 1)
    this.edgeDimAttr = new BufferAttribute(this.edgeDim, 1)
    edgeGeometry.setAttribute('aHi', this.edgeHiAttr)
    edgeGeometry.setAttribute('aDim', this.edgeDimAttr)

    this.edgeMaterial = new ShaderMaterial({
      vertexShader: edgeVertex,
      fragmentShader: edgeFragment,
      uniforms: { ...shared, uReveal: { value: 0 } },
      transparent: true,
      depthWrite: false,
    })
    this.group.add(new LineSegments(edgeGeometry, this.edgeMaterial))

    // ---- Signals riding edges
    const signalCount = Math.min(Math.round(e * 0.85), options.mobile ? 90 : 170)
    const signalGeometry = new BufferGeometry()
    const starts = new Float32Array(signalCount * 3)
    const ends = new Float32Array(signalCount * 3)
    const seedA = new Float32Array(signalCount)
    const seedB = new Float32Array(signalCount)
    const speeds = new Float32Array(signalCount)
    const offsets = new Float32Array(signalCount)
    this.signalEdge = new Uint16Array(signalCount)
    let speedSum = 0
    for (let i = 0; i < signalCount; i += 1) {
      const edgeIndex = i < e ? (i * 7) % e : Math.floor(this.random() * e)
      const edge = edges[edgeIndex]
      this.signalEdge[i] = edgeIndex
      starts.set(nodes[edge.from].position, i * 3)
      ends.set(nodes[edge.to].position, i * 3)
      seedA[i] = nodes[edge.from].seed
      seedB[i] = nodes[edge.to].seed
      speeds[i] = 0.16 + this.random() * 0.34
      offsets[i] = this.random()
      speedSum += speeds[i]
    }
    signalGeometry.setAttribute('position', new BufferAttribute(new Float32Array(signalCount * 3), 3))
    signalGeometry.setAttribute('aStart', new BufferAttribute(starts, 3))
    signalGeometry.setAttribute('aEnd', new BufferAttribute(ends, 3))
    signalGeometry.setAttribute('aSeedA', new BufferAttribute(seedA, 1))
    signalGeometry.setAttribute('aSeedB', new BufferAttribute(seedB, 1))
    signalGeometry.setAttribute('aSpeed', new BufferAttribute(speeds, 1))
    signalGeometry.setAttribute('aOffset', new BufferAttribute(offsets, 1))
    this.signalHiAttr = new BufferAttribute(new Float32Array(signalCount), 1)
    this.signalDimAttr = new BufferAttribute(new Float32Array(signalCount), 1)
    signalGeometry.setAttribute('aHi', this.signalHiAttr)
    signalGeometry.setAttribute('aDim', this.signalDimAttr)
    // Signals move in the shader; bounds would be stale, so never cull.
    const signals = new Points(signalGeometry, (this.signalMaterial = new ShaderMaterial({
      vertexShader: signalVertex,
      fragmentShader: signalFragment,
      uniforms: { ...shared, uSignals: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    })))
    signals.frustumCulled = false
    this.group.add(signals)

    // ---- Dust
    const dustCount = options.mobile ? 600 : 1500
    const dustGeometry = new BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)
    const dustSeeds = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (this.random() - 0.5) * 30
      dustPositions[i * 3 + 1] = (this.random() - 0.5) * 17
      dustPositions[i * 3 + 2] = -14 + this.random() * 20
      dustSeeds[i] = this.random()
    }
    dustGeometry.setAttribute('position', new BufferAttribute(dustPositions, 3))
    dustGeometry.setAttribute('aSeed', new BufferAttribute(dustSeeds, 1))
    this.dustMaterial = new ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { ...shared, uDust: { value: 0 } },
      transparent: true,
      depthWrite: false,
    })
    const dust = new Points(dustGeometry, this.dustMaterial)
    dust.frustumCulled = false
    this.scene.add(dust)

    this.geometries.push(nodeGeometry, edgeGeometry, signalGeometry, dustGeometry)
    this.projected = new Float32Array(n * 2)
    this.stats = { nodes: n, edges: e, signalsPerSecond: Math.round(speedSum) }

    this.canvas.addEventListener('webglcontextlost', this.onContextLost)
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored)
    this.resize()
  }

  // ---------------------------------------------------------------- lifecycle

  start(): void {
    this.wanted = true
    if (this.running || this.contextLost) return
    this.running = true
    gsap.ticker.add(this.tick)
  }

  stop(): void {
    this.wanted = false
    this.halt()
  }

  private halt(): void {
    if (!this.running) return
    this.running = false
    gsap.ticker.remove(this.tick)
  }

  playIntro(): void {
    if (this.intro) return
    const node = this.nodeMaterial.uniforms
    const edge = this.edgeMaterial.uniforms
    const signal = this.signalMaterial.uniforms
    const dust = this.dustMaterial.uniforms
    this.intro = gsap
      .timeline({
        onComplete: () => {
          this.formed = true
          this.autopilotAt = this.elapsed + 0.6
        },
      })
      .to(dust.uDust, { value: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .to(node.uForm, { value: 1, duration: 2.8, ease: 'power3.inOut' }, 0.05)
      .to(edge.uReveal, { value: 1, duration: 2, ease: 'power1.inOut' }, 1.5)
      .to(signal.uSignals, { value: 1, duration: 1.4, ease: 'power2.out' }, 2.9)
  }

  /** Jump straight to the formed state (e.g. when the intro was skipped). */
  finishIntro(): void {
    this.playIntro()
    this.intro?.progress(1)
  }

  resize(): void {
    const width = this.canvas.clientWidth || 1
    const height = this.canvas.clientHeight || 1
    this.width = width
    this.height = height
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    // Narrow frames need a wider lens to keep the estate in view.
    this.camera.fov = width / height < 0.8 ? 52 : 38
    this.camera.updateProjectionMatrix()
    this.render()
  }

  /** `pickable` is false while the pointer is over copy: orbit, but don't pick. */
  setPointer(x: number, y: number, inside: boolean, pickable = true): void {
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.inside = inside
    this.pointer.pickable = pickable
    this.pointer.nx = (x / this.width) * 2 - 1
    this.pointer.ny = (y / this.height) * 2 - 1
    if (inside) this.pointer.lastMove = performance.now()
  }

  setScroll(progress: number): void {
    this.scroll = progress
    if (!this.running) this.render()
  }

  dispose(): void {
    this.stop()
    this.intro?.kill()
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
    for (const geometry of this.geometries) geometry.dispose()
    this.nodeMaterial.dispose()
    this.edgeMaterial.dispose()
    this.signalMaterial.dispose()
    this.dustMaterial.dispose()
    this.renderer.dispose()
  }

  // ---------------------------------------------------------------- frame

  private readonly onContextLost = (event: Event) => {
    event.preventDefault()
    this.contextLost = true
    this.halt()
  }

  // three re-uploads its resources on restore; resume if we were running.
  private readonly onContextRestored = () => {
    this.contextLost = false
    if (this.wanted) this.start()
  }

  private readonly tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 34) / 1000
    this.elapsed += dt
    this.nodeMaterial.uniforms.uTime.value = this.elapsed

    // Camera: slow spin + pointer orbit + scroll dolly.
    const k = 1 - Math.exp(-dt * 2.2)
    const fine = this.options.finePointer && this.pointer.inside
    this.orbitX += ((fine ? this.pointer.nx : 0) * 0.32 - this.orbitX) * k
    this.orbitY += ((fine ? this.pointer.ny : 0) * 0.16 - this.orbitY) * k
    this.spin += dt * 0.035
    this.group.rotation.set(0.12 + this.orbitY + this.scroll * 0.55, -0.35 + this.spin + this.orbitX, 0)
    this.camera.position.z = this.baseCameraZ - this.scroll * 3.4
    this.camera.position.y = 0.35 + this.scroll * 0.8
    this.camera.lookAt(0, this.scroll * 0.4, 0)
    this.nodeMaterial.uniforms.uFade.value = 1 - this.scroll * 0.55

    this.updateFocus()
    this.easeHighlights(dt)
    this.render()
    this.reportFocusPosition()
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  private project(): void {
    this.group.updateMatrixWorld()
    const { nodes } = this.estate
    for (let i = 0; i < nodes.length; i += 1) {
      this.temp.fromArray(nodes[i].position).applyMatrix4(this.group.matrixWorld).project(this.camera)
      this.projected[i * 2] = (this.temp.x * 0.5 + 0.5) * this.width
      this.projected[i * 2 + 1] = (-this.temp.y * 0.5 + 0.5) * this.height
    }
  }

  private nearest(radius: number): number {
    let best = -1
    let bestDistance = radius * radius
    for (let i = 0; i < this.estate.nodes.length; i += 1) {
      const dx = this.projected[i * 2] - this.pointer.x
      const dy = this.projected[i * 2 + 1] - this.pointer.y
      const distance = dx * dx + dy * dy
      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    }
    return best
  }

  private updateFocus(): void {
    if (!this.formed) return
    this.project()
    const now = performance.now()
    const manual =
      this.options.finePointer && this.pointer.inside && now - this.pointer.lastMove < IDLE_MS

    if (manual) {
      this.autopilotOn = false
      if (!this.pointer.pickable) {
        this.setFocus(-1)
        this.autopilotAt = this.elapsed + 0.8
        return
      }
      let target = this.nearest(PICK_RADIUS)
      if (target < 0 && this.focus >= 0) {
        const dx = this.projected[this.focus * 2] - this.pointer.x
        const dy = this.projected[this.focus * 2 + 1] - this.pointer.y
        if (dx * dx + dy * dy < HOLD_RADIUS * HOLD_RADIUS) target = this.focus
      }
      this.setFocus(target)
      this.autopilotAt = this.elapsed + 0.8
      return
    }

    // Autopilot: demo a hub's blast radius, rest, repeat.
    if (this.elapsed < this.autopilotAt) return
    if (this.autopilotOn) {
      this.autopilotOn = false
      this.setFocus(-1)
      this.autopilotAt = this.elapsed + AUTOPILOT_OFF_MS / 1000
      return
    }
    // Only demo hubs that sit in open canvas: not under the HUD, not at an edge.
    const visible = this.estate.hubs.filter((hub) => {
      const x = this.projected[hub * 2]
      const y = this.projected[hub * 2 + 1]
      const underHud = x > this.width - 340 && y < 480
      return !underHud && x > 60 && x < this.width - 60 && y > 110 && y < this.height * 0.72
    })
    const pool = visible.length > 0 ? visible : this.estate.hubs
    let candidate = pool[Math.floor(this.random() * pool.length)]
    if (candidate === this.focus && pool.length > 1) candidate = pool[(pool.indexOf(candidate) + 1) % pool.length]
    this.autopilotOn = true
    this.setFocus(candidate)
    this.autopilotAt = this.elapsed + AUTOPILOT_ON_MS / 1000
  }

  private setFocus(index: number): void {
    if (index === this.focus) return
    this.focus = index
    this.settled = false
    this.nodeHiTarget.fill(0)
    this.nodeDimTarget.fill(0)
    this.edgeHiTarget.fill(0)
    this.edgeDimTarget.fill(0)

    if (index < 0) {
      this.options.onFocus(null)
      return
    }

    const reach = traceReach(this.estate, index)
    const { depth } = reach
    this.nodeDimTarget.fill(1)
    for (const [node] of depth) {
      this.nodeHiTarget[node] = 1
      this.nodeDimTarget[node] = 0
    }
    this.edgeDimTarget.fill(1)
    this.estate.edges.forEach((edge, i) => {
      const a = depth.get(edge.from)
      const b = depth.get(edge.to)
      if (a === undefined || b === undefined) return
      const forward = reach.direction === 'out' ? b === a + 1 : a === b + 1
      if (forward) {
        this.edgeHiTarget[i] = 1
        this.edgeDimTarget[i] = 0
      }
    })

    this.options.onFocus({
      node: this.estate.nodes[index],
      reach: depth.size - 1,
      direction: reach.direction,
    })
  }

  private easeHighlights(dt: number): void {
    if (this.settled) return
    const k = 1 - Math.exp(-dt * 9)
    let delta = 0
    for (let i = 0; i < this.nodeHi.length; i += 1) {
      const dh = this.nodeHiTarget[i] - this.nodeHi[i]
      const dd = this.nodeDimTarget[i] - this.nodeDim[i]
      this.nodeHi[i] += dh * k
      this.nodeDim[i] += dd * k
      delta += Math.abs(dh) + Math.abs(dd)
    }
    for (let i = 0; i < this.edgeHiTarget.length; i += 1) {
      const hi = this.edgeHi[i * 2] + (this.edgeHiTarget[i] - this.edgeHi[i * 2]) * k
      const dim = this.edgeDim[i * 2] + (this.edgeDimTarget[i] - this.edgeDim[i * 2]) * k
      this.edgeHi[i * 2] = this.edgeHi[i * 2 + 1] = hi
      this.edgeDim[i * 2] = this.edgeDim[i * 2 + 1] = dim
    }
    const signalHi = this.signalHiAttr.array as Float32Array
    const signalDim = this.signalDimAttr.array as Float32Array
    for (let i = 0; i < this.signalEdge.length; i += 1) {
      signalHi[i] = this.edgeHi[this.signalEdge[i] * 2]
      signalDim[i] = this.edgeDim[this.signalEdge[i] * 2]
    }
    this.nodeHiAttr.needsUpdate = true
    this.nodeDimAttr.needsUpdate = true
    this.edgeHiAttr.needsUpdate = true
    this.edgeDimAttr.needsUpdate = true
    this.signalHiAttr.needsUpdate = true
    this.signalDimAttr.needsUpdate = true
    if (delta < 0.002) this.settled = true
  }

  private reportFocusPosition(): void {
    if (this.focus < 0) {
      this.options.onFrame(0, 0, false)
      return
    }
    this.options.onFrame(this.projected[this.focus * 2], this.projected[this.focus * 2 + 1], true)
  }
}
