import SignalOrb from '@/components/canvas/SignalOrb'
import PillButton from '@/components/layout/PillButton'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import { ArrowDownRight, ArrowRight } from '@/components/icons'

function DrawnMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="drawn-mark"
      style={{ width: '46%', height: '46%' }}
      aria-hidden="true"
    >
      <path
        d="M14 80 L50 20 L86 80"
        fill="none"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="square"
        pathLength={1}
      />
      <path
        d="M31 58 H43 M57 58 H69"
        fill="none"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="square"
        pathLength={1}
      />
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero shell" id="top">
      <div className="hero-grid">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">AI security posture management</p>
          </Reveal>
          <Reveal delay={1}>
            <DisplayHeading level={1} wordReveal>
              Know every model you run.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={2}>
            <p className="body-copy">
              One living map of every model, vendor, and dependency — always
              current.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="hero-actions">
              <Magnetic>
                <PillButton href="#access">
                  Request access <ArrowRight size={16} />
                </PillButton>
              </Magnetic>
              <a className="text-link hero-anchor" href="#loop">
                See the protocol <ArrowDownRight size={15} />
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal className="signal-stage" delay={1}>
          <SignalOrb />
          <DrawnMark />
        </Reveal>
      </div>
      <Reveal className="hero-index">
        SCROLL TO EXPLORE <ArrowDownRight size={16} />
      </Reveal>
    </section>
  )
}
