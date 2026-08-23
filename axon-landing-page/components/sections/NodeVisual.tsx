interface NodeVisualProps {
  variant: number
}

const PATHS = [
  'M30 160 C110 20 180 220 260 70 S350 110 400 35',
  'M20 90 C90 90 100 190 180 150 S250 20 400 130',
  'M30 180 C110 180 120 60 210 90 S300 180 400 55',
]

const ENDPOINTS = [
  [
    { cx: 30, cy: 160 },
    { cx: 400, cy: 35 },
  ],
  [
    { cx: 20, cy: 90 },
    { cx: 400, cy: 130 },
  ],
  [
    { cx: 30, cy: 180 },
    { cx: 400, cy: 55 },
  ],
]

export default function NodeVisual({ variant }: NodeVisualProps) {
  const [start, end] = ENDPOINTS[variant % ENDPOINTS.length]
  return (
    <div className="node-visual" aria-hidden="true">
      <svg viewBox="0 0 420 240">
        <path d={PATHS[variant % PATHS.length]} />
        <circle cx={start.cx} cy={start.cy} r="5" />
        <circle cx={end.cx} cy={end.cy} r="5" />
      </svg>
    </div>
  )
}
