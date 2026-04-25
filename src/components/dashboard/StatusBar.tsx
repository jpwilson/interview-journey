'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type SearchStatus = 'happy' | 'open' | 'active'

const STATUS_OPTS: { id: SearchStatus; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'open', label: 'Open to better' },
  { id: 'active', label: 'Actively looking' },
]

function fmtTenure(startISO: string | null | undefined) {
  if (!startISO) return null
  const s = new Date(startISO)
  const n = new Date()
  const m = (n.getFullYear() - s.getFullYear()) * 12 + (n.getMonth() - s.getMonth())
  if (m < 0) return null
  const y = Math.floor(m / 12)
  const mm = m % 12
  return [y && `${y}y`, mm && `${mm}mo`].filter(Boolean).join(' ') || '0mo'
}

function fmtStartDate(startISO: string | null | undefined) {
  if (!startISO) return null
  return new Date(startISO).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fmtDateLong(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function StatusBar({
  displayName,
  currentEmployer,
  currentTitle,
  employmentStartDate,
  searchStatus: initialStatus,
  userId,
}: {
  displayName: string
  currentEmployer: string | null
  currentTitle: string | null
  employmentStartDate: string | null
  searchStatus: SearchStatus | null
  userId: string
}) {
  const [status, setStatus] = useState<SearchStatus>(initialStatus ?? 'open')
  const [pending, startTransition] = useTransition()
  const supabase = createClient()

  async function updateStatus(next: SearchStatus) {
    setStatus(next) // optimistic
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ search_status: next })
        .eq('id', userId)
      if (error) {
        // Column may not exist yet if migration not applied — swallow silently, keep optimistic
        console.warn('search_status update skipped:', error.message)
      }
    })
  }

  const tenure = fmtTenure(employmentStartDate)
  const startPretty = fmtStartDate(employmentStartDate)

  return (
    <section
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--paper-ink)',
        padding: '18px 22px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            {fmtDateLong(new Date())}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              fontWeight: 500,
              color: 'var(--ink)',
              marginTop: 4,
              letterSpacing: -0.3,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 6,
              fontSize: 12,
              color: 'var(--ink-3)',
              flexWrap: 'wrap',
            }}
          >
            {currentEmployer ? (
              <>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'var(--accent-ij-wash)',
                    color: 'var(--accent-ij-ink)',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-ij)',
                    }}
                  />
                  At {currentEmployer}
                  {startPretty && ` since ${startPretty}`}
                </span>
                {currentTitle && (
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}
                  >
                    · {currentTitle}
                  </span>
                )}
                {tenure && (
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}
                  >
                    · {tenure} tenure
                  </span>
                )}
              </>
            ) : (
              <a
                href="/settings"
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--paper-2)',
                  color: 'var(--ink-3)',
                  fontSize: 11,
                  textDecoration: 'none',
                  border: '1px dashed var(--paper-ink)',
                }}
              >
                + Set your current role
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            Search status
          </div>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid var(--paper-ink)',
              borderRadius: 999,
              padding: 2,
              background: 'var(--paper)',
              opacity: pending ? 0.8 : 1,
            }}
          >
            {STATUS_OPTS.map((s) => {
              const active = status === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateStatus(s.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    borderRadius: 999,
                    border: 'none',
                    background: active ? 'var(--accent-ij-ink)' : 'transparent',
                    color: active ? '#fff' : 'var(--ink-3)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: active ? 500 : 400,
                    transition: 'all 150ms ease',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href="/documents/drop"
              style={{
                padding: '5px 10px',
                fontSize: 12,
                border: '1px solid var(--paper-ink)',
                borderRadius: 4,
                background: 'var(--card)',
                color: 'var(--ink-2)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={12} /> Drop a doc
            </a>
            <a
              href="/roles/new"
              style={{
                padding: '5px 10px',
                fontSize: 12,
                border: 'none',
                borderRadius: 4,
                background: 'var(--accent-ij-ink)',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500,
              }}
            >
              <Plus size={12} /> New application
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
