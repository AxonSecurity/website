import type { ReactNode } from 'react'

interface DisplayHeadingProps {
  children: ReactNode
  as?: 'h1' | 'h2'
  secondary?: boolean
  className?: string
}

export default function DisplayHeading({
  children,
  as: Tag = 'h2',
  secondary = false,
  className = '',
}: DisplayHeadingProps) {
  const classes = ['display', secondary ? 'display-secondary' : '', className]
    .filter(Boolean)
    .join(' ')
  return <Tag className={classes}>{children}</Tag>
}
