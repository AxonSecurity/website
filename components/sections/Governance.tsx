import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Parallax from '@/components/motion/Parallax'

export default function Governance() {
  return (
    <section className="governance" id="governance">
      <Parallax className="kinetic-word" factor={0.16}>
        GOVERNED
      </Parallax>
      <div className="shell governance-inner">
        <Reveal>
          <p className="eyebrow">Always-on coverage</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            The model layer changes daily.
            <br />
            Our watch doesn&apos;t.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="body-copy">
            We continuously discover, contextualize, and resolve every exposure
            across your AI environment. <em>No blind spots.</em>{' '}
            <em>No alert fatigue.</em> Coverage that holds while everything
            underneath it moves.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
