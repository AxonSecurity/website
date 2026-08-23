'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight, Menu, X } from 'lucide-react'

function AxonMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Axon home"><svg className="brand-mark" viewBox="0 0 62 68" aria-hidden="true"><path d="M8 59 31 12l23 47M18 40h26" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="square" /></svg><span>AXON</span></span>
}

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let frame = 0
    const pointer = { x: 0, y: 0 }
    const colors = ['#89F336', '#E7F336', '#C8F336']
    const particles = Array.from({ length: 130 }, (_, i) => ({ x: Math.random(), y: Math.random(), size: Math.random() * 3 + 1, speed: Math.random() * .00035 + .0001, phase: Math.random() * 8, color: colors[i % colors.length] }))
    const resize = () => { const dpr = Math.min(window.devicePixelRatio, 2); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const move = (event: MouseEvent) => { pointer.x = event.clientX / window.innerWidth - .5; pointer.y = event.clientY / window.innerHeight - .5 }
    const draw = (time: number) => { const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.clearRect(0, 0, w, h); particles.forEach((p) => { const x = p.x * w + pointer.x * 18 + Math.sin(time * p.speed + p.phase) * 12; const y = ((p.y + time * p.speed) % 1) * h + pointer.y * 12; ctx.save(); ctx.translate(x, y); ctx.rotate(time * .0003 + p.phase); ctx.fillStyle = p.color; ctx.globalAlpha = .42 + Math.sin(time * .001 + p.phase) * .2; ctx.beginPath(); ctx.moveTo(0, -p.size * 2); ctx.lineTo(p.size, p.size); ctx.lineTo(-p.size, p.size); ctx.closePath(); ctx.fill(); ctx.restore() }); frame = requestAnimationFrame(draw) }
    resize(); window.addEventListener('resize', resize); window.addEventListener('mousemove', move); frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', move) }
  }, [])
  return <canvas ref={ref} className="particle-field" aria-hidden="true" />
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div> }

const features = [
  ['DISCOVER', 'Every model. Every route. Every dependency.', 'Axon inventories the AI systems your teams build, buy, and quietly ship.'],
  ['UNDERSTAND', 'Context over noise.', 'Trace data, permissions, prompts, and vendors into one continuously updated risk picture.'],
  ['GOVERN', 'Make responsible AI operational.', 'Turn policy into guardrails that move at the speed of your organization.'],
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: .14 }); document.querySelectorAll('.reveal').forEach((item) => observer.observe(item)); return () => observer.disconnect() }, [])
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true) }
  return <main>
    <nav className="nav" aria-label="Main navigation"><a href="#top"><AxonMark /></a><div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}><a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a><a href="#discovery" onClick={() => setMenuOpen(false)}>Discovery</a><a href="#governance" onClick={() => setMenuOpen(false)}>Governance</a><a className="nav-cta" href="#access" onClick={() => setMenuOpen(false)}>Request access <ArrowRight size={15} /></a></div><button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></nav>
    <section className="hero section-shell" id="top"><ParticleField /><div className="hero-copy"><Reveal><p className="eyebrow">AI SECURITY POSTURE MANAGEMENT</p></Reveal><Reveal className="delay-1"><h1>Know every model your company runs.</h1></Reveal><Reveal className="delay-2"><p className="hero-subtitle">Axon gives security teams the living intelligence to understand, govern, and protect the AI systems shaping what&apos;s next.</p></Reveal><Reveal className="delay-3"><a className="button button-primary" href="#access">Request early access <ArrowRight size={16} /></a></Reveal></div><Reveal className="hero-index">SCROLL TO EXPLORE <ArrowDownRight size={17} /></Reveal></section>
    <section className="data-type section-shell reveal"><span>AI SYSTEMS DISCOVERED</span><strong>2,481</strong><span>CONNECTED DATA POINTS</span><strong>18.7k</strong><span>CONTINUOUS COVERAGE</span><strong>24/7</strong></section>
    <section className="section-shell feature-flow" id="platform"><Reveal><p className="eyebrow">THE AXON DIFFERENCE</p><h2>Security posture<br />with a pulse.</h2></Reveal>{features.map(([label, title, text], i) => <Reveal className={`feature-row ${i % 2 ? 'reverse' : ''}`} key={label}><div className="feature-copy"><span className="feature-label">{label}</span><h3>{title}</h3><p>{text}</p><a className="text-link" href="#access">Explore {label.toLowerCase()} <ArrowRight size={15} /></a></div><div className="node-visual" aria-hidden="true"><svg viewBox="0 0 420 240"><path d={i === 0 ? 'M30 160 C110 20 180 220 260 70 S350 110 400 35' : i === 1 ? 'M20 90 C90 90 100 190 180 150 S250 20 400 130' : 'M30 180 C110 180 120 60 210 90 S300 180 400 55'} /><circle cx="30" cy={i === 0 ? 160 : i === 1 ? 90 : 180} r="5" /><circle cx="400" cy={i === 0 ? 35 : i === 1 ? 130 : 55} r="5" /></svg></div></Reveal>)}</section>
    <section className="section-shell governance" id="governance"><Reveal><p className="eyebrow">ALWAYS-ON INTELLIGENCE</p><h2>The map changes.<br />Your clarity doesn&apos;t.</h2><p className="section-intro">Axon continuously discovers, contextualizes, and prioritizes every exposure across your AI environment. No blind spots. No alert fatigue.</p></Reveal></section>
    <section className="section-shell process" id="discovery"><Reveal><p className="eyebrow">FROM SIGNAL TO ACTION</p><h2>Move from<br />unknown to known.</h2></Reveal><div className="steps">{[['01', 'Discover', 'Map every asset, identity, and relationship.'], ['02', 'Understand', 'Connect the dots to reveal meaningful risk.'], ['03', 'Act', 'Prioritize the fixes that reduce exposure fastest.']].map(([num, title, text]) => <Reveal className="step" key={num}><span className="step-num">{num}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={18} /></Reveal>)}</div></section>
    <section className="access section-shell" id="access"><Reveal><p className="eyebrow">THE FUTURE OF SECURITY STARTS HERE</p><h2>See what you&apos;re<br />missing.</h2>{submitted ? <p className="success-message">You&apos;re on the list. We&apos;ll be in touch soon.</p> : <form onSubmit={submit}><label htmlFor="email">WORK EMAIL</label><div className="email-row"><input id="email" type="email" required placeholder="you@company.com" /><button className="button button-primary">Request access <ArrowRight size={16} /></button></div></form>}</Reveal></section>
    <footer className="footer section-shell"><a href="#top"><AxonMark compact /></a><span>© 2026 Axon Security, Inc.</span><a href="#access">Contact</a></footer>
  </main>
}
