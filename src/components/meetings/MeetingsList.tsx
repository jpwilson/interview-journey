'use client'

import { useState } from 'react'
import type { Meeting } from '@/lib/supabase/types'
import { AddMeetingForm } from './AddMeetingForm'
import { updateMeetingOutcome } from '@/lib/actions/meetings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Phone, Code2, Layout, Users, MessageSquare,
  Trophy, Calendar, Clock, Monitor, Plus, ChevronDown,
} from 'lucide-react'

interface MeetingsListProps {
  meetings: Meeting[]
  roleId: string
}

const TYPE_LABELS: Record<string, string> = {
  phone_screen: 'Phone Screen',
  recruiter_call: 'Recruiter Call',
  hiring_manager: 'Hiring Manager',
  technical: 'Technical Interview',
  system_design: 'System Design',
  behavioral: 'Behavioral',
  panel: 'Panel Interview',
  final_round: 'Final Round',
  offer_call: 'Offer Call',
  other: 'Interview',
}

function TypeIcon({ type }: { type: string | null }) {
  switch (type) {
    case 'phone_screen':
    case 'recruiter_call':
      return <Phone className="h-4 w-4" />
    case 'technical':
      return <Code2 className="h-4 w-4" />
    case 'system_design':
      return <Layout className="h-4 w-4" />
    case 'panel':
    case 'final_round':
      return <Users className="h-4 w-4" />
    case 'behavioral':
    case 'hiring_manager':
      return <MessageSquare className="h-4 w-4" />
    case 'offer_call':
      return <Trophy className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const OUTCOME_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
  passed: { label: 'Passed', className: 'bg-green-600/20 text-green-400 border-green-600/30' },
  failed: { label: 'Failed', className: 'bg-red-600/20 text-red-400 border-red-600/30' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-600/20 text-slate-400 border-slate-600/30' },
}

function formatDateTime(iso: string | null) {
  if (!iso) return 'TBD'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function isUpcoming(iso: string | null) {
  if (!iso) return true
  return new Date(iso) >= new Date()
}

interface MeetingCardProps {
  meeting: Meeting
  roleId: string
}

function MeetingCard({ meeting, roleId }: MeetingCardProps) {
  const [showOutcomeMenu, setShowOutcomeMenu] = useState(false)
  const [updating, setUpdating] = useState(false)

  const badge = OUTCOME_BADGE[meeting.outcome ?? 'pending'] ?? OUTCOME_BADGE.pending
  const label = TYPE_LABELS[meeting.meeting_type ?? ''] ?? 'Interview'
  const upcoming = isUpcoming(meeting.scheduled_at)

  async function handleOutcome(outcome: string) {
    setUpdating(true)
    setShowOutcomeMenu(false)
    try {
      await updateMeetingOutcome(meeting.id, outcome, roleId)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${upcoming ? 'border-blue-700/40 bg-blue-950/20' : 'border-slate-700 bg-slate-800/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${upcoming ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
            <TypeIcon type={meeting.meeting_type} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            {meeting.title && meeting.title !== label && (
              <p className="text-xs text-slate-500">{meeting.title}</p>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <Badge className={`text-xs border ${badge.className}`}>
            {badge.label}
          </Badge>
          <button
            type="button"
            onClick={() => setShowOutcomeMenu((v) => !v)}
            disabled={updating}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Update outcome"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          {showOutcomeMenu && (
            <div className="absolute right-0 top-7 z-10 min-w-[130px] rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl">
              {Object.entries(OUTCOME_BADGE).map(([key, { label: l }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleOutcome(key)}
                  className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateTime(meeting.scheduled_at)}
        </span>
        {meeting.duration_minutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {meeting.duration_minutes} min
          </span>
        )}
        {meeting.platform && (
          <span className="flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            {meeting.platform}
          </span>
        )}
      </div>

      {meeting.notes && (
        <p className="text-xs text-slate-400 line-clamp-2 border-t border-slate-700/50 pt-2">
          {meeting.notes}
        </p>
      )}
    </div>
  )
}

export function MeetingsList({ meetings, roleId }: MeetingsListProps) {
  const [showForm, setShowForm] = useState(false)

  const sorted = [...meetings].sort((a, b) => {
    const aTime = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity
    const bTime = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity
    // Upcoming first (ascending), then past
    const now = Date.now()
    const aUpcoming = aTime >= now
    const bUpcoming = bTime >= now
    if (aUpcoming && !bUpcoming) return -1
    if (!aUpcoming && bUpcoming) return 1
    if (aUpcoming && bUpcoming) return aTime - bTime
    return bTime - aTime // past: most recent first
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {meetings.length === 0 ? 'No meetings yet' : `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}
        </p>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add meeting
          </Button>
        )}
      </div>

      {showForm && (
        <AddMeetingForm roleId={roleId} onCancel={() => setShowForm(false)} />
      )}

      {sorted.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">No meetings scheduled yet</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="mt-3 text-blue-400 hover:text-blue-300"
          >
            Schedule your first meeting
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((m) => (
          <MeetingCard key={m.id} meeting={m} roleId={roleId} />
        ))}
      </div>
    </div>
  )
}
