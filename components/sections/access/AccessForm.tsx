'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import Pill from '@/components/ui/Pill'
import AccessSuccess from './AccessSuccess'

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
  email_failed: "Couldn't send confirmation — your request was received and we'll follow up.",
}

const NOTE_MAX = 500

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function AccessForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [noteLength, setNoteLength] = useState(0)
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
          note: data.get('note'),
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
    <div className="acc-form-col">
      {status === 'success' ? (
        <AccessSuccess />
      ) : (
        <form className="acc-form" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
          <div className="acc-field">
            <div className="acc-control">
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder=" "
                className="acc-input"
                aria-invalid={errorMessage === ERROR_COPY.invalid_email ? true : undefined}
              />
              <label htmlFor="email" className="acc-label mono">
                Work email
              </label>
              <span className="acc-underline" aria-hidden="true" />
            </div>
          </div>

          <div className="acc-field acc-field-note">
            <div className="acc-control">
              <textarea
                id="note"
                name="note"
                maxLength={NOTE_MAX}
                rows={3}
                placeholder=" "
                className="acc-input acc-textarea"
                onChange={(event) => setNoteLength(event.target.value.length)}
                aria-describedby="note-count"
              />
              <label htmlFor="note" className="acc-label mono">
                What are you working on? <span className="acc-optional">Optional</span>
              </label>
              <span className="acc-underline" aria-hidden="true" />
            </div>
            <div className="acc-note-meta">
              <span className="acc-hint">
                e.g. Claude Code and Cursor across the fleet, a few MCP servers, some LangGraph agents.
              </span>
              <span id="note-count" className="acc-count mono tabular" aria-live="off">
                <span className={noteLength > 0 ? 'acc-count-now' : ''}>{noteLength}</span>/{NOTE_MAX}
              </span>
            </div>
          </div>

          <div className="hp-field acc-hp" aria-hidden="true">
            <label htmlFor="company_website">Company website</label>
            <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {TURNSTILE_SITE_KEY ? (
            <div ref={turnstileRef} className="hp-field acc-hp" aria-hidden="true" />
          ) : null}

          {errorMessage ? (
            <p className="acc-error mono" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="acc-actions">
            <Pill type="submit" disabled={status === 'submitting'} cursor="SEND">
              {status === 'submitting' ? 'Sending' : 'Get covered'}
            </Pill>
            <p className="acc-fine mono">Read-only · In your tenant · No content leaves</p>
          </div>
        </form>
      )}
    </div>
  )
}
