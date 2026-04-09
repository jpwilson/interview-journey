'use client'

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

interface Props {
  roles: RoleWithRelations[]
}

export function CareerTimeline({ roles }: Props) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-400">No roles to display yet.</p>
        <p className="mt-1 text-sm text-slate-500">Your career timeline will appear here as you track roles.</p>
      </div>
    )
  }

  // Group by company, then sort by date
  const byCompany = roles.reduce<Record<string, RoleWithRelations[]>>((acc, role) => {
    const key = role.company.name
    if (!acc[key]) acc[key] = []
    acc[key].push(role)
    return acc
  }, {})

  const companies = Object.entries(byCompany)

  // Find overall date range for axis positioning
  const allDates = roles.flatMap((r) => [
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
    <div className="overflow-x-auto">
      {/* Time axis */}
      <div className="mb-6 ml-40 flex justify-between border-b border-slate-700 pb-2 text-xs text-slate-500">
        <span>{format(minDate, 'MMM yyyy')}</span>
        <span>{format(maxDate, 'MMM yyyy')}</span>
      </div>

      {/* Rows */}
      <div className="space-y-6">
        {companies.map(([companyName, companyRoles]) => (
          <div key={companyName} className="flex items-start gap-4">
            {/* Company label */}
            <div className="w-36 shrink-0 pt-1 text-right">
              <p className="truncate text-sm font-medium text-white">{companyName}</p>
            </div>

            {/* Timeline row */}
            <div className="relative flex-1 py-2">
              {/* Base line */}
              <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-slate-700" />

              {/* Role blocks */}
              {companyRoles.map((role) => {
                const startDate = role.applied_at ?? role.created_at
                const left = positionPercent(startDate)
                const events = role.role_events.sort(
                  (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                )

                return (
                  <div key={role.id}>
                    {/* Events as dots */}
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${positionPercent(event.event_date)}%` }}
                      >
                        <div className={`h-3 w-3 rounded-full ${STAGE_COLORS[role.stage] ?? 'bg-slate-500'} ring-2 ring-slate-900`} />
                      </div>
                    ))}

                    {/* Role label at start */}
                    <Link href={`/roles/${role.id}`}>
                      <div
                        className="absolute -top-6 -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${left}%` }}
                      >
                        <span className="rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-300 hover:text-white">
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
                        className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-500'} text-white text-xs px-1 py-0`}
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
            <span className="text-xs capitalize text-slate-400">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
