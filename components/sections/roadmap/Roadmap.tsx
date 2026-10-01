import SectionHead from '@/components/ui/SectionHead'
import RoadmapTrack from './RoadmapTrack'
import './roadmap.css'

export default function Roadmap() {
  return (
    <section className="rm" id="roadmap" data-chapter="Roadmap">
      <div className="wrap rm-head">
        <SectionHead
          index="06"
          label="Roadmap"
          title={
            <>
              Now. Next. <span className="serif-i lime">Thereafter.</span>
            </>
          }
          lead="Shipped in stages — each a layer on the one before."
        />
      </div>
      <RoadmapTrack />
    </section>
  )
}
