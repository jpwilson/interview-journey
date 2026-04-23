'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle, XCircle, Calendar, FileText, MessageSquare,
  TrendingUp, ArrowRight, Clock, Star, AlertCircle
} from 'lucide-react'
import type { RoleEvent } from '@/lib/supabase/types'

const EVENT_ICONS: Record<string, typeof CheckCircle> = {
  applied: FileText,
  screening_scheduled: Calendar,
  screening_completed: CheckCircle,
  interview_scheduled: Calendar,
  interview_completed: CheckCircle,
  technical_assessment: AlertCircle,
  offer_received: Star,
  offer_accepted: CheckCircle,
  offer_declined: XCircle,
  offer_rescinded: XCircle,
  rejected: XCircle,
  withdrawn: ArrowRight,
  reference_check: MessageSquare,
  nda_signed: FileText,
  document_added: FileText,
  note_added: MessageSquare,
  stage_changed: TrendingUp,
}

const EVENT_COLORS: Record<string, string> = {
  applied: 'bg-slate-400',
  screening_scheduled: 'bg-yellow-400',
  screening_completed: 'bg-yellow-500',
  interview_scheduled: 'bg-[var(--accent-ij)]',
  interview_completed: 'bg-[var(--accent-ij)]',
  technical_assessment: 'bg-blue-500',
  offer_received: 'bg-purple-500',
  offer_accepted: 'bg-green-500',
  offer_declined: 'bg-red-400',
  offer_rescinded: 'bg-red-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-slate-400',
  reference_check: 'bg-[var(--accent-ij)]',
  nda_signed: 'bg-[var(--accent-ij)]',
  document_added: 'bg-slate-400',
  note_added: 'bg-slate-400',
  stage_changed: 'bg-[var(--accent-ij)]',
}

interface Props {
  events: RoleEvent[]
}

export function ApplicationTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Clock className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-500">No events yet.</p>
        <p className="mt-1 text-sm text-slate-400">Add an event or drop a document to get started.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-4 pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />

      {events.map((event) => {
        const Icon = EVENT_ICONS[event.event_type] ?? Clock
        const color = EVENT_COLORS[event.event_type] ?? 'bg-slate-400'
        const metadata = event.metadata as Record<string, unknown>

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Dot */}
            <div
              className={`absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full ${color} shrink-0 ring-2 ring-white shadow-sm`}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{event.title}</p>
                  {event.description && (
                    <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                  )}

                  {/* Interview details */}
                  {!!metadata.interview_details && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      {(() => {
                        const d = metadata.interview_details as Record<string, string>
                        return (
                          <>
                            {d.interview_type && <p>Type: {d.interview_type}</p>}
                            {d.platform && <p>Via: {d.platform}</p>}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {/* Offer details */}
                  {!!metadata.offer_details && (
                    <div className="mt-2 space-y-1 text-xs">
                      {(metadata.offer_details as Record<string, number | string | null>).base_salary && (
                        <p className="text-green-600 font-medium">
                          ${((metadata.offer_details as Record<string, number>).base_salary / 1000).toFixed(0)}k base
                          {String((metadata.offer_details as Record<string, unknown>).currency ?? '')}
                        </p>
                      )}
                      {(metadata.offer_details as Record<string, string>).start_date && (
                        <p className="text-slate-500">
                          Start: {(metadata.offer_details as Record<string, string>).start_date}
                        </p>
                      )}
                      {(metadata.offer_details as Record<string, string>).deadline && (
                        <p className="text-amber-600">
                          Deadline: {(metadata.offer_details as Record<string, string>).deadline}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-xs text-slate-500 capitalize"
                  >
                    {event.event_type.replace(/_/g, ' ')}
                  </Badge>
                  {event.source === 'ai_parsed' && (
                    <Badge className="bg-[var(--accent-ij-wash)] text-xs text-[var(--accent-ij-ink)] border-0">AI</Badge>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {format(new Date(event.event_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
