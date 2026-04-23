import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBar, type SearchStatus } from '@/components/dashboard/StatusBar'
import { CareerTimeline, type CareerRole } from '@/components/dashboard/CareerTimeline'
import { FunnelBlock, type FunnelRole } from '@/components/dashboard/FunnelBlock'
import { GhostingAlerts } from '@/components/dashboard/GhostingAlerts'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { computeAlertRoles } from '@/lib/alerts'
import type { RoleWithCompany } from '@/lib/supabase/types'

type ProfileV2 = {
  id: string
  display_name: string | null
  current_employer_id: string | null
  current_title: string | null
  employment_start_date: string | null
  search_status: SearchStatus | null
  prefs: { onboardedAt?: string } | null
}

function sectionLabelStyle(): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
    marginBottom: 10,
  }
}

const STAGE_LABELS: Record<string, string> = {
  exploring: 'exploring',
  applied: 'applied',
  screening: 'screening',
  interviewing: 'interviewing',
  offer: 'offer',
  negotiating: 'negotiating',
  resolved: 'resolved',
}

const STAGE_COLORS: Record<string, string> = {
  exploring: 'var(--s-exploring)',
  applied: 'var(--s-applied)',
  screening: 'var(--s-screening)',
  interviewing: 'var(--s-interview)',
  offer: 'var(--s-offer)',
  negotiating: 'var(--s-negotiate)',
  resolved: 'var(--s-hired)',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? ''
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'You'

  // Profile: columns may not exist yet if migration 003 hasn't run. Query fails gracefully.
  let profile: ProfileV2 | null = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, current_employer_id, current_title, employment_start_date, search_status, prefs')
      .eq('id', userId)
      .maybeSingle()
    profile = (data ?? null) as ProfileV2 | null
  } catch {
    const { data } = await supabase.from('profiles').select('id, display_name').eq('id', userId).maybeSingle()
    profile = data ? ({ ...data, current_employer_id: null, current_title: null, employment_start_date: null, search_status: null, prefs: null } as ProfileV2) : null
  }

  const needsOnboarding = !profile?.prefs?.onboardedAt
  const { data: companiesForOnboarding } = needsOnboarding
    ? await supabase.from('companies').select('id, name').eq('user_id', userId).order('name')
    : { data: null }

  const [rolesRes, eventsRes, currentEmployerRes, pipelineEventsRes] = await Promise.all([
    supabase.from('roles').select('*, company:companies(*)').order('updated_at', { ascending: false }),
    supabase
      .from('role_events')
      .select('*, role:roles(role_title, company:companies(name))')
      .order('event_date', { ascending: false })
      .limit(6),
    profile?.current_employer_id
      ? supabase.from('companies').select('id, name').eq('id', profile.current_employer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('role_events').select('role_id, event_date').order('event_date', { ascending: false }),
  ])
  const allRoles = (rolesRes.data ?? []) as RoleWithCompany[]
  const events = (eventsRes.data ?? []) as Array<{
    id: string
    title: string
    event_date: string
    role: { role_title: string; company: { name: string } } | null
  }>
  const currentEmployer = (currentEmployerRes as { data: { name: string } | null }).data?.name ?? null

  // Career timeline: current employment + resolved:hired as past roles
  const careerRoles: CareerRole[] = []
  if (profile?.employment_start_date && currentEmployer) {
    careerRoles.push({
      id: 'current',
      company: currentEmployer,
      title: profile.current_title ?? '—',
      startISO: profile.employment_start_date,
      endISO: null,
    })
  }
  // Past hired roles from the pipeline
  for (const r of allRoles) {
    if (r.stage === 'resolved' && r.resolution === 'hired' && r.applied_at) {
      careerRoles.push({
        id: r.id,
        company: r.company.name,
        title: r.role_title,
        startISO: r.applied_at,
        endISO: r.resolved_at ?? null,
        how: r.source ?? null,
      })
    }
  }
  careerRoles.sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())

  // Funnel data
  const funnelRoles: FunnelRole[] = allRoles.map((r) => ({
    stage: r.stage,
    applied_at: r.applied_at,
    created_at: r.created_at,
    last_contact_at: r.last_contact_at ?? null,
    resolved_at: r.resolved_at,
  }))

  // Watch list: roles past screening (interviewing, offer, negotiating), most recently updated first
  const watchRoles = allRoles
    .filter((r) => ['interviewing', 'offer', 'negotiating'].includes(r.stage))
    .slice(0, 6)

  // Numbers for the at-a-glance grid
  const active = allRoles.filter((r) => r.stage !== 'resolved')
  const inDiligence = allRoles.filter((r) => ['interviewing', 'offer', 'negotiating'].includes(r.stage)).length
  const offersOut = allRoles.filter((r) => ['offer', 'negotiating'].includes(r.stage)).length
  // Server component — runs once per render, purity rule is a false positive here.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const ms30d = 30 * 24 * 3600 * 1000
  const silentSoon = active.filter((r) => {
    const last = new Date(r.last_contact_at ?? r.applied_at ?? r.created_at).getTime()
    const silence = nowMs - last
    return silence > 23 * 24 * 3600 * 1000 && silence < ms30d
  }).length
  const latestApplied = [...allRoles]
    .filter((r) => r.applied_at)
    .sort((a, b) => new Date(b.applied_at!).getTime() - new Date(a.applied_at!).getTime())[0]

  // Ghosting alerts (reuse existing)
  const eventsByRole: Record<string, { event_date: string }[]> = {}
  for (const ev of pipelineEventsRes.data ?? []) {
    const e = ev as { role_id: string; event_date: string }
    if (!eventsByRole[e.role_id]) eventsByRole[e.role_id] = []
    eventsByRole[e.role_id].push({ event_date: e.event_date })
  }
  const alertRoles = computeAlertRoles(allRoles, eventsByRole)

  const tiles = [
    { k: 'Active roles', v: String(active.length), sub: `${allRoles.length - active.length} resolved`, accent: true },
    { k: 'In diligence', v: String(inDiligence), sub: 'past recruiter screen', accent: true },
    { k: 'Offers out', v: String(offersOut), sub: offersOut ? 'needs decision' : 'none yet', accent: offersOut > 0 },
    { k: 'Auto-closing soon', v: String(silentSoon), sub: 'silent 23+ days' },
    {
      k: 'Last applied',
      v: latestApplied?.applied_at
        ? relative(latestApplied.applied_at)
        : '—',
      sub: latestApplied ? `${latestApplied.company.name} · ${latestApplied.role_title}` : 'Log a new application',
    },
    {
      k: 'Next event',
      v: events[0] ? relative(events[0].event_date, { future: true }) : '—',
      sub: events[0] && events[0].role ? `${events[0].role.company.name} · ${events[0].title}` : 'Nothing scheduled',
      accent: !!events[0],
    },
    { k: 'Reply rate', v: calcReplyRate(allRoles), sub: 'last 90 days' },
    { k: 'Total tracked', v: String(allRoles.length), sub: 'including resolved' },
  ]

  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      {needsOnboarding && (
        <OnboardingModal userId={userId} existingCompanies={companiesForOnboarding ?? []} />
      )}
      <StatusBar
        displayName={displayName}
        currentEmployer={currentEmployer}
        currentTitle={profile?.current_title ?? null}
        employmentStartDate={profile?.employment_start_date ?? null}
        searchStatus={profile?.search_status ?? null}
        userId={userId}
      />

      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Your career */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionLabelStyle()}>Your career</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)', borderRadius: 6, padding: 16 }}>
            <CareerTimeline roles={careerRoles} />
          </div>
        </section>

        {/* Holding */}
        {currentEmployer && (
          <section style={{ marginBottom: 28 }}>
            <div style={sectionLabelStyle()}>Holding · where you are now</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)', borderRadius: 6, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)' }}>
                    {profile?.current_title ?? '—'}{' '}
                    <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>· {currentEmployer}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
                    {profile?.employment_start_date
                      ? `Since ${new Date(profile.employment_start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}`
                      : ''}
                  </div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'var(--accent-ij-wash)',
                    color: 'var(--accent-ij-ink)',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-ij)' }} /> current
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Ghosting alerts — keep existing component */}
        {alertRoles.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <GhostingAlerts roles={alertRoles} />
          </section>
        )}

        {/* At a glance */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionLabelStyle()}>At a glance</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {tiles.map((t) => (
              <div
                key={t.k}
                style={{
                  background: t.accent ? 'var(--accent-ij-wash)' : 'var(--card)',
                  border: `1px solid ${t.accent ? 'var(--accent-ij-wash)' : 'var(--paper-ink)'}`,
                  borderRadius: 6,
                  padding: 14,
                  minHeight: 88,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: t.accent ? 'var(--accent-ij-ink)' : 'var(--ink-4)',
                  }}
                >
                  {t.k}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    marginTop: 6,
                    color: t.accent ? 'var(--accent-ij-ink)' : 'var(--ink)',
                  }}
                >
                  {t.v}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{t.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Funnel */}
        <section style={{ marginBottom: 28 }}>
          <div style={sectionLabelStyle()}>Application pipeline</div>
          <FunnelBlock roles={funnelRoles} />
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8, textAlign: 'right' }}>
            Full table on{' '}
            <Link href="/pipeline" style={{ color: 'var(--accent-ij-ink)', textDecoration: 'none' }}>
              Pipeline →
            </Link>
          </div>
        </section>

        {/* Watch list */}
        <section>
          <div style={sectionLabelStyle()}>Watching · past recruiter screen</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)', borderRadius: 6 }}>
            {watchRoles.length === 0 ? (
              <div style={{ padding: '20px 16px', color: 'var(--ink-4)', fontSize: 13 }}>
                Nothing past the recruiter screen yet.{' '}
                <Link href="/pipeline" style={{ color: 'var(--accent-ij-ink)' }}>
                  Open pipeline →
                </Link>
              </div>
            ) : (
              watchRoles.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/roles/${r.id}`}
                  style={{
                    display: 'flex',
                    padding: '12px 14px',
                    gap: 12,
                    borderBottom: i < watchRoles.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      background: 'var(--paper-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--ink-3)',
                      flexShrink: 0,
                    }}
                  >
                    {r.company.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                      {r.company.name}{' '}
                      <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>· {r.role_title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                      {r.last_contact_at
                        ? `Last contact ${relative(r.last_contact_at)}`
                        : r.applied_at
                          ? `Applied ${relative(r.applied_at)}`
                          : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: STAGE_COLORS[r.stage] ?? 'var(--ink-4)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: STAGE_COLORS[r.stage] ?? 'var(--ink-4)',
                        }}
                      />
                      {STAGE_LABELS[r.stage] ?? r.stage}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function relative(iso: string, { future }: { future?: boolean } = {}) {
  const d = new Date(iso).getTime()
  const n = Date.now()
  const diff = future ? d - n : n - d
  const day = 24 * 3600 * 1000
  if (future && diff < 0) return 'overdue'
  if (diff < day) return future ? 'soon' : 'today'
  const days = Math.floor(diff / day)
  if (days < 7) return `${days}d ${future ? '' : 'ago'}`.trim()
  if (days < 60) return `${Math.floor(days / 7)}w ${future ? '' : 'ago'}`.trim()
  return `${Math.floor(days / 30)}mo ${future ? '' : 'ago'}`.trim()
}

function calcReplyRate(roles: RoleWithCompany[]) {
  const cutoff = Date.now() - 90 * 24 * 3600 * 1000
  const windowRoles = roles.filter((r) => {
    const t = new Date(r.applied_at ?? r.created_at).getTime()
    return t >= cutoff
  })
  if (windowRoles.length === 0) return '—'
  const replied = windowRoles.filter((r) => ['screening', 'interviewing', 'offer', 'negotiating'].includes(r.stage) || r.last_contact_at).length
  return `${Math.round((replied / windowRoles.length) * 100)}%`
}
