import SectionHead from '@/components/ui/SectionHead'
import ThreeLegs from '@/components/sections/judge/ThreeLegs'
import FindingPanel from '@/components/sections/judge/FindingPanel'
import Precision from '@/components/sections/judge/Precision'
import './judge.css'
import './anatomy.css'

export default function Judge() {
  return (
    <section id="judge" data-chapter="Judge" className="judge">
      <div className="wrap judge-head">
        <SectionHead
          index="03"
          label="Judge"
          title={
            <>
              Three legs. <span className="serif-i lime">Or it isn&apos;t a finding.</span>
            </>
          }
          lead="Axon raises a finding only when three things hold at once. Everything else is noise — and noise is where real risk hides."
        />
      </div>

      <ThreeLegs />

      <div className="wrap judge-anatomy">
        <div className="judge-anatomy-head">
          <p className="eyebrow">
            <span className="eyebrow-index">03.1</span>
            <span className="eyebrow-rule" aria-hidden="true" />
            <span>Anatomy of a finding</span>
          </p>
        </div>
        <div className="judge-anatomy-grid">
          <FindingPanel />
          <Precision />
        </div>
      </div>
    </section>
  )
}
