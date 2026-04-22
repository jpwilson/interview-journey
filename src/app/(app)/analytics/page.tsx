import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { differenceInDays } from 'date-fns'
import type { RoleWithCompany, RoleEvent } from '@/lib/supabase/types'
import { AnalyticsFunnel } from '@/components/analytics/AnalyticsFunnel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const ORDERED_STAGES = ['applied', 'screening', 'interviewing', 'offer', 'hired'] as const

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rolesData }, { data: eventsData }] = await Promise.all([
    supabase.from('roles').select('*, company:companies(*)').order('created_at', { ascending: false }),
    supabase.from('role_events').select('*').order('event_date', { ascending: true }),
  ])

  const roles = (rolesData ?? []) as RoleWithCompany[]
  const events = (eventsData ?? []) as RoleEvent[]

  if (roles.length < 2) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Not enough data</p>
          <p className="mt-2 text-sm text-slate-500">
            Track at least 5 roles to see analytics. You have {roles.length} so far.
          </p>
        </div>
      </div>
    )
  }

  // ── Section 1: Application funnel ──────────────────────────────────────────
  const stageToResolutionHired = (r: RoleWithCompany) =>
    r.stage === 'resolved' && r.resolution === 'hired'

  const funnelCounts = {
    applied: roles.filter((r) => r.applied_at || ['applied','screening','interviewing','offer','negotiating','resolved'].includes(r.stage)).length,
    screening: roles.filter((r) => ['screening', 'interviewing', 'offer', 'negotiating', 'resolved'].includes(r.stage)).length,
    interviewing: roles.filter((r) => ['interviewing', 'offer', 'negotiating', 'resolved'].includes(r.stage)).length,
    offer: roles.filter((r) => ['offer', 'negotiating', 'resolved'].includes(r.stage) && r.resolution !== 'rejected' && r.resolution !== 'withdrew' && r.resolution !== 'ghosted').length,
    hired: roles.filter(stageToResolutionHired).length,
  }

  // ── Section 2: Response rate ────────────────────────────────────────────────
  const appliedCount = funnelCounts.applied || 1
  const responseRate = Math.round((funnelCounts.screening / appliedCount) * 100)
  const responseColor =
    responseRate > 5 ? 'text-green-600' : responseRate >= 2 ? 'text-yellow-600' : 'text-red-500'
  const responseBg =
    responseRate > 5 ? 'bg-green-50 border-green-200' : responseRate >= 2 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  // ── Section 3: Source performance ──────────────────────────────────────────
  const sourceMap: Record<string, { applied: number; screening: number; interview: number; offer: number }> = {}
  for (const role of roles) {
    const src = role.source ?? 'unknown'
    if (!sourceMap[src]) sourceMap[src] = { applied: 0, screening: 0, interview: 0, offer: 0 }
    sourceMap[src].applied++
    if (['screening', 'interviewing', 'offer', 'negotiating', 'resolved'].includes(role.stage))
      sourceMap[src].screening++
    if (['interviewing', 'offer', 'negotiating', 'resolved'].includes(role.stage))
      sourceMap[src].interview++
    if (['offer', 'negotiating', 'resolved'].includes(role.stage) && role.resolution !== 'rejected' && role.resolution !== 'withdrew' && role.resolution !== 'ghosted')
      sourceMap[src].offer++
  }

  const sourceRows = Object.entries(sourceMap).sort((a, b) => b[1].applied - a[1].applied)

  // ── Section 4: Time in stage ────────────────────────────────────────────────
  const eventsByRole: Record<string, RoleEvent[]> = {}
  for (const ev of events) {
    if (!eventsByRole[ev.role_id]) eventsByRole[ev.role_id] = []
    eventsByRole[ev.role_id].push(ev)
  }

  const daysToInterview: number[] = []
  const daysToOffer: number[] = []

  for (const role of roles) {
    if (!role.applied_at) continue
    const appliedDate = new Date(role.applied_at)
    const roleEvents = eventsByRole[role.id] ?? []

    const firstInterview = roleEvents.find(
      (e) => e.event_type === 'interview_scheduled' || e.event_type === 'interview_completed'
    )
    if (firstInterview) {
      daysToInterview.push(differenceInDays(new Date(firstInterview.event_date), appliedDate))
    }

    const offerEvent = roleEvents.find((e) => e.event_type === 'offer_received')
    if (offerEvent) {
      daysToOffer.push(differenceInDays(new Date(offerEvent.event_date), appliedDate))
    }
  }

  const avgDaysToInterview =
    daysToInterview.length > 0
      ? Math.round(daysToInterview.reduce((a, b) => a + b, 0) / daysToInterview.length)
      : null

  const avgDaysToOffer =
    daysToOffer.length > 0
      ? Math.round(daysToOffer.reduce((a, b) => a + b, 0) / daysToOffer.length)
      : null

  // ── Section 5: Ghost rate ───────────────────────────────────────────────────
  const ghosted = roles.filter(
    (r) => r.stage === 'resolved' && r.resolution === 'ghosted'
  )
  const silentRoles = roles.filter((r) => {
    if (r.stage === 'resolved') return false
    const roleEvents = eventsByRole[r.id] ?? []
    const nonApplied = roleEvents.filter((e) => e.event_type !== 'applied')
    return nonApplied.length === 0
  })
  const ghostRate = Math.round(((ghosted.length + silentRoles.length) / roles.length) * 100)

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <h1
        className="mb-8 text-3xl font-extrabold text-slate-900"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Analytics
      </h1>

      <div className="space-y-6">
        {/* Section 1: Funnel */}
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Application funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsFunnel counts={funnelCounts} />
          </CardContent>
        </Card>

        {/* Section 2: Response rate */}
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Response rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('inline-flex items-center rounded-xl border px-6 py-4 mb-4', responseBg)}>
              <p className={cn('text-5xl font-extrabold', responseColor)}>{responseRate}%</p>
            </div>
            <p className="text-sm text-slate-500">
              Your application response rate (screenings / applied)
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Industry average is 3–5%.{' '}
              {responseRate > 5
                ? 'Great work — you\'re above average!'
                : responseRate >= 2
                ? 'You\'re near the average. Keep applying!'
                : 'Below average — consider refining your resume or targeting different roles.'}
            </p>
          </CardContent>
        </Card>

        {/* Section 3: Source performance */}
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Source performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">Source</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Applied</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Screening</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Interview</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Offer</th>
                    <th className="pb-3 font-semibold text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sourceRows.map(([src, counts]) => {
                    const rate = Math.round((counts.screening / (counts.applied || 1)) * 100)
                    return (
                      <tr key={src} className="text-slate-700 hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 capitalize font-medium">{src}</td>
                        <td className="py-3 pr-4 text-right text-slate-500">{counts.applied}</td>
                        <td className="py-3 pr-4 text-right text-slate-500">{counts.screening}</td>
                        <td className="py-3 pr-4 text-right text-slate-500">{counts.interview}</td>
                        <td className="py-3 pr-4 text-right text-slate-500">{counts.offer}</td>
                        <td
                          className={cn(
                            'py-3 text-right font-semibold',
                            rate > 5 ? 'text-green-600' : rate >= 2 ? 'text-yellow-600' : 'text-red-500'
                          )}
                        >
                          {rate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Time in stage */}
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Time in stage</CardTitle>
          </CardHeader>
          <CardContent>
            {avgDaysToInterview === null && avgDaysToOffer === null ? (
              <p className="text-sm text-slate-500">
                No resolved data yet — these stats appear once you have completed interview or offer events.
              </p>
            ) : (
              <div className="flex gap-10">
                {avgDaysToInterview !== null && (
                  <div>
                    <p className="text-4xl font-extrabold text-[var(--accent-ij-ink)]">{avgDaysToInterview}d</p>
                    <p className="mt-1 text-sm text-slate-500">Avg. applied → first interview</p>
                  </div>
                )}
                {avgDaysToOffer !== null && (
                  <div>
                    <p className="text-4xl font-extrabold text-purple-600">{avgDaysToOffer}d</p>
                    <p className="mt-1 text-sm text-slate-500">Avg. applied → offer</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Ghost rate */}
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Ghost rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-4xl font-extrabold text-slate-700">{ghostRate}%</p>
            <p className="text-sm text-slate-500">
              {ghosted.length + silentRoles.length} of your {roles.length} applications received no
              response ({ghosted.length} confirmed ghosted, {silentRoles.length} with no activity).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
