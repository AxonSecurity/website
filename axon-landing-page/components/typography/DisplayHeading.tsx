import { Fragment, isValidElement } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type DisplayLevel = 1 | 2 | 3

interface DisplayHeadingProps {
  level?: DisplayLevel
  children: ReactNode
  wordReveal?: boolean
  className?: string
}

function splitContent(children: ReactNode) {
  let wordIndex = 0
  const nodes = Array.isArray(children) ? children : [children]

  return nodes.map((child, partIndex) => {
    if (typeof child === 'string') {
      const words = child.split(' ').filter((word) => word.length > 0)
      return words.map((word) => {
        const index = wordIndex
        wordIndex += 1
        return (
          <Fragment key={`w-${index}`}>
            <span className="wr-mask">
              <span className="wr-inner" style={{ '--wi': index } as CSSProperties}>
                {word}
              </span>
            </span>{' '}
          </Fragment>
        )
      })
    }
    if (isValidElement(child) && child.type === 'br') {
      return <Fragment key={`br-${partIndex}`}>{child}</Fragment>
    }
    return <Fragment key={`c-${partIndex}`}>{child}</Fragment>
  })
}

const SIZE_CLASS: Record<DisplayLevel, string> = {
  1: 'display-hero',
  2: 'display-section',
  3: 'display-item',
}

export default function DisplayHeading({
  level = 2,
  children,
  wordReveal = false,
  className = '',
}: DisplayHeadingProps) {
  const Tag = `h${level}` as const

  return (
    <Tag className={`display ${SIZE_CLASS[level]} ${className}`.trim()}>
      {wordReveal ? (
        <span className="word-reveal">{splitContent(children)}</span>
      ) : (
        children
      )}
    </Tag>
  )
}
