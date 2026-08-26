'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import PillButton from '@/components/layout/PillButton'
import Magnetic from '@/components/motion/Magnetic'
import Reveal from '@/components/motion/Reveal'
import DisplayHeading from '@/components/typography/DisplayHeading'
import { ArrowRight } from '@/components/icons'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      execute: (widgetId: string) => void
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

type Status = 'idle' | 'submitting' | 'success'

const ERROR_COPY: Record<string, string> = {
  invalid_email: 'Enter a valid work email.',
  rate_limited: 'Too many attempts. Try again in a few minutes.',
  email_not_configured: 'Service is being set up. Please try again shortly.',
  email_failed:
    "Couldn't send confirmation — your request was received and we'll follow up.",
}

const POINTS = [
  'A direct line to the founding engineers',
]

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function AccessForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>('')
  const tokenRef = useRef<string>('')
  const mountedAtRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return

    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        clearInterval(interval)
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
          callback: (token: string) => {
            tokenRef.current = token
          },
          'expired-callback': () => {
            tokenRef.current = ''
          },
          'error-callback': () => {
            tokenRef.current = ''
          },
        })
      }
      if (attempts > 50) clearInterval(interval)
    }, 200)

    return () => {
      clearInterval(interval)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  function waitForTurnstileToken(timeoutMs = 10_000): Promise<string> {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || !widgetIdRef.current) {
      return Promise.resolve('')
    }

    tokenRef.current = ''
    window.turnstile.execute(widgetIdRef.current)

    return new Promise<string>((resolve) => {
      const start = Date.now()
      const poll = setInterval(() => {
        if (tokenRef.current || Date.now() - start > timeoutMs) {
          clearInterval(poll)
          resolve(tokenRef.current || '')
        }
      }, 50)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    setStatus('submitting')

    const turnstileToken = await waitForTurnstileToken()

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          company_website: data.get('company_website'),
          turnstileToken: turnstileToken || undefined,
          ts: mountedAtRef.current,
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
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    } catch {
      setErrorMessage('Something went wrong. Try again.')
      setStatus('idle')
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
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
              Get early access.
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
                You&apos;re on the list. We&apos;ll reach out within 2–3
                business days to schedule your teardown.
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
                      Request early access <ArrowRight size={16} />
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
                {TURNSTILE_SITE_KEY ? (
                  <div ref={turnstileRef} className="hp-field" aria-hidden="true" />
                ) : null}
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
