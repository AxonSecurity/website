import type { ReactNode } from 'react'

interface BodyTextProps {
  children: ReactNode
  className?: string
}

export default function BodyText({ children, className = '' }: BodyTextProps) {
  return <p className={`body-text ${className}`.trim()}>{children}</p>
}
