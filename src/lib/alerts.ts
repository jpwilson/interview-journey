// Pure server-safe utility — no 'use client', no React, no browser APIs
import { differenceInDays } from 'date-fns'
import type { RoleWithCompany } from '@/lib/supabase/types'

export type AlertRole = RoleWithCompany & {
  _alertType: 'ghosted' | 'deadline'
  _daysSinceContact?: number
  _daysUntilDeadline?: number
}

export function computeAlertRoles(
  roles: RoleWithCompany[],
  roleEventsByRoleId: Record<string, { event_date: string }[]>
): AlertRole[] {
  const now = new Date()
  const alerts: AlertRole[] = []

  for (const role of roles) {
    if (role.stage === 'resolved') continue

    // Deadline alert — offer deadline within 3 days
    if (role.offer_deadline) {
      const deadlineDate = new Date(role.offer_deadline)
      const daysUntil = differenceInDays(deadlineDate, now)
      if (daysUntil >= 0 && daysUntil <= 3) {
        alerts.push({ ...role, _alertType: 'deadline', _daysUntilDeadline: daysUntil })
        continue
      }
    }

    // Ghosting alert — no contact in 14 days
    if (role.last_contact_at) {
      const daysSince = differenceInDays(now, new Date(role.last_contact_at))
      if (daysSince > 14) {
        alerts.push({ ...role, _alertType: 'ghosted', _daysSinceContact: daysSince })
        continue
      }
    }

    // Ghosting alert — applied 21+ days ago with no events on record
    if (role.applied_at) {
      const daysSinceApplied = differenceInDays(now, new Date(role.applied_at))
      if (daysSinceApplied > 21) {
        const events = roleEventsByRoleId[role.id] ?? []
        if (events.length === 0) {
          alerts.push({ ...role, _alertType: 'ghosted', _daysSinceContact: daysSinceApplied })
        }
      }
    }
  }

  return alerts
}
