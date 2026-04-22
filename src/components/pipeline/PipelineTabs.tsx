'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Columns3, Table2 } from 'lucide-react'
import type { RoleWithCompany } from '@/lib/supabase/types'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'

type Tab = 'table' | 'board'

const STAGE_LABEL: Record<string, string> = {
  exploring: 'exploring',
  applied: 'applied',
  screening: 'screening',
  interviewing: 'interviewing',
  offer: 'offer',
  negotiating: 'negotiating',
  resolved: 'resolved',
}

const STAGE_COLOR: Record<string, string> = {
  exploring: 'var(--s-exploring)',
  applied: 'var(--s-applied)',
  screening: 'var(--s-screening)',
  interviewing: 'var(--s-interview)',
  offer: 'var(--s-offer)',
  negotiating: 'var(--s-negotiate)',
  resolved: 'var(--ink-5)',
}

const RESOLUTION_COLOR: Record<string, string> = {
  hired: 'var(--s-hired)',
  rejected: 'var(--s-rejected)',
  withdrew: 'var(--s-withdrew)',
  ghosted: 'var(--s-ghosted)',
  declined: 'var(--s-declined)',
}

type Filter = 'all' | 'active' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'resolved'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'resolved', label: 'Closed' },
]

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

  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      {/* Page header */}
      <div
        style={{
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--paper-ink)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
          flexWrap: 'wrap',
          background: 'var(--card)',
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
            Pipeline
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 26,
              fontWeight: 500,
              color: 'var(--ink)',
              marginTop: 4,
              letterSpacing: -0.3,
            }}
          >
            Every application, every outcome.
          </h1>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4, maxWidth: 640 }}>
            A job search is a sales funnel. Most leads go cold — that&apos;s normal. The table is where
            history lives; the board is what&apos;s active.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid var(--paper-ink)',
              borderRadius: 6,
              padding: 2,
              background: 'var(--paper)',
            }}
          >
            <TabButton active={tab === 'table'} onClick={() => switchTab('table')} icon={<Table2 size={13} />} label="Table" />
            <TabButton active={tab === 'board'} onClick={() => switchTab('board')} icon={<Columns3 size={13} />} label="Board" />
          </div>

          <Link
            href="/roles/new"
            style={{
              padding: '6px 12px',
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
            <Plus size={13} /> Add role
          </Link>
        </div>
      </div>

      {tab === 'table' ? <PipelineTable roles={initialRoles} /> : <BoardView roles={initialRoles} />}
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

  const filtered = useMemo(() => {
    let list = roles
    if (filter === 'active') list = list.filter((r) => r.stage !== 'resolved')
    else if (filter === 'resolved') list = list.filter((r) => r.stage === 'resolved')
    else if (filter !== 'all') list = list.filter((r) => r.stage === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (r) =>
          r.company.name.toLowerCase().includes(q) ||
          r.role_title.toLowerCase().includes(q) ||
          (r.location ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [roles, filter, query])

  // Grouped counts for the filter pills
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: roles.length,
      active: roles.filter((r) => r.stage !== 'resolved').length,
      applied: roles.filter((r) => r.stage === 'applied' || r.stage === 'exploring').length,
      screening: roles.filter((r) => r.stage === 'screening').length,
      interviewing: roles.filter((r) => r.stage === 'interviewing').length,
      offer: roles.filter((r) => r.stage === 'offer' || r.stage === 'negotiating').length,
      resolved: roles.filter((r) => r.stage === 'resolved').length,
    }
    return c
  }, [roles])

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          padding: '12px 22px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-soft)',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--paper-ink)'}`,
                  borderRadius: 999,
                  background: active ? 'var(--ink)' : 'var(--paper)',
                  color: active ? '#fff' : 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {f.label}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.6 }}>
                  {counts[f.id]}
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
              gridTemplateColumns: '2fr 2fr 1.4fr 1.2fr 1.2fr 1fr 1.2fr',
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
            <div>Stage</div>
            <div>Applied</div>
            <div>Last contact</div>
            <div>Source</div>
            <div>Comp</div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', color: 'var(--ink-4)', fontSize: 13, textAlign: 'center' }}>
              No matches. {query && <button type="button" onClick={() => setQuery('')} style={{ color: 'var(--accent-ij-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear search</button>}
            </div>
          ) : (
            filtered.map((r, i) => <TableRow key={r.id} role={r} isLast={i === filtered.length - 1} />)
          )}
        </div>
        <div style={{ marginTop: 12, textAlign: 'right', fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} of {roles.length} · {counts.resolved} resolved history
        </div>
      </div>
    </div>
  )
}

function TableRow({ role, isLast }: { role: RoleWithCompany; isLast: boolean }) {
  const isResolved = role.stage === 'resolved'
  const resolution = role.resolution ?? null
  const stageLabel = isResolved && resolution ? resolution : STAGE_LABEL[role.stage] ?? role.stage
  const color = isResolved && resolution ? RESOLUTION_COLOR[resolution] ?? 'var(--ink-5)' : STAGE_COLOR[role.stage]

  return (
    <Link
      href={`/roles/${role.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1.4fr 1.2fr 1.2fr 1fr 1.2fr',
        gap: 12,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
        alignItems: 'center',
        textDecoration: 'none',
        color: isResolved ? 'var(--ink-4)' : 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        transition: 'background 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 4,
            background: 'var(--paper-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--ink-3)',
            flexShrink: 0,
          }}
        >
          {role.company.name[0]}
        </div>
        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {role.company.name}
        </span>
      </div>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {role.role_title}
      </div>
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
          {stageLabel}
        </span>
        {isResolved && resolution && role.resolved_at && (
          <div style={{ fontSize: 10, color: 'var(--ink-5)', marginTop: 2 }}>
            {resolutionDescriptor(role)}
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
        {role.applied_at ? fmtShortDate(role.applied_at) : '—'}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
        {role.last_contact_at ? relativeShort(role.last_contact_at) : '—'}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {role.source ?? '—'}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {role.salary_min && role.salary_max
          ? `$${Math.round(role.salary_min / 1000)}–${Math.round(role.salary_max / 1000)}k`
          : '—'}
      </div>
    </Link>
  )
}

function resolutionDescriptor(role: RoleWithCompany): string {
  if (!role.resolution) return ''
  // Try to guess "died at" stage from the resolution + simple signals
  const verb = role.resolution === 'hired' ? 'hired' : role.resolution
  const at = role.resolved_at ? ` · ${fmtShortDate(role.resolved_at)}` : ''
  return `${verb}${at}`
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function relativeShort(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const day = 24 * 3600 * 1000
  if (ms < day) return 'today'
  const days = Math.floor(ms / day)
  if (days < 7) return `${days}d ago`
  if (days < 60) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function BoardView({ roles }: { roles: RoleWithCompany[] }) {
  // Board shows only active roles; KanbanBoard component already filters
  const active = roles.filter((r) => r.stage !== 'resolved')
  return (
    <div style={{ padding: '20px 22px 40px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>
        Showing {active.length} active {active.length === 1 ? 'role' : 'roles'}. Resolved history lives in
        the <span style={{ color: 'var(--accent-ij-ink)' }}>Table</span> view.
      </div>
      <KanbanBoard initialRoles={active} />
    </div>
  )
}
