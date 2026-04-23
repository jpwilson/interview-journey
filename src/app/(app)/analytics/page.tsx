import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { differenceInDays } from 'date-fns'
import type { RoleWithCompany, RoleEvent } from '@/lib/supabase/types'
import { AnalyticsFunnel } from '@/components/analytics/AnalyticsFunnel'
import { PageHeader, PageShell, EditorialCard, SectionLabel } from '@/components/ui/PageHeader'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rolesData }, { data: eventsData }] = await Promise.all([
    supabase
      .from('roles')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false }),
    supabase.from('role_events').select('*').order('event_date', { ascending: true }),
  ])

  const roles = (rolesData ?? []) as RoleWithCompany[]
  const events = (eventsData ?? []) as RoleEvent[]

  if (roles.length < 2) {
    return (
      <PageShell>
        <PageHeader kicker="Analytics" title="Not enough data yet" />
        <div style={{ padding: '22px 22px 80px', maxWidth: 720, margin: '0 auto' }}>
          <EditorialCard style={{ textAlign: 'center', padding: '40px 24px' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              Need a few more data points
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-4)' }}>
              Track at least 5 roles to see meaningful analytics. You have {roles.length} so far.
            </p>
          </EditorialCard>
        </div>
      </PageShell>
    )
  }

  // ── Section 1: Application funnel ──────────────────────────────────────────
  const stageToResolutionHired = (r: RoleWithCompany) =>
    r.stage === 'resolved' && r.resolution === 'hired'

  const funnelCounts = {
    applied: roles.filter(
      (r) =>
        r.applied_at ||
        ['applied', 'screening', 'interviewing', 'offer', 'negotiating', 'resolved'].includes(
          r.stage
        )
    ).length,
    screening: roles.filter((r) =>
      ['screening', 'interviewing', 'offer', 'negotiating', 'resolved'].includes(r.stage)
    ).length,
    interviewing: roles.filter((r) =>
      ['interviewing', 'offer', 'negotiating', 'resolved'].includes(r.stage)
    ).length,
    offer: roles.filter(
      (r) =>
        ['offer', 'negotiating', 'resolved'].includes(r.stage) &&
        r.resolution !== 'rejected' &&
        r.resolution !== 'withdrew' &&
        r.resolution !== 'ghosted'
    ).length,
    hired: roles.filter(stageToResolutionHired).length,
  }

  // ── Section 2: Response rate ────────────────────────────────────────────────
  const appliedCount = funnelCounts.applied || 1
  const responseRate = Math.round((funnelCounts.screening / appliedCount) * 100)
  const responseColor =
    responseRate > 5 ? 'text-green-600' : responseRate >= 2 ? 'text-yellow-600' : 'text-red-500'
  const responseBg =
    responseRate > 5
      ? 'bg-green-50 border-green-200'
      : responseRate >= 2
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-red-50 border-red-200'

  // ── Section 3: Source performance ──────────────────────────────────────────
  const sourceMap: Record<
    string,
    { applied: number; screening: number; interview: number; offer: number }
  > = {}
  for (const role of roles) {
    const src = role.source ?? 'unknown'
    if (!sourceMap[src]) sourceMap[src] = { applied: 0, screening: 0, interview: 0, offer: 0 }
    sourceMap[src].applied++
    if (['screening', 'interviewing', 'offer', 'negotiating', 'resolved'].includes(role.stage))
      sourceMap[src].screening++
    if (['interviewing', 'offer', 'negotiating', 'resolved'].includes(role.stage))
      sourceMap[src].interview++
    if (
      ['offer', 'negotiating', 'resolved'].includes(role.stage) &&
      role.resolution !== 'rejected' &&
      role.resolution !== 'withdrew' &&
      role.resolution !== 'ghosted'
    )
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
  const ghosted = roles.filter((r) => r.stage === 'resolved' && r.resolution === 'ghosted')
  const silentRoles = roles.filter((r) => {
    if (r.stage === 'resolved') return false
    const roleEvents = eventsByRole[r.id] ?? []
    const nonApplied = roleEvents.filter((e) => e.event_type !== 'applied')
    return nonApplied.length === 0
  })
  const ghostRate = Math.round(((ghosted.length + silentRoles.length) / roles.length) * 100)

  const responseHint =
    responseRate > 5
      ? 'Above industry average — nicely done.'
      : responseRate >= 2
        ? 'Near the 3-5% industry average. Keep going.'
        : 'Below 2%. Consider refining resume or targeting.'

  return (
    <PageShell>
      <PageHeader
        kicker="Analytics"
        title="Patterns in your search"
        subtitle={`Across ${roles.length} roles tracked. These stats sharpen as you log more events.`}
      />
      <div
        style={{
          padding: '22px 22px 80px',
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <section>
          <SectionLabel>Application funnel</SectionLabel>
          <EditorialCard>
            <AnalyticsFunnel counts={funnelCounts} />
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>Response rate</SectionLabel>
          <EditorialCard>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 44,
                  fontWeight: 500,
                  color: 'var(--accent-ij-ink)',
                  letterSpacing: -1,
                }}
              >
                {responseRate}%
              </p>
              <div>
                <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                  Screenings per application — industry average is 3–5%.
                </p>
                <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{responseHint}</p>
              </div>
            </div>
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>Source performance</SectionLabel>
          <EditorialCard style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--paper-2)',
                      borderBottom: '1px solid var(--paper-ink)',
                    }}
                  >
                    {['Source', 'Applied', 'Screening', 'Interview', 'Offer', 'Rate'].map(
                      (h, i) => (
                        <th
                          key={h}
                          style={{
                            textAlign: i === 0 ? 'left' : 'right',
                            padding: '10px 14px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-4)',
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.map(([src, counts], idx) => {
                    const rate = Math.round((counts.screening / (counts.applied || 1)) * 100)
                    const rateColor =
                      rate > 5
                        ? 'var(--status-ok)'
                        : rate >= 2
                          ? 'var(--status-warn)'
                          : 'var(--s-rejected)'
                    return (
                      <tr
                        key={src}
                        style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border-soft)' }}
                      >
                        <td
                          style={{
                            padding: '10px 14px',
                            color: 'var(--ink)',
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        >
                          {src}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: 'var(--ink-3)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {counts.applied}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: 'var(--ink-3)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {counts.screening}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: 'var(--ink-3)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {counts.interview}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: 'var(--ink-3)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {counts.offer}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: rateColor,
                            fontWeight: 500,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {rate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>Time in stage</SectionLabel>
          <EditorialCard>
            {avgDaysToInterview === null && avgDaysToOffer === null ? (
              <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>
                No resolved data yet — stats appear once you log completed interview or offer
                events.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {avgDaysToInterview !== null && (
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 36,
                        fontWeight: 500,
                        color: 'var(--accent-ij-ink)',
                      }}
                    >
                      {avgDaysToInterview}d
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                      Avg. applied → first interview
                    </p>
                  </div>
                )}
                {avgDaysToOffer !== null && (
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 36,
                        fontWeight: 500,
                        color: 'var(--ink)',
                      }}
                    >
                      {avgDaysToOffer}d
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                      Avg. applied → offer
                    </p>
                  </div>
                )}
              </div>
            )}
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>Ghost rate</SectionLabel>
          <EditorialCard>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 36,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              {ghostRate}%
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4 }}>
              {ghosted.length + silentRoles.length} of your {roles.length} applications received no
              response ({ghosted.length} confirmed ghosted, {silentRoles.length} with no activity).
            </p>
          </EditorialCard>
        </section>
      </div>
    </PageShell>
  )
}
