import type { ReactNode } from 'react'
import { ArrowRight } from '@/components/icons'

interface PillBaseProps {
  children: ReactNode
  size?: 'default' | 'small'
  className?: string
  /** Label shown in the custom cursor while hovering. */
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

// The CTA: a lime pill with an arrow chip. Hover only changes its colour.
export default function Pill(props: PillLinkProps | PillButtonProps) {
  const { children, size = 'default', className = '', cursor, icon = <ArrowRight size={16} /> } = props
  const classes = ['pill', size === 'small' ? 'pill-small' : '', className].filter(Boolean).join(' ')

  const inner = (
    <>
      <span className="pill-label">{children}</span>
      <span className="pill-icon" aria-hidden="true">
        {icon}
      </span>
    </>
  )

  if (props.href !== undefined) {
    return (
      <a href={props.href} className={classes} data-cursor={cursor}>
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
    >
      {inner}
    </button>
  )
}
