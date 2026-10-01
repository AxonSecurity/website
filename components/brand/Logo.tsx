import type { CSSProperties } from 'react'

export const MARK_PATH = 'M14 80 L50 20 L86 80 M31 58 H43 M57 58 H69'
export const MARK_LEGS = 'M14 80 L50 20 L86 80'
export const MARK_LEFT_LEG = 'M14 80 L50 20'
export const MARK_RIGHT_LEG = 'M50 20 L86 80'
export const MARK_BAR_LEFT = 'M31 58 H43'
export const MARK_BAR_RIGHT = 'M57 58 H69'
export const MARK_STROKE = 11

interface MarkProps {
  size?: number
  className?: string
  style?: CSSProperties
}

export function Mark({ size = 28, className = '', style }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={MARK_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK_STROKE}
        strokeLinecap="square"
      />
    </svg>
  )
}

interface LogoProps {
  markSize?: number
  compact?: boolean
  className?: string
}

export default function Logo({ markSize = 26, compact = false, className = '' }: LogoProps) {
  return (
    <span className={`logo ${compact ? 'logo-compact' : ''} ${className}`.trim()}>
      <Mark size={markSize} className="logo-mark" />
      <span className="logo-word">AXON</span>
    </span>
  )
}
