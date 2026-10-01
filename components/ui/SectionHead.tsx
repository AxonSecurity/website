import type { ReactNode } from 'react'
import Eyebrow from '@/components/ui/Eyebrow'
import SplitReveal from '@/components/motion/SplitReveal'
import './section-head.css'

interface SectionHeadProps {
  index: string
  label: string
  title: ReactNode
  lead?: ReactNode
  /** split: title left, lead bottom-right · stack: everything left-aligned */
  layout?: 'split' | 'stack' | 'center'
  size?: 'd-1' | 'd-2'
  className?: string
}

// Chapter opener: eyebrow → masked display title → lead.
export default function SectionHead({
  index,
  label,
  title,
  lead,
  layout = 'split',
  size = 'd-2',
  className = '',
}: SectionHeadProps) {
  return (
    <header className={`shead shead-${layout} ${className}`.trim()}>
      <Eyebrow index={index} label={label} />
      <SplitReveal as="h2" className={`shead-title ${size}`}>
        {title}
      </SplitReveal>
      {lead ? (
        <SplitReveal as="p" className="shead-lead lead" delay={0.15}>
          {lead}
        </SplitReveal>
      ) : null}
    </header>
  )
}
