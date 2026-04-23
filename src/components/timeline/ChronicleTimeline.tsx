'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
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

const EVENT_COLORS: Record<string, { dot: string; border: string }> = {
  applied: { dot: 'bg-slate-500', border: 'border-l-slate-500' },
  screening_scheduled: { dot: 'bg-yellow-500', border: 'border-l-yellow-500' },
  screening_completed: { dot: 'bg-yellow-400', border: 'border-l-yellow-400' },
  interview_scheduled: { dot: 'bg-blue-500', border: 'border-l-blue-500' },
  interview_completed: { dot: 'bg-blue-400', border: 'border-l-blue-400' },
  technical_assessment: { dot: 'bg-blue-600', border: 'border-l-blue-600' },
  offer_received: { dot: 'bg-purple-500', border: 'border-l-purple-500' },
  offer_accepted: { dot: 'bg-green-500', border: 'border-l-green-500' },
  offer_declined: { dot: 'bg-red-400', border: 'border-l-red-400' },
  offer_rescinded: { dot: 'bg-red-600', border: 'border-l-red-600' },
  rejected: { dot: 'bg-red-500', border: 'border-l-red-500' },
  withdrawn: { dot: 'bg-slate-500', border: 'border-l-slate-500' },
  reference_check: { dot: 'bg-[var(--accent-ij-wash)]', border: 'border-l-[var(--accent-ij)]' },
  nda_signed: { dot: 'bg-[var(--accent-ij)]', border: 'border-l-[var(--accent-ij)]' },
  document_added: { dot: 'bg-slate-400', border: 'border-l-slate-400' },
  note_added: { dot: 'bg-slate-400', border: 'border-l-slate-400' },
  stage_changed: { dot: 'bg-blue-600', border: 'border-l-blue-600' },
}

const FALLBACK_COLORS = { dot: 'bg-slate-500', border: 'border-l-slate-500' }

interface Props {
  events: RoleEvent[]
}

export function ChronicleTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="mb-4 h-10 w-10 text-slate-300" />
        <p className="text-slate-500">No events yet.</p>
        <p className="mt-1 text-sm text-slate-400">
          Add an event or drop a document to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line — left-aligned */}
      <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-slate-200" />

      <div className="space-y-4">
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.event_type] ?? Clock
          const colors = EVENT_COLORS[event.event_type] ?? FALLBACK_COLORS
          const metadata = event.metadata as Record<string, unknown>

          return (
            <div key={event.id} className="flex items-start gap-4">
              {/* Dot */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.dot} shadow-sm`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-xl border border-l-4 border-slate-100 bg-white p-5 ${colors.border} shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{event.title}</p>

                    {event.description && (
                      <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                    )}

                    {/* Interview details */}
                    {!!metadata.interview_details &&
                      (() => {
                        const d = metadata.interview_details as Record<string, string>
                        return (
                          <div className="mt-2 space-y-0.5 text-xs text-slate-400">
                            {d.interview_type && <p>Type: {d.interview_type}</p>}
                            {d.platform && <p>Via: {d.platform}</p>}
                          </div>
                        )
                      })()}

                    {/* Offer details */}
                    {!!metadata.offer_details &&
                      (() => {
                        const o = metadata.offer_details as Record<string, number | string | null>
                        return (
                          <div className="mt-2 space-y-0.5 text-xs">
                            {o.base_salary && (
                              <p className="font-medium text-green-600">
                                ${((o.base_salary as number) / 1000).toFixed(0)}k base
                                {o.currency ? ` ${o.currency}` : ''}
                              </p>
                            )}
                            {o.start_date && (
                              <p className="text-slate-500">Start: {o.start_date as string}</p>
                            )}
                            {o.deadline && (
                              <p className="text-amber-600">Deadline: {o.deadline as string}</p>
                            )}
                          </div>
                        )
                      })()}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-xs whitespace-nowrap text-slate-500 capitalize"
                    >
                      {event.event_type.replace(/_/g, ' ')}
                    </Badge>
                    {event.source === 'ai_parsed' && (
                      <Badge className="border-blue-100 bg-blue-50 text-xs text-blue-600">AI</Badge>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {format(new Date(event.event_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
