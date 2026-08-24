import type { CSSProperties } from 'react'

const MARK_PATH = 'M14 80 L50 20 L86 80 M31 58 H43 M57 58 H69'
const STROKE_WIDTH = 11

interface MarkProps {
  size?: number
  className?: string
}

export function Mark({ size = 28, className = '' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={MARK_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="square"
      />
    </svg>
  )
}

interface LogoProps {
  markSize?: number
  wordSize?: number
  compact?: boolean
  className?: string
}

export default function Logo({
  markSize = 28,
  wordSize = 19,
  compact = false,
  className = '',
}: LogoProps) {
  const style: CSSProperties =
    wordSize !== 19 ? { fontSize: `${wordSize}px` } : {}

  return (
    <span className={`logo ${compact ? 'logo-compact' : ''} ${className}`.trim()}>
      <Mark size={markSize} className="logo-mark" />
      <span className="logo-word" style={style}>
        AXON
      </span>
    </span>
  )
}
