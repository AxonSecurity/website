'use client'

import { useState, type FormEvent } from 'react'
import PillButton from '@/components/layout/PillButton'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import { ArrowRight } from '@/components/icons'

type Status = 'idle' | 'submitting' | 'success'

const ERROR_COPY: Record<string, string> = {
  invalid_email: 'Enter a valid work email.',
  rate_limited: 'Too many attempts. Try again in a few minutes.',
}

const POINTS = [
  'A 30-minute guided teardown of your AI surface',
  'Founding-partner pricing, locked in for life',
  'A direct line to the founding engineers',
]

export default function AccessForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('submitting')

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          company_website: data.get('company_website'),
        }),
      })
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
      } | null

      if (response.ok && payload?.ok) {
        setStatus('success')
        return
      }

      setErrorMessage(ERROR_COPY[payload?.error ?? ''] ?? 'Something went wrong. Try again.')
      setStatus('idle')
    } catch {
      setErrorMessage('Something went wrong. Try again.')
      setStatus('idle')
    }
  }

  return (
    <section className="access shell" id="access">
      <div className="access-inner">
        <div className="access-head">
          <Reveal>
            <p className="eyebrow">Early access</p>
          </Reveal>
          <Reveal delay={1}>
            <DisplayHeading level={2} wordReveal>
              See what you&apos;re missing.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={2}>
            <div className="access-points">
              {POINTS.map((point) => (
                <p className="access-point" key={point}>
                  {point}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="access-form-col">
          <Reveal delay={1}>
            {status === 'success' ? (
              <p className="success-message" role="status">
                You&apos;re on the list. We&apos;ll be in touch soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
                <label htmlFor="email">WORK EMAIL</label>
                <div className="email-row">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                  <Magnetic>
                    <PillButton type="submit" disabled={status === 'submitting'}>
                      Request access <ArrowRight size={16} />
                    </PillButton>
                  </Magnetic>
                </div>
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="company_website">Company website</label>
                  <input
                    id="company_website"
                    name="company_website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {errorMessage ? (
                  <p className="error-message" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
