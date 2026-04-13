'use client'

import { useState } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Role, Company, RoleEvent } from '@/lib/supabase/types'

type RoleWithRelations = Role & {
  company: Company
  role_events: RoleEvent[]
}

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-400',
  applied: 'bg-slate-500',
  screening: 'bg-yellow-500',
  interviewing: 'bg-blue-500',
  offer: 'bg-purple-500',
  negotiating: 'bg-indigo-500',
  resolved: 'bg-slate-400',
}

const STAGE_DOT_RING: Record<string, string> = {
  exploring: 'ring-slate-200',
  applied: 'ring-slate-200',
  screening: 'ring-yellow-100',
  interviewing: 'ring-blue-100',
  offer: 'ring-purple-100',
  negotiating: 'ring-indigo-100',
  resolved: 'ring-slate-200',
}

type FilterKey =
  | 'all'
  | 'active'
  | 'hired'
  | 'rejected'
  | 'withdrew'
  | 'ghosted'
  | 'exploring'
  | 'interviewing'
  | 'offer'
  | 'declined'

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrew', label: 'Withdrew' },
  { key: 'ghosted', label: 'Ghosted' },
  { key: 'exploring', label: 'Exploring' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
  { key: 'declined', label: 'Declined' },
]

function matchesFilter(role: RoleWithRelations, filter: FilterKey): boolean {
  switch (filter) {
    case 'all': return true
    case 'active': return role.stage !== 'resolved'
    case 'hired': return role.resolution === 'hired'
    case 'rejected': return role.resolution === 'rejected'
    case 'withdrew': return role.resolution === 'withdrew'
    case 'ghosted': return role.resolution === 'ghosted'
    case 'exploring': return role.stage === 'exploring'
    case 'interviewing': return role.stage === 'interviewing'
    case 'offer': return role.stage === 'offer' || role.stage === 'negotiating'
    case 'declined': return role.resolution === 'offer_declined'
    default: return true
  }
}

interface Props {
  roles: RoleWithRelations[]
}

export function CareerTimeline({ roles }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all')

  const filteredRoles = roles.filter((r) => matchesFilter(r, filter))

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-400">No roles to display yet.</p>
        <p className="mt-1 text-sm text-slate-500">Your career timeline will appear here as you track roles.</p>
      </div>
    )
  }

  // Filter bar
  const filterBar = (
    <div className="mb-6 flex flex-wrap gap-2">
      {FILTER_LABELS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={
            filter === key
              ? 'rounded-full px-4 py-1.5 text-sm font-medium bg-sky-600 text-white transition-colors'
              : 'rounded-full px-4 py-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-sky-300 transition-colors'
          }
        >
          {label}
        </button>
      ))}
    </div>
  )

  if (filteredRoles.length === 0) {
    return (
      <div>
        {filterBar}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-400">No roles match this filter.</p>
        </div>
      </div>
    )
  }

  // Group by company id
  const byCompany = filteredRoles.reduce<Record<string, { name: string; id: string; roles: RoleWithRelations[] }>>((acc, role) => {
    const key = role.company.id
    if (!acc[key]) acc[key] = { name: role.company.name, id: role.company.id, roles: [] }
    acc[key].roles.push(role)
    return acc
  }, {})

  const companies = Object.values(byCompany)

  const allDates = filteredRoles.flatMap((r) => [
    r.applied_at ?? r.created_at,
    ...r.role_events.map((e) => e.event_date),
  ]).filter(Boolean).map((d) => parseISO(d!))

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))
  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1)

  function positionPercent(date: string): number {
    const d = parseISO(date)
    return (differenceInDays(d, minDate) / totalDays) * 100
  }

  return (
    <div>
      {filterBar}

      <div className="overflow-x-auto">
        {/* Time axis */}
        <div className="mb-6 ml-40 flex justify-between border-b border-slate-200 pb-2 text-xs text-slate-400">
          <span>{format(minDate, 'MMM yyyy')}</span>
          <span>{format(maxDate, 'MMM yyyy')}</span>
        </div>

        {/* Rows */}
        <div className="space-y-6">
          {companies.map(({ name: companyName, id: companyId, roles: companyRoles }) => (
            <div key={companyId} className="flex items-start gap-4">
              {/* Company label */}
              <div className="w-36 shrink-0 pt-1 text-right">
                <Link
                  href={`/companies/${companyId}`}
                  className="truncate text-sm font-semibold text-sky-700 hover:text-sky-600 transition-colors block"
                >
                  {companyName}
                </Link>
              </div>

              {/* Timeline row */}
              <div className="relative flex-1 py-2">
                {/* Base line */}
                <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-slate-200" />

                {/* Role blocks */}
                {companyRoles.map((role) => {
                  const startDate = role.applied_at ?? role.created_at
                  const left = positionPercent(startDate)
                  const events = role.role_events.sort(
                    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                  )
                  const dotColor = STAGE_COLORS[role.stage] ?? 'bg-slate-400'
                  const ringColor = STAGE_DOT_RING[role.stage] ?? 'ring-slate-100'

                  return (
                    <div key={role.id}>
                      {/* Events as dots */}
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${positionPercent(event.event_date)}%` }}
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${dotColor} ring-2 ${ringColor}`}
                            title={event.title}
                          />
                        </div>
                      ))}

                      {/* Role label at start */}
                      <Link href={`/roles/${role.id}`}>
                        <div
                          className="absolute -top-6 -translate-x-1/2 whitespace-nowrap"
                          style={{ left: `${left}%` }}
                        >
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                            {role.role_title}
                          </span>
                        </div>
                      </Link>

                      {/* Stage badge at start */}
                      <div
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${left}%` }}
                      >
                        <Badge
                          className={`${dotColor} text-white text-xs px-1 py-0`}
                        >
                          {role.stage}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap gap-3">
          {Object.entries(STAGE_COLORS).map(([stage, color]) => (
            <div key={stage} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-xs capitalize text-slate-500">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
