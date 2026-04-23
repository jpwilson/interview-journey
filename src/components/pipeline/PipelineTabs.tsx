'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Columns3, Table2 } from 'lucide-react'
import type { RoleWithCompany } from '@/lib/supabase/types'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'

type Tab = 'table' | 'board'

// Effective stage for display + filtering — collapses resolution into one word
type EffectiveStage =
  | 'exploring'
  | 'applied'
  | 'silent'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'negotiating'
  | 'hired'
  | 'rejected'
  | 'withdrew'
  | 'ghosted'
  | 'declined'

const STAGE_COLOR: Record<EffectiveStage, string> = {
  exploring: 'var(--s-exploring)',
  applied: 'var(--s-applied)',
  silent: 'var(--ink-5)',
  screening: 'var(--s-screening)',
  interviewing: 'var(--s-interview)',
  offer: 'var(--s-offer)',
  negotiating: 'var(--s-negotiate)',
  hired: 'var(--s-hired)',
  rejected: 'var(--s-rejected)',
  withdrew: 'var(--s-withdrew)',
  ghosted: 'var(--s-ghosted)',
  declined: 'var(--s-declined)',
}

const MS_30D = 30 * 24 * 3600 * 1000

function silentDays(role: RoleWithCompany): number | null {
  const ref = role.last_contact_at ?? role.applied_at ?? role.created_at
  if (!ref) return null
  return Math.floor((Date.now() - new Date(ref).getTime()) / (24 * 3600 * 1000))
}

function effectiveStage(role: RoleWithCompany): EffectiveStage {
  if (role.stage === 'resolved') {
    const r = role.resolution
    if (r === 'hired') return 'hired'
    if (r === 'rejected') return 'rejected'
    if (r === 'withdrew') return 'withdrew'
    if (r === 'ghosted') return 'ghosted'
    if (r === 'offer_declined') return 'declined'
    return 'withdrew'
  }
  if (role.stage === 'applied' || role.stage === 'exploring') {
    const d = silentDays(role)
    if (d != null && d >= 30) return 'silent'
    return role.stage as EffectiveStage
  }
  return role.stage as EffectiveStage
}

type Filter = 'all' | 'diligence' | 'screening' | 'silent' | 'rejected' | 'offer'

