export default function DrawnMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`drawn-mark ${className}`.trim()}
      style={{ width: '72px', height: '72px' }}
      aria-hidden="true"
    >
      <path
        d="M14 80 L50 20 L86 80"
        fill="none"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="square"
        pathLength={1}
      />
      <path
        d="M31 58 H43 M57 58 H69"
        fill="none"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="square"
        pathLength={1}
      />
    </svg>
  )
}
