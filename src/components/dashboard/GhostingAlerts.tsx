'use client'

import { useTransition } from 'react'
import { markFollowUpSent } from '@/lib/actions/followUp'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import type { AlertRole } from '@/lib/alerts'

export type { AlertRole }

function GhostingAlertRow({ role }: { role: AlertRole }) {
  const [isPending, startTransition] = useTransition()

  if (role._alertType === 'deadline') {
    const deadlineDate = role.offer_deadline
      ? format(new Date(role.offer_deadline), 'MMM d')
      : ''
    const days = role._daysUntilDeadline ?? 0

    return (
      <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-700/40 bg-amber-900/20 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg" aria-hidden="true">⏰</span>
          <div>
            <p className="font-medium text-white">
              {role.company.name} — {role.role_title}
            </p>
            <p className="mt-0.5 text-sm text-amber-300">
              Offer expires in {days} {days === 1 ? 'day' : 'days'} — {deadlineDate}
            </p>
          </div>
        </div>
        <Link
          href={`/roles/${role.id}`}
          className="shrink-0 rounded-md bg-amber-700/30 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-700/50"
        >
          View offer
        </Link>
      </div>
    )
  }

  const days = role._daysSinceContact ?? 0

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-600/40 bg-slate-800/60 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg" aria-hidden="true">👻</span>
        <div>
          <p className="font-medium text-white">
            {role.company.name} — {role.role_title}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">
            No contact in {days} {days === 1 ? 'day' : 'days'} — consider following up
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        className="shrink-0 border border-slate-600 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
        onClick={() => {
          startTransition(() => markFollowUpSent(role.id))
        }}
      >
        {isPending ? 'Saving…' : 'Follow up sent'}
      </Button>
    </div>
  )
}

interface GhostingAlertsProps {
  roles: AlertRole[]
}

export function GhostingAlerts({ roles }: GhostingAlertsProps) {
  if (roles.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-400">
        <span aria-hidden="true">⚠️</span> Needs attention ({roles.length})
      </h2>
      <div className="space-y-2">
        {roles.map((role) => (
          <GhostingAlertRow key={`${role.id}-${role._alertType}`} role={role} />
        ))}
      </div>
    </div>
  )
}