export function PipelineTabs({
  initialRoles,
  initialTab,
}: {
  initialRoles: RoleWithCompany[]
  initialTab: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const router = useRouter()
  const searchParams = useSearchParams()

  function switchTab(next: Tab) {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`/pipeline?${params.toString()}`, { scroll: false })
  }

  const total = initialRoles.length

  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      {/* Page header */}
      <div
        style={{
          padding: '24px 22px 18px',
          borderBottom: '1px solid var(--paper-ink)',
          background: 'var(--card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 480px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            Page · Application pipeline
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 30,
              fontWeight: 500,
              color: 'var(--ink)',
              marginTop: 4,
              letterSpacing: -0.3,
            }}
          >
            {total} {total === 1 ? 'lead' : 'leads'} · your job-search CRM
          </h1>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, maxWidth: 720 }}>
            Sales reps contact thousands to close a few. Same here. Keep adding leads.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid var(--paper-ink)',
              borderRadius: 6,
              padding: 2,
              background: 'var(--paper)',
            }}
          >
            <TabButton
              active={tab === 'table'}
              onClick={() => switchTab('table')}
              icon={<Table2 size={13} />}
              label="Table"
            />
            <TabButton
              active={tab === 'board'}
              onClick={() => switchTab('board')}
              icon={<Columns3 size={13} />}
              label="Board"
            />
          </div>
          <Link
            href="/roles/new"
            style={{
              padding: '7px 12px',
              fontSize: 12,
              border: 'none',
              borderRadius: 4,
              background: 'var(--accent-ij-ink)',
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Plus size={13} /> New application
          </Link>
        </div>
      </div>

      {tab === 'table' ? (
        <PipelineTable roles={initialRoles} />
      ) : (
        <BoardView roles={initialRoles} />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        fontSize: 12,
        fontFamily: 'var(--font-sans)',
        border: 'none',
        borderRadius: 4,
        background: active ? 'var(--card)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: active ? '0 1px 2px rgba(28,25,23,0.06)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function PipelineTable({ roles }: { roles: RoleWithCompany[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  // Enrich each role with its effective stage once
  const enriched = useMemo(
    () => roles.map((r) => ({ role: r, eff: effectiveStage(r), silent: silentDays(r) })),
    [roles]
  )

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0,
      diligence: 0,
      screening: 0,
      silent: 0,
      rejected: 0,
      offer: 0,
    }
    for (const { eff } of enriched) {
      c.all += 1
      if (eff === 'interviewing' || eff === 'offer' || eff === 'negotiating') c.diligence += 1
      if (eff === 'screening') c.screening += 1
      if (eff === 'silent') c.silent += 1
      if (eff === 'rejected') c.rejected += 1
      if (eff === 'offer' || eff === 'negotiating') c.offer += 1
    }
    return c
  }, [enriched])

  const filtered = useMemo(() => {
    let list = enriched
    if (filter === 'diligence')
      list = list.filter((x) => ['interviewing', 'offer', 'negotiating'].includes(x.eff))
    else if (filter === 'screening') list = list.filter((x) => x.eff === 'screening')
    else if (filter === 'silent') list = list.filter((x) => x.eff === 'silent')
    else if (filter === 'rejected') list = list.filter((x) => x.eff === 'rejected')
    else if (filter === 'offer')
      list = list.filter((x) => x.eff === 'offer' || x.eff === 'negotiating')
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        ({ role: r }) =>
          r.company.name.toLowerCase().includes(q) ||
          r.role_title.toLowerCase().includes(q) ||
          (r.location ?? '').toLowerCase().includes(q)
      )
    }
    // Sort: active first by last activity desc, then resolved by resolved_at desc, then silent by silentDays desc
    return [...list].sort((a, b) => {
      const aResolved = ['hired', 'rejected', 'withdrew', 'ghosted', 'declined'].includes(a.eff)
      const bResolved = ['hired', 'rejected', 'withdrew', 'ghosted', 'declined'].includes(b.eff)
      if (aResolved !== bResolved) return aResolved ? 1 : -1
      const aT = new Date(
        a.role.last_contact_at ?? a.role.applied_at ?? a.role.created_at
      ).getTime()
      const bT = new Date(
        b.role.last_contact_at ?? b.role.applied_at ?? b.role.created_at
      ).getTime()
      return bT - aT
    })
  }, [enriched, filter, query])

  const FILTER_PILLS: { id: Filter; label: string; count: number; tone?: 'emphasis' }[] = [
    { id: 'all', label: 'All', count: counts.all, tone: 'emphasis' },
    { id: 'diligence', label: 'In diligence', count: counts.diligence },
    { id: 'screening', label: 'Screening', count: counts.screening },
    { id: 'silent', label: 'Silent', count: counts.silent },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
    { id: 'offer', label: 'Offer', count: counts.offer },
  ]

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          padding: '14px 22px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-soft)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
          {FILTER_PILLS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  border: `1px solid ${active ? (f.tone === 'emphasis' ? 'var(--accent-ij-ink)' : 'var(--ink)') : 'var(--paper-ink)'}`,
                  borderRadius: 999,
                  background: active
                    ? f.tone === 'emphasis'
                      ? 'var(--accent-ij-ink)'
                      : 'var(--ink)'
                    : 'var(--paper)',
                  color: active ? '#fff' : 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: active ? 500 : 400,
                }}
              >
                {f.label}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.7 }}>
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="Search company, role, location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '6px 10px',
            fontSize: 12,
            border: '1px solid var(--paper-ink)',
            borderRadius: 4,
            background: 'var(--paper)',
            color: 'var(--ink)',
            minWidth: 220,
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ padding: '0 22px 40px' }}>
        <div
          style={{
            marginTop: 16,
            background: 'var(--card)',
            border: '1px solid var(--paper-ink)',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1.8fr 0.9fr 1fr 1.1fr 1fr 0.8fr 0.6fr',
              gap: 12,
              padding: '10px 14px',
              background: 'var(--paper-2)',
              borderBottom: '1px solid var(--paper-ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            <div>Company</div>
            <div>Role</div>
            <div>Applied</div>
            <div>Source</div>
            <div>Stage</div>
            <div>Comp</div>
            <div>Remote</div>
            <div style={{ textAlign: 'right' }}>Silent</div>
          </div>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '48px 16px',
                color: 'var(--ink-4)',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              No matches.{' '}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{
                    color: 'var(--accent-ij-ink)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filtered.map(({ role, eff, silent }, i) => (
              <TableRow
                key={role.id}
                role={role}
                eff={eff}
                silent={silent}
                isLast={i === filtered.length - 1}
              />
            ))
          )}
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 11,
            color: 'var(--ink-4)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>
            {filtered.length} of {counts.all} · {counts.silent} silent · {counts.rejected} rejected
          </span>
          <span
            style={{ fontStyle: 'italic', fontFamily: 'var(--font-sans)', color: 'var(--ink-5)' }}
          >
            Tip: silent leads auto-archive after 30 days (configurable). They stay searchable
            forever — like old CRM leads, some come back around.
          </span>
        </div>
      </div>
    </div>
  )
}

