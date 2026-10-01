import { buildEstate, type NodeType } from './estateData'

// The formed estate as SVG: the reduced-motion / no-WebGL frame.
const ROT_X = 0.12
const ROT_Y = -0.35
const OFFSET_X = 1.35
const OFFSET_Y = 1.0

function project([x, y, z]: [number, number, number]): [number, number, number] {
  const cy = Math.cos(ROT_Y)
  const sy = Math.sin(ROT_Y)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cx = Math.cos(ROT_X)
  const sx = Math.sin(ROT_X)
  const y1 = y * cx - z1 * sx
  const z2 = y * sx + z1 * cx
  const depth = 9.6 - z2
  const scale = 9.6 / depth
  return [(x1 + OFFSET_X) * scale, -(y1 + OFFSET_Y) * scale, depth]
}

function Glyph({ type, x, y, r }: { type: NodeType; x: number; y: number; r: number }) {
  switch (type) {
    case 'agent':
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="none" stroke="currentColor" strokeWidth={r * 0.28} />
          <circle cx={x} cy={y} r={r * 0.3} fill="currentColor" />
        </g>
      )
    case 'mcp':
      return (
        <path
          d={`M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`}
          fill="rgba(243,242,242,.12)"
          stroke="currentColor"
          strokeWidth={r * 0.26}
        />
      )
    case 'store':
      return (
        <rect
          x={x - r * 0.85}
          y={y - r * 0.85}
          width={r * 1.7}
          height={r * 1.7}
          fill="rgba(243,242,242,.12)"
          stroke="currentColor"
          strokeWidth={r * 0.26}
        />
      )
    case 'identity':
      return (
        <g>
          <circle cx={x} cy={y} r={r * 1.1} fill="rgba(243,242,242,.14)" />
          <circle cx={x} cy={y} r={r * 0.4} fill="currentColor" />
        </g>
      )
    default:
      return <circle cx={x} cy={y} r={r * 0.45} fill="currentColor" />
  }
}

export default function StaticGraph({ clusters = 10 }: { clusters?: number }) {
  const estate = buildEstate(clusters)
  const points = estate.nodes.map((node) => project(node.position))
  const scale = 100

  return (
    <svg
      className="hero-static"
      viewBox="-640 -420 1280 840"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="rgba(243,242,242,.14)" strokeWidth="1">
        {estate.edges.map((edge, i) => {
          const a = points[edge.from]
          const b = points[edge.to]
          return <line key={i} x1={a[0] * scale} y1={a[1] * scale} x2={b[0] * scale} y2={b[1] * scale} />
        })}
      </g>
      <g className="hero-static-nodes">
        {estate.nodes.map((node, i) => {
          const [x, y, depth] = points[i]
          const opacity = Math.max(0.35, Math.min(0.85, 1.25 - depth / 14))
          return (
            <g key={i} opacity={opacity} color={node.type === 'agent' && i % 3 === 0 ? '#95ff2a' : '#f3f2f2'}>
              <Glyph type={node.type} x={x * scale} y={y * scale} r={node.size * 5.2} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
