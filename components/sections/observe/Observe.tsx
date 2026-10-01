import SectionHead from '@/components/ui/SectionHead'
import Redaction from '@/components/sections/observe/Redaction'
import EventStream from '@/components/sections/observe/EventStream'
import EdgeStates from '@/components/sections/observe/EdgeStates'
import Adapters from '@/components/sections/observe/Adapters'
import SplitReveal from '@/components/motion/SplitReveal'
import './observe.css'

export default function Observe() {
  return (
    <section id="observe" data-chapter="Observe" className="observe">
      <div className="wrap">
        <SectionHead
          index="04"
          label="Observe"
          title={
            <>
              Metadata only. <span className="serif-i lime">Never the message.</span>
            </>
          }
          lead="The sensor records what agents actually do — which tools they call, which stores they touch, who they hand work to — and nothing they say."
        />

        <Redaction />

        <div className="ob-grid">
          <div className="ob-stream-col">
            <p className="ob-kicker mono">
              <span className="lime">04.1</span> Live ingest
            </p>
            <EventStream />
            <p className="ob-caption body">
              Idempotent ingest into a day-partitioned log. Every event aggregates into an
              observed edge beside the declared graph.
            </p>
          </div>
          <EdgeStates />
        </div>

        <Adapters />

        <div className="ob-notes">
          <div className="ob-note-wrap">
            <p className="ob-note-key mono">
              <span className="lime">A</span> Fail-open
            </p>
            <SplitReveal as="p" className="ob-note">
              A broken adapter can never slow or stop an agent.
            </SplitReveal>
          </div>
          <div className="ob-note-wrap">
            <p className="ob-note-key mono">
              <span className="lime">B</span> Report-first
            </p>
            <SplitReveal as="p" className="ob-note" delay={0.12}>
              Today Axon observes and reports.{' '}
              <span className="serif-i lime">Blocking is a policy switch away.</span>
            </SplitReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