function TableRow({
  role,
  eff,
  silent,
  isLast,
}: {
  role: RoleWithCompany
  eff: EffectiveStage
  silent: number | null
  isLast: boolean
}) {
  const resolved = ['hired', 'rejected', 'withdrew', 'ghosted', 'declined'].includes(eff)
  const color = STAGE_COLOR[eff]
  const silentCol =
    eff === 'silent' && silent != null ? (
      <span style={{ color: silent >= 45 ? 'var(--s-rejected)' : 'var(--ink-3)' }}>{silent}d</span>
    ) : eff === 'applied' && silent != null && silent > 0 ? (
      <span style={{ color: 'var(--ink-4)' }}>{silent}d</span>
    ) : (
      <span style={{ color: 'var(--ink-5)' }}>—</span>
    )
  const remote =
    role.remote_type === 'remote'
      ? 'remote'
      : role.remote_type === 'hybrid'
        ? 'hybrid'
        : role.remote_type === 'onsite'
          ? 'onsite'
          : '—'

  return (
    <Link
      href={`/roles/${role.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1.8fr 0.9fr 1fr 1.1fr 1fr 0.8fr 0.6fr',
        gap: 12,
        padding: '11px 14px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
        alignItems: 'center',
        textDecoration: 'none',
        color: resolved ? 'var(--ink-4)' : 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        transition: 'background 150ms ease',
      }}
    >
      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            background: 'var(--paper-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--ink-3)',
            flexShrink: 0,
          }}
        >
          {role.company.name[0]}
        </div>
        <span
          style={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {role.company.name}
        </span>
      </div>
      {/* Role */}
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {role.role_title}
      </div>
      {/* Applied */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
        {role.applied_at ? fmtShortDate(role.applied_at) : '—'}
      </div>
      {/* Source */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.04em',
          color: 'var(--ink-4)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {role.source ?? '—'}
      </div>
      {/* Stage (dot chip) */}
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color,
            background: `color-mix(in srgb, ${color} 12%, var(--paper))`,
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          <DoubleDot color={color} />
          {eff}
        </span>
        {resolved && role.resolved_at && (
          <div
            style={{
              fontSize: 9,
              color: 'var(--ink-5)',
              marginTop: 3,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {eff} · {fmtShortDate(role.resolved_at)}
          </div>
        )}
      </div>
      {/* Comp */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {role.salary_min && role.salary_max
          ? `$${Math.round(role.salary_min / 1000)}–${Math.round(role.salary_max / 1000)}k`
          : '—'}
      </div>
      {/* Remote */}
      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{remote}</div>
      {/* Silent */}
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {silentCol}
      </div>
    </Link>
  )
}

function DoubleDot({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, opacity: 0.5 }} />
    </span>
  )
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function BoardView({ roles }: { roles: RoleWithCompany[] }) {
  const active = roles.filter((r) => r.stage !== 'resolved')
  return (
    <div style={{ padding: '20px 22px 40px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>
        Showing {active.length} active {active.length === 1 ? 'role' : 'roles'}. Resolved history
        lives in the <span style={{ color: 'var(--accent-ij-ink)' }}>Table</span> view.
      </div>
      <KanbanBoard initialRoles={active} />
    </div>
  )
}
