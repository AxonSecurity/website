'use client'

import type { MouseEvent, ReactNode } from 'react'
import { ArrowRight } from '@/components/icons'

interface PillBaseProps {
  children: ReactNode
  variant?: 'solid' | 'ghost'
  size?: 'default' | 'small'
  className?: string
  cursor?: string
  icon?: ReactNode
}

type PillLinkProps = PillBaseProps & {
  href: string
  type?: undefined
  disabled?: undefined
}

type PillButtonProps = PillBaseProps & {
  href?: undefined
  type?: 'submit' | 'button'
  disabled?: boolean
  onClick?: () => void
}

// The fill circle grows from wherever the pointer entered the pill.
function trackEntry(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--fx', `${event.clientX - rect.left}px`)
  target.style.setProperty('--fy', `${event.clientY - rect.top}px`)
}

export default function Pill(props: PillLinkProps | PillButtonProps) {
  const {
    children,
    variant = 'solid',
    size = 'default',
    className = '',
    cursor,
    icon = <ArrowRight size={16} />,
  } = props

  const classes = [
    'pill',
    variant === 'ghost' ? 'pill-ghost' : '',
    size === 'small' ? 'pill-small' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span className="pill-fill" aria-hidden="true" />
      <span className="pill-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      <span className="pill-icon" aria-hidden="true">
        {icon}
        {icon}
      </span>
    </>
  )

  if (props.href !== undefined) {
    return (
      <a
        href={props.href}
        className={classes}
        data-cursor={cursor}
        onMouseEnter={trackEntry}
        onMouseLeave={trackEntry}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={classes}
      disabled={props.disabled}
      onClick={props.onClick}
      data-cursor={cursor}
      onMouseEnter={trackEntry}
      onMouseLeave={trackEntry}
    >
      {inner}
    </button>
  )
}
