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
  pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  passed: { label: 'Passed', className: 'bg-green-50 text-green-700 border-green-200' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 border-slate-200' },
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
  const label = TYPE_LABELS[meeting.type ?? ''] ?? 'Interview'
  const upcoming = isUpcoming(meeting.scheduled_at)

  async function handleOutcome(outcome: string) {
    setUpdating(true)
    setShowOutcomeMenu(false)
    try {
      await updateMeetingOutcome(meeting.id, outcome, '', roleId)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 bg-white shadow-sm ${upcoming ? 'border-sky-100' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${upcoming ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500'}`}>
            <TypeIcon type={meeting.type} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            {meeting.round_number && (
              <p className="text-xs text-slate-400">Round {meeting.round_number}</p>
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
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Update outcome"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          {showOutcomeMenu && (
            <div className="absolute right-0 top-7 z-10 min-w-[130px] rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
              {Object.entries(OUTCOME_BADGE).map(([key, { label: l }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleOutcome(key)}
                  className="w-full px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
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

      {meeting.prep_notes && (
        <p className="text-xs text-slate-500 line-clamp-2 border-t border-slate-100 pt-2">
          {meeting.prep_notes}
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
        <p className="text-sm text-slate-500">
          {meetings.length === 0 ? 'No meetings yet' : `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}
        </p>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-br from-[#00658f] to-[#4ea5d9] text-white rounded-full px-4 font-semibold shadow-md shadow-sky-200 border-0 hover:opacity-90 transition-opacity"
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
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center bg-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <Calendar className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No meetings scheduled yet</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="mt-3 text-sky-700 hover:text-sky-600 hover:bg-sky-50"
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
