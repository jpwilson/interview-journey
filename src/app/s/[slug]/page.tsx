import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'
import type { Metadata } from 'next'
import {
  Briefcase, Calendar, CheckCircle, XCircle, Star, FileText, AlertCircle,
  MessageSquare, TrendingUp, ArrowRight, Clock, Building2,
} from 'lucide-react'

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

function anonymizeCompany(name: string): string {
  if (name.length <= 2) return name[0] + '•'
  return name[0] + '•••' + name[name.length - 1]
}

type RoleRow = {
  id: string
  role_title: string
  stage: string
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  location: string | null
  remote_type: string | null
  applied_at: string | null
  deleted_at: string | null
  company: { name: string }
  role_events: Array<{
    id: string
    event_type: string
    event_date: string
    title: string
    description: string | null
    metadata: Record<string, unknown>
    source: string
  }>
}

type ShareLinkRow = {
  id: string
  user_id: string
  slug: string
  scope: 'full_timeline' | 'single_role'
  role_id: string | null
  display_name: string | null
  anonymize_companies: boolean
  show_compensation: boolean
  view_count: number
  created_at: string
  expires_at: string | null
  revoked_at: string | null
}

async function getShareData(slug: string): Promise<{ link: ShareLinkRow; roles: RoleRow[] } | null> {
  const service = createServiceClient()

  const { data: linkData } = await service
    .from('share_links')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  const link = linkData as ShareLinkRow | null
  if (!link) return null
  if (link.revoked_at) return null
  if (link.expires_at && new Date(link.expires_at) < new Date()) return null

  // Atomic increment — fire-and-forget. RPC is declared in migration 005;
  // types.ts Functions block stays as Record<string, never> to avoid
  // accidentally widening Supabase's relationship inference on other tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (service.rpc as any)('share_link_increment_view', { p_slug: slug })

  let rolesQuery = service
    .from('roles')
    .select(
      'id, role_title, stage, salary_min, salary_max, currency, location, remote_type, applied_at, deleted_at, company:companies(name), role_events(id, event_type, event_date, title, description, metadata, source)',
    )
    .eq('user_id', link.user_id)
    .is('deleted_at', null)

  if (link.scope === 'single_role' && link.role_id) {
    rolesQuery = rolesQuery.eq('id', link.role_id)
  }

  const { data: roles } = await rolesQuery.order('applied_at', { ascending: false })
  return { link, roles: (roles ?? []) as unknown as RoleRow[] }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getShareData(slug)

  if (!data) {
    return { title: 'Share not found · Interview Journey' }
  }

  const { link, roles } = data
  const displayName = link.display_name || 'Anonymous'
  const offers = roles.filter((r) => r.stage === 'offer' || r.stage === 'negotiating').length

  const title =
    link.scope === 'single_role'
      ? `${displayName}'s ${roles[0]?.role_title ?? 'job search'} journey`
      : `${displayName}'s job search · ${roles.length} roles · ${offers} offer${offers !== 1 ? 's' : ''}`

  const description = 'Tracked with Interview Journey — the editorial career companion.'

  return {
    title: `${title} · Interview Journey`,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Interview Journey' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getShareData(slug)

  if (!data) notFound()

  const { link, roles } = data
  const displayName = link.display_name || 'Anonymous'
  const showComp = link.show_compensation
  const anonymize = link.anonymize_companies

  const allEvents = roles
    .flatMap((r) => r.role_events.map((e) => ({ event: e, role: r })))
    .sort((a, b) => new Date(b.event.event_date).getTime() - new Date(a.event.event_date).getTime())

  const stats = {
    total: roles.length,
    active: roles.filter((r) => ['applied', 'screening', 'interviewing', 'offer', 'negotiating'].includes(r.stage))
      .length,
    offers: roles.filter((r) => r.stage === 'offer' || r.stage === 'negotiating').length,
    events: allEvents.length,
  }

  // Average time to offer
  const offerTimes: number[] = []
  for (const role of roles) {
    const offer = role.role_events.find((e) => e.event_type === 'offer_received')
    if (offer && role.applied_at) {
      const days = differenceInDays(parseISO(offer.event_date), parseISO(role.applied_at))
      if (days >= 0) offerTimes.push(days)
    }
  }
  const avgDaysToOffer =
    offerTimes.length > 0
      ? Math.round(offerTimes.reduce((a, b) => a + b, 0) / offerTimes.length)
      : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 backdrop-blur-sm"
        style={{ borderBottom: '1px solid var(--paper-ink)', background: 'color-mix(in srgb, var(--paper) 82%, transparent)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-ij), var(--accent-ij-ink))' }}
          >
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span
            style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, letterSpacing: -0.3 }}
          >
            Interview <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
          </span>
        </Link>
        <Link
          href="/signup"
          className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, var(--accent-ij), var(--accent-ij-ink))',
            boxShadow: '0 4px 16px var(--accent-ij-glow-a)',
          }}
        >
          Track yours →
        </Link>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              background: 'var(--accent-ij-wash)',
              borderColor: 'color-mix(in srgb, var(--accent-ij) 30%, transparent)',
              color: 'var(--accent-ij-ink)',
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: 'var(--accent-ij)' }}
            />
            Public job search journey
          </div>
          <h1
            className="mb-2 text-4xl tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--ink)' }}
          >
            {displayName}&apos;s job search
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
            Tracked with{' '}
            <Link
              href="/"
              style={{ color: 'var(--accent-ij-ink)' }}
              className="underline underline-offset-2"
            >
              Interview Journey
            </Link>
          </p>
        </div>

        {/* Stats grid */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total roles', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Offers', value: stats.offers, accent: true },
            { label: 'Events', value: stats.events },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-5 text-center"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--paper-ink)',
              }}
            >
              <p
                className="text-3xl"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 500,
                  color: s.accent ? 'var(--accent-ij-ink)' : 'var(--ink)',
                }}
              >
                {s.value}
              </p>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-4)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {avgDaysToOffer !== null && (
          <div
            className="mb-10 rounded-xl p-6 text-center"
            style={{
              background: 'color-mix(in srgb, var(--accent-ij-wash) 60%, var(--card))',
              border: '1px solid color-mix(in srgb, var(--accent-ij) 25%, transparent)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent-ij-ink)',
                fontWeight: 600,
              }}
            >
              Average time to offer
            </p>
            <p
              className="mt-2 text-4xl"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
            >
              {avgDaysToOffer}{' '}
              <span className="text-xl" style={{ color: 'var(--ink-4)' }}>
                days
              </span>
            </p>
          </div>
        )}

        {/* Companies summary */}
        <div className="mb-10">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            Companies
          </h2>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
                style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)' }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: stageDot(role.stage) }}
                />
                <span style={{ fontWeight: 500 }}>
                  {anonymize ? anonymizeCompany(role.company.name) : role.company.name}
                </span>
                <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                  {role.stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
            }}
          >
            Timeline
          </h2>
          <div className="relative pl-10">
            <div
              className="absolute left-[15px] top-2 bottom-2 w-px"
              style={{ background: 'var(--paper-ink)' }}
            />
            {allEvents.map(({ event, role }) => {
              const Icon = EVENT_ICONS[event.event_type] ?? Clock
              const companyName = anonymize ? anonymizeCompany(role.company.name) : role.company.name
              const metadata = event.metadata as { offer_details?: { base_salary?: number } } | undefined
              return (
                <div key={event.id} className="relative mb-3">
                  <div
                    className="absolute -left-[30px] top-4 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      background: stageDot(role.stage),
                      boxShadow: '0 0 0 4px var(--paper)',
                    }}
                  >
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div
                    className="rounded-xl p-4 transition-colors"
                    style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-md"
                            style={{ background: 'var(--accent-ij-wash)' }}
                          >
                            <Building2 className="h-3 w-3" style={{ color: 'var(--accent-ij-ink)' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>
                            {companyName}
                          </span>
                          <span style={{ color: 'var(--paper-ink)' }}>·</span>
                          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{role.role_title}</span>
                        </div>
                        <p style={{ fontWeight: 500, color: 'var(--ink)' }}>{event.title}</p>
                        {event.description && (
                          <p className="mt-1 text-sm" style={{ color: 'var(--ink-3)' }}>
                            {event.description}
                          </p>
                        )}
                        {showComp && metadata?.offer_details?.base_salary && (
                          <span
                            className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
                            style={{
                              background: 'var(--accent-ij-wash)',
                              color: 'var(--accent-ij-ink)',
                            }}
                          >
                            <Star className="h-3 w-3" /> Offer: $
                            {(metadata.offer_details.base_salary / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            color: 'var(--ink-4)',
                          }}
                        >
                          {format(parseISO(event.event_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA footer */}
        <div
          className="mt-16 rounded-xl p-8 text-center"
          style={{
            background: 'color-mix(in srgb, var(--accent-ij-wash) 70%, var(--card))',
            border: '1px solid color-mix(in srgb, var(--accent-ij) 30%, transparent)',
          }}
        >
          <h3
            className="mb-2 text-2xl"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--ink)' }}
          >
            Keep receipts for your whole career
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm" style={{ color: 'var(--ink-3)' }}>
            Drop any document — offer letters, rejections, NDAs — and AI auto-organizes your entire job search.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--accent-ij), var(--accent-ij-ink))',
              boxShadow: '0 6px 20px var(--accent-ij-glow-a)',
            }}
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs" style={{ color: 'var(--ink-4)' }}>
            No credit card required · unlimited roles on the free tier
          </p>
        </div>

        <p
          className="mt-8 text-center"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--ink-4)',
          }}
        >
          {link.view_count ?? 0} views · created {format(parseISO(link.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  )
}

function stageDot(stage: string): string {
  switch (stage) {
    case 'exploring': return 'var(--s-exploring)'
    case 'applied': return 'var(--s-applied)'
    case 'screening': return 'var(--s-screening)'
    case 'interviewing': return 'var(--s-interview)'
    case 'offer': return 'var(--s-offer)'
    case 'negotiating': return 'var(--s-negotiate)'
    case 'resolved': return 'var(--s-hired)'
    default: return 'var(--ink-5)'
  }
}
