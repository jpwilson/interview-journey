'use client'

import { useMemo, useState } from 'react'

export type FunnelRole = {
  stage: string // exploring | applied | screening | interviewing | offer | negotiating | resolved
  applied_at: string | null
  created_at: string
  last_contact_at: string | null
  resolved_at: string | null
}

type Range = '30d' | '90d' | '180d' | 'all'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const RANGE_OPTS: { id: Range; label: string }[] = [
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: '180d', label: '180d' },
  { id: 'all', label: 'All time' },
]

export function FunnelBlock({
  roles,
  defaultRange = '90d',
}: {
  roles: FunnelRole[]
  defaultRange?: Range
}) {
  const [range, setRange] = useState<Range>(defaultRange)

  const filtered = useMemo(() => {
    if (range === 'all') return roles
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 180
    const cutoff = daysAgo(days)
    return roles.filter((r) => {
      const d = new Date(r.applied_at ?? r.created_at)
      return d >= cutoff
    })
  }, [roles, range])

  // Captured once on mount so the component stays pure across re-renders.
  const [now] = useState(() => Date.now())

  const counts = useMemo(() => {
    let applied = 0
    let silent = 0
    let screen = 0
    let diligence = 0
    let offer = 0
    const ms30d = 30 * 24 * 3600 * 1000

    for (const r of filtered) {
      applied += 1
      if (r.stage === 'offer' || r.stage === 'negotiating') offer += 1
      else if (r.stage === 'interviewing') diligence += 1
      else if (r.stage === 'screening') screen += 1
      else if ((r.stage === 'applied' || r.stage === 'exploring') && !r.last_contact_at) {
        // Silent: applied/exploring with no contact in 30+ days
        const last = new Date(r.last_contact_at ?? r.applied_at ?? r.created_at).getTime()
        if (now - last > ms30d) silent += 1
      }
    }
    const replies = applied - silent
    const replyPct = applied > 0 ? Math.round((replies / applied) * 100) : 0
    return { applied, silent, screen, diligence, offer, replies, replyPct }
  }, [filtered, now])

  const stages = [
    {
      key: 'Applied',
      n: counts.applied,
      hint: range === 'all' ? 'all time' : `in last ${range}`,
      positive: false,
    },
    { key: 'No reply', n: counts.silent, hint: 'silent 30+ days', positive: false },
    { key: 'Screening', n: counts.screen, hint: 'got a reply', positive: true },
    { key: 'Interviewing', n: counts.diligence, hint: 'in diligence', positive: true },
    { key: 'Offer', n: counts.offer, hint: 'on the table', positive: true },
  ]
  const maxN = Math.max(1, counts.applied)

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
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
            {range === 'all' ? 'The funnel' : `${range} funnel`}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              marginTop: 4,
              color: 'var(--ink)',
            }}
          >
            {counts.applied} applications → {counts.replies} replies ({counts.replyPct}%) →{' '}
            <span style={{ color: 'var(--accent-ij-ink)', fontWeight: 500 }}>
              {counts.diligence + counts.offer} in diligence
            </span>{' '}
            → {counts.offer} offer{counts.offer === 1 ? '' : 's'}
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid var(--paper-ink)',
            borderRadius: 999,
            padding: 2,
            background: 'var(--paper)',
          }}
        >
          {RANGE_OPTS.map((o) => {
            const active = range === o.id
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setRange(o.id)}
                style={{
                  padding: '3px 10px',
                  fontSize: 11,
                  borderRadius: 999,
                  border: 'none',
                  background: active ? 'var(--accent-ij-ink)' : 'transparent',
                  color: active ? '#fff' : 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 10 }}
      >
        {stages.map((s) => {
          const pct = Math.max(4, (s.n / maxN) * 100)
          return (
            <div key={s.key}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: s.positive ? 'var(--accent-ij-ink)' : 'var(--ink)',
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-4)',
                  marginTop: 4,
                }}
              >
                {s.key}
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--paper-2)',
                  marginTop: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: s.positive ? 'var(--accent-ij)' : 'var(--ink-5)',
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 6 }}>{s.hint}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
