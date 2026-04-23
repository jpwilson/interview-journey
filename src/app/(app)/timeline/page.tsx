import { createClient } from '@/lib/supabase/server'
import { TimelineTabs } from '@/components/timeline/TimelineTabs'
import { getUserTier } from '@/lib/limits'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, GitBranch, BarChart3, Layers, ArrowRight } from 'lucide-react'
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
    .is('deleted_at', null)
    .order('applied_at', { ascending: true })

  const roles = data ?? []

  const allEvents = (roles as Array<{ role_events?: RoleEvent[] }>)
    .flatMap((r) => r.role_events ?? [])
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <h1 className="font-headline mb-8 text-3xl font-extrabold text-slate-900">Career Timeline</h1>
      <TimelineTabs roles={roles} allEvents={allEvents} />
    </div>
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
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-ij-wash)] px-3 py-1 text-xs font-medium text-[var(--accent-ij-ink)]">
          <Lock className="h-3 w-3" /> Pro feature
        </div>
        <h1 className="font-headline mb-3 text-3xl font-extrabold text-slate-900">
          Career Timeline
        </h1>
        <p className="mb-10 max-w-xl text-base text-slate-500">
          See your entire job search on one canvas. Two lenses — River for the flow of roles,
          Chronicle for the feed of every interview, offer, and decision.
        </p>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-headline mb-1 font-bold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent-ij-wash)] bg-gradient-to-br from-[var(--accent-ij-wash)] to-white p-6 shadow-sm">
          <div className="min-w-[14rem] flex-1">
            <p className="font-headline text-lg font-bold text-slate-900">
              Unlock the timeline with Pro
            </p>
            <p className="text-sm text-slate-500">
              $12/month. Cancel anytime. Includes unlimited roles, uploads, and AI classifications.
            </p>
          </div>
          <Link
            href="/settings?upgrade=timeline"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--accent-ij-glow-a)] shadow-lg transition-opacity hover:opacity-90"
          >
            Upgrade to Pro <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
