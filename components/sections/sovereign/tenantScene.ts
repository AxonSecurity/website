import { mulberry32 } from '@/lib/animation'

// Canvas renderer for the tenant boundary: metadata motes that drift and
// bounce off the wall (nothing exits), one inbound port at the top, and the
// signed-content packet travelling the verification channel.

const LIME = '149, 255, 42'
const PAPER = '243, 242, 242'
const LABELS = ['sha256', 'count', 'ts', 'id', 'hash', 'seq', 'edge', 'n=12', 'ok', 'ms']

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  square: boolean
  label: string | null
  heat: number
  phase: number
}

interface Flash {
  x: number
  y: number
  horizontal: boolean
  age: number
}

interface Ripple {
  x: number
  y: number
  age: number
}

export interface PacketState {
  y: number
  alpha: number
  refused: number
  trail: number
}

export interface Geometry {
  width: number
  height: number
  channelX: number
  portY: number
  endY: number
}

export interface TenantScene {
  resize: (geometry: Geometry, dpr: number) => void
  step: (dt: number) => void
  draw: () => void
  ripple: () => void
  packet: PacketState
}

const INSET = 14
const RADIUS = 30
const PORT_HALF = 22
const LINK_BANDS = 4
// Midpoint alpha of each closeness band (max 0.1 at touching distance).
const LINK_BAND_ALPHA = Array.from(
  { length: LINK_BANDS },
  (_, band) => `rgba(${PAPER}, ${(((band + 0.5) / LINK_BANDS) * 0.1).toFixed(3)})`,
)

