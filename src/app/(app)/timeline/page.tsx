import { createClient } from '@/lib/supabase/server'
import { TimelineTabs } from '@/components/timeline/TimelineTabs'
import { getUserTier } from '@/lib/limits'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, GitBranch, BarChart3, Layers, ArrowRight } from 'lucide-react'
import { PageHeader, PageShell } from '@/components/ui/PageHeader'
import type { RoleEvent } from '@/lib/supabase/types'

export default async function TimelinePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    return <TimelinePaywall />
  }

  const { data } = await supabase
    .from('roles')
    .select(
      `
      *,
      company:companies(*),
      role_events(*)
    `
    )
    .order('applied_at', { ascending: true })

  const roles = data ?? []

  const allEvents = (roles as Array<{ role_events?: RoleEvent[] }>)
    .flatMap((r) => r.role_events ?? [])
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())

  return (
    <PageShell>
      <PageHeader
        kicker="Career Timeline"
        title="Your whole career on one axis"
        subtitle="River view shows each role flowing through time. Chronicle view is every event — interviews, offers, rejections — in one scrollable feed."
      />
      <div style={{ padding: '22px 22px 80px', maxWidth: 1400, margin: '0 auto' }}>
        <TimelineTabs roles={roles} allEvents={allEvents} />
      </div>
    </PageShell>
  )
}

function TimelinePaywall() {
  const perks = [
    {
      icon: GitBranch,
      title: 'River view',
      body: 'Every role you’ve tracked flowing across a single horizontal axis — see where your search sped up, stalled, or branched.',
    },
    {
      icon: Layers,
      title: 'Chronicle view',
      body: 'Every event across every role in one scrollable feed. Jump back to the day that offer came in.',
    },
    {
      icon: BarChart3,
      title: 'Cross-role patterns',
      body: 'Spot the stages where you stall, the average time-to-offer, and which companies ghosted you fastest.',
    },
  ]

  return (
    <PageShell>
      <PageHeader
        kicker="Career Timeline · Pro"
        title="Your whole career on one axis"
        subtitle="Every role, every interview, every offer, plotted. Two lenses — River for flow, Chronicle for feed. Pro only."
      />
      <div style={{ padding: '22px 22px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--accent-ij-wash)',
            color: 'var(--accent-ij-ink)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          <Lock size={11} /> Pro feature
        </div>

        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginBottom: 24,
          }}
        >
          {perks.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--paper-ink)',
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  background: 'var(--accent-ij-wash)',
                  color: 'var(--accent-ij-ink)',
                  marginBottom: 10,
                }}
              >
                <Icon size={16} />
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginBottom: 4,
                }}
              >
                {title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5 }}>{body}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 14,
            border: '1px solid var(--paper-ink)',
            background: 'var(--accent-ij-wash)',
            borderRadius: 6,
            padding: 20,
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              Unlock the timeline with Pro
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              $12/month or $144/year. Cancel anytime. Includes unlimited roles, uploads, and AI
              classifications.
            </p>
          </div>
          <Link
            href="/settings?upgrade=timeline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 4,
              background: 'var(--accent-ij-ink)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Upgrade to Pro <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
