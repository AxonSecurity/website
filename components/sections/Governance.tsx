import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Parallax from '@/components/motion/Parallax'

export default function Governance() {
  return (
    <section className="governance" id="governance">
      <Parallax className="kinetic-word" factor={0.16}>
        SOVEREIGN
      </Parallax>
      <div className="shell governance-inner">
        <Reveal>
          <p className="eyebrow">Sovereign by design</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            Your data never leaves your tenant.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="body-copy">
            Collectors are read-only and emit metadata only. Raw prompts,
            data-store contents, and secrets stay in your environment —
            secrets become findings by reference, never stored values.
            <em> One container store, no external calls from the data plane,
            no vendor cloud.</em> The graph is also a live AI Bill of
            Materials, exportable as CycloneDX.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