export function createTenantScene(canvas: HTMLCanvasElement, fontFamily: string, mobile: boolean): TenantScene {
  const context = canvas.getContext('2d')
  const random = mulberry32(20260930)
  const motes: Mote[] = []
  const flashes: Flash[] = []
  const ripples: Ripple[] = []
  const packet: PacketState = { y: -40, alpha: 0, refused: 0, trail: 0 }
  let geometry: Geometry = { width: 1, height: 1, channelX: 1, portY: INSET, endY: 1 }
  let dpr = 1
  let time = 0

  const bounds = () => ({
    left: INSET + 10,
    right: geometry.width - INSET - 10,
    top: INSET + 10,
    bottom: geometry.height - INSET - 10,
  })

  const seed = () => {
    motes.length = 0
    const count = mobile ? 40 : 88
    const b = bounds()
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2
      const speed = 10 + random() * 26
      motes.push({
        x: b.left + random() * (b.right - b.left),
        y: b.top + random() * (b.bottom - b.top),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.4 + random() * 2.2,
        square: random() < 0.35,
        label: random() < 0.26 ? LABELS[Math.floor(random() * LABELS.length)] : null,
        heat: 0,
        phase: random() * Math.PI * 2,
      })
    }
  }

  const resize = (next: Geometry, nextDpr: number) => {
    const first = motes.length === 0
    geometry = next
    dpr = nextDpr
    canvas.width = Math.max(1, Math.round(next.width * dpr))
    canvas.height = Math.max(1, Math.round(next.height * dpr))
    if (first) seed()
    else {
      const b = bounds()
      for (const mote of motes) {
        mote.x = Math.min(Math.max(mote.x, b.left), b.right)
        mote.y = Math.min(Math.max(mote.y, b.top), b.bottom)
      }
    }
  }

  const step = (dt: number) => {
    time += dt
    const b = bounds()
    for (const mote of motes) {
      mote.phase += dt * 0.6
      mote.x += (mote.vx + Math.sin(mote.phase) * 6) * dt
      mote.y += (mote.vy + Math.cos(mote.phase * 0.8) * 6) * dt
      mote.heat = Math.max(0, mote.heat - dt * 1.4)
      if (mote.x < b.left || mote.x > b.right) {
        mote.vx *= -1
        mote.x = Math.min(Math.max(mote.x, b.left), b.right)
        mote.heat = 1
        flashes.push({ x: mote.x < geometry.width / 2 ? INSET : geometry.width - INSET, y: mote.y, horizontal: false, age: 0 })
      }
      if (mote.y < b.top || mote.y > b.bottom) {
        mote.vy *= -1
        mote.y = Math.min(Math.max(mote.y, b.top), b.bottom)
        mote.heat = 1
        flashes.push({ x: mote.x, y: mote.y < geometry.height / 2 ? INSET : geometry.height - INSET, horizontal: true, age: 0 })
      }
    }
    for (let i = flashes.length - 1; i >= 0; i -= 1) {
      flashes[i].age += dt
      if (flashes[i].age > 0.9) flashes.splice(i, 1)
    }
    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      ripples[i].age += dt
      if (ripples[i].age > 2.2) ripples.splice(i, 1)
    }
  }

  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  const drawBoundary = (ctx: CanvasRenderingContext2D) => {
    const { width, height, channelX } = geometry
    const x = INSET
    const y = INSET
    const w = width - INSET * 2
    const h = height - INSET * 2
    // The wall: one continuous line except the inbound port.
    ctx.save()
    ctx.strokeStyle = `rgba(${PAPER}, 0.24)`
    ctx.lineWidth = 1
    roundedRect(ctx, x, y, w, h, RADIUS)
    ctx.stroke()
    // Punch the port through the top edge.
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(channelX - PORT_HALF, y - 3, PORT_HALF * 2, 6)
    ctx.restore()

    // Port jaws.
    ctx.strokeStyle = `rgba(${LIME}, 0.9)`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(channelX - PORT_HALF, y - 7)
    ctx.lineTo(channelX - PORT_HALF, y + 7)
    ctx.moveTo(channelX + PORT_HALF, y - 7)
    ctx.lineTo(channelX + PORT_HALF, y + 7)
    ctx.stroke()

    // Wall labels.
    ctx.font = `500 10px ${fontFamily}`
    ctx.fillStyle = `rgba(${PAPER}, 0.62)`
    ctx.textBaseline = 'middle'
    ctx.fillText('YOUR TENANT', x + 26, y + 26)
    ctx.fillStyle = `rgba(${PAPER}, 0.32)`
    ctx.fillText('EGRESS  ·  NONE', x + 26, y + 44)
    ctx.fillStyle = `rgba(${LIME}, 0.9)`
    const inbound = 'INBOUND ONLY'
    const inboundWidth = ctx.measureText(inbound).width
    ctx.fillText(inbound, channelX - PORT_HALF - 14 - inboundWidth, y - 0.5)
  }

  const drawFlashes = (ctx: CanvasRenderingContext2D) => {
    for (const flash of flashes) {
      const t = flash.age / 0.9
      const alpha = (1 - t) * 0.85
      const half = 16 + t * 26
      ctx.strokeStyle = `rgba(${LIME}, ${alpha})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (flash.horizontal) {
        ctx.moveTo(flash.x - half, flash.y)
        ctx.lineTo(flash.x + half, flash.y)
      } else {
        ctx.moveTo(flash.x, flash.y - half)
        ctx.lineTo(flash.x, flash.y + half)
      }
      ctx.stroke()
    }
  }

  const drawMotes = (ctx: CanvasRenderingContext2D) => {
    // Faint constellation between neighbours. Links are sorted into a few
    // alpha bands and each band is stroked as one path: four draw calls a
    // frame instead of one per pair.
    ctx.lineWidth = 1
    const reach = mobile ? 62 : 84
    const reach2 = reach * reach
    const bands: Path2D[] = LINK_BAND_ALPHA.map(() => new Path2D())
    for (let i = 0; i < motes.length; i += 1) {
      const a = motes[i]
      for (let j = i + 1; j < motes.length; j += 1) {
        const b = motes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 < reach2) {
          const closeness = 1 - Math.sqrt(d2) / reach
          const band = Math.min(LINK_BANDS - 1, Math.floor(closeness * LINK_BANDS))
          bands[band].moveTo(a.x, a.y)
          bands[band].lineTo(b.x, b.y)
        }
      }
    }
    bands.forEach((path, band) => {
      ctx.strokeStyle = LINK_BAND_ALPHA[band]
      ctx.stroke(path)
    })
    ctx.font = `500 9px ${fontFamily}`
    ctx.textBaseline = 'middle'
    for (const mote of motes) {
      const lit = mote.heat
      ctx.fillStyle = lit > 0.02 ? `rgba(${LIME}, ${0.35 + lit * 0.65})` : `rgba(${PAPER}, 0.5)`
      if (mote.square) ctx.fillRect(mote.x - mote.size, mote.y - mote.size, mote.size * 2, mote.size * 2)
      else {
        ctx.beginPath()
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2)
        ctx.fill()
      }
      if (mote.label) {
        ctx.fillStyle = `rgba(${PAPER}, ${0.22 + lit * 0.4})`
        ctx.fillText(mote.label, mote.x + mote.size + 5, mote.y)
      }
    }
  }

  const drawChannel = (ctx: CanvasRenderingContext2D) => {
    const { channelX, endY } = geometry
    ctx.save()
    ctx.setLineDash([2, 5])
    ctx.lineDashOffset = -time * 14
    ctx.strokeStyle = `rgba(${PAPER}, 0.28)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(channelX, 0)
    ctx.lineTo(channelX, endY)
    ctx.stroke()
    ctx.restore()

    if (packet.alpha <= 0.01) return
    const y = packet.y
    // Verified trail behind the packet.
    const top = Math.max(0, INSET)
    if (packet.trail > 0 && y > top) {
      ctx.strokeStyle = `rgba(${LIME}, ${0.55 * packet.alpha * packet.trail})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(channelX, top)
      ctx.lineTo(channelX, Math.min(y, endY))
      ctx.stroke()
    }
    const glow = ctx.createRadialGradient(channelX, y, 0, channelX, y, 36)
    const tone = packet.refused > 0.5 ? PAPER : LIME
    glow.addColorStop(0, `rgba(${tone}, ${0.42 * packet.alpha})`)
    glow.addColorStop(1, `rgba(${tone}, 0)`)
    ctx.fillStyle = glow
    ctx.fillRect(channelX - 36, y - 36, 72, 72)

    ctx.save()
    ctx.translate(channelX, y)
    ctx.rotate(Math.PI / 4)
    if (packet.refused > 0.5) {
      ctx.strokeStyle = `rgba(${PAPER}, ${packet.alpha})`
      ctx.lineWidth = 1.5
      ctx.strokeRect(-6, -6, 12, 12)
    } else {
      ctx.fillStyle = `rgba(${LIME}, ${packet.alpha})`
      ctx.fillRect(-6, -6, 12, 12)
    }
    ctx.restore()
  }

  const drawRipples = (ctx: CanvasRenderingContext2D) => {
    for (const ripple of ripples) {
      const t = ripple.age / 2.2
      const eased = 1 - Math.pow(1 - t, 3)
      const radius = eased * Math.max(geometry.width, geometry.height) * 0.85
      ctx.strokeStyle = `rgba(${LIME}, ${(1 - t) * 0.55})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = `rgba(${LIME}, ${(1 - t) * 0.22})`
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, radius * 0.72, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const draw = () => {
    if (!context) return
    const ctx = context
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, geometry.width, geometry.height)
    // Clip everything interior to the wall so ripples stay inside too.
    ctx.save()
    roundedRect(ctx, INSET, INSET, geometry.width - INSET * 2, geometry.height - INSET * 2, RADIUS)
    ctx.clip()
    drawMotes(ctx)
    drawRipples(ctx)
    ctx.restore()
    drawFlashes(ctx)
    drawBoundary(ctx)
    drawChannel(ctx)
  }

  const ripple = () => {
    ripples.push({ x: geometry.channelX, y: geometry.endY, age: 0 })
    for (const mote of motes) mote.heat = Math.max(mote.heat, 0.6)
  }

  return { resize, step, draw, ripple, packet }
}
