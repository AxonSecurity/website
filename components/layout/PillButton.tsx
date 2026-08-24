import type { ReactNode } from 'react'

type PillLinkProps = {
  href: string
  type?: undefined
  children: ReactNode
  className?: string
}

type PillSubmitProps = {
  href?: undefined
  type?: 'submit' | 'button'
  disabled?: boolean
  children: ReactNode
  className?: string
}

export default function PillButton(props: PillLinkProps | PillSubmitProps) {
  const { children, className = '' } = props
  const classes = 'pill'.concat(className ? ` ${className}` : '')
  if (props.href !== undefined) {
    return (
      <a href={props.href} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <button
      type={props.type ?? 'button'}
      className={classes}
      disabled={props.disabled}
    >
      {children}
    </button>
  )
}
