import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface DisplayHeadingProps {
  children: ReactNode
  as?: 'h1' | 'h2'
  secondary?: boolean
  className?: string
  /** Per-word clip-mask cascade. Requires a Reveal ancestor to trigger. */
  wordReveal?: boolean
}

function splitWords(text: string) {
  const words = text.split(' ')
  return words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="wr-mask">
        <span
          className="wr-inner"
          style={{ '--wi': i } as CSSProperties}
        >
          {word}
        </span>
      </span>
      {i < words.length - 1 ? ' ' : null}
    </Fragment>
  ))
}

export default function DisplayHeading({
  children,
  as: Tag = 'h2',
  secondary = false,
  className = '',
  wordReveal = false,
}: DisplayHeadingProps) {
  const classes = [
    'display',
    secondary ? 'display-secondary' : '',
    wordReveal && typeof children === 'string' ? 'word-reveal' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes}>
      {wordReveal && typeof children === 'string'
        ? splitWords(children)
        : children}
    </Tag>
  )
}
