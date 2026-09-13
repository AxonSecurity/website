import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'

export default function Path() {
  return (
    <section className="path shell" id="path">
      <div className="path-head">
        <Reveal>
          <p className="eyebrow">Day-one coverage</p>
        </Reveal>
        <Reveal delay={1}>
          <DisplayHeading level={2} wordReveal>
            Where Axon starts: the coding-agent estate.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={2}>
          <p className="path-body body-copy">
            Claude Code, Cursor, Copilot, Codex, and Gemini CLI across the
            developer fleet — their MCP servers, skills, and hooks — plus the
            LangGraph, CrewAI, AutoGen, OpenAI Agents, Pydantic-AI, ADK, and
            Anthropic framework agents living in your repositories. No
            enterprise cloud access is needed to see value on day one; cloud,
            identity providers, and SaaS agent platforms plug into the same
            graph next.
          </p>
        </Reveal>
      </div>
    </section>
  )
}