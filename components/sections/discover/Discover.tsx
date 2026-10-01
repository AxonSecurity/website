import SectionHead from '@/components/ui/SectionHead'
import Coverage from './Coverage'
import './discover.css'

export default function Discover() {
  return (
    <section id="discover" data-chapter="Discover" className="discover">
      <div className="wrap discover-head">
        <SectionHead
          index="02"
          label="Discover"
          title={
            <>
              Every agent. Every identity. <span className="serif-i lime">Every path.</span>
            </>
          }
          lead="Axon finds every agent in your stack — the ones you approved and the ones nobody did — and puts each one on a single map of who it acts for and what it can reach."
        />
      </div>

      <Coverage />
    </section>
  )
}
