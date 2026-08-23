'use client'

import { useState, type FormEvent } from 'react'
import PillButton from '@/components/layout/PillButton'
import Reveal from '@/components/Reveal'
import { ArrowRight } from '@/components/icons'
import DisplayHeading from '@/components/typography/DisplayHeading'
import Eyebrow from '@/components/typography/Eyebrow'

export default function AccessForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="access section-shell" id="access">
      <Reveal>
        <Eyebrow>The future of security starts here</Eyebrow>
        <DisplayHeading secondary>
          See what you&apos;re
          <br />
          missing.
        </DisplayHeading>
        {submitted ? (
          <p className="success-message">
            You&apos;re on the list. We&apos;ll be in touch soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">WORK EMAIL</label>
            <div className="email-row">
              <input
                id="email"
                type="email"
                required
                placeholder="you@company.com"
              />
              <PillButton type="submit">
                Request access <ArrowRight size={16} />
              </PillButton>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  )
}
