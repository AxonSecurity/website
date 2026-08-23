import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Eyebrow from '@/components/typography/Eyebrow'
import { ArrowRight } from '@/components/icons'

const STEPS: Array<[string, string, string]> = [
  ['01', 'Discover', 'Map every asset, identity, and relationship.'],
  ['02', 'Understand', 'Connect the dots to reveal meaningful risk.'],
  ['03', 'Act', 'Prioritize the fixes that reduce exposure fastest.'],
]

export default function Process() {
  return (
    <section className="process section-shell" id="discovery">
      <Reveal>
        <Eyebrow>From signal to action</Eyebrow>
        <DisplayHeading secondary>
          Move from
          <br />
          unknown to known.
        </DisplayHeading>
      </Reveal>
      <div className="steps">
        {STEPS.map(([num, title, text]) => (
          <Reveal key={num} className="step">
            <span className="step-num">{num}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <span className="step-icon">
              <ArrowRight size={18} />
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
