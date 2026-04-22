import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, FileText, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { RoleWithCompany } from '@/lib/supabase/types'
import { GhostingAlerts } from '@/components/dashboard/GhostingAlerts'
import { computeAlertRoles } from '@/lib/alerts'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-100 text-slate-600',
  applied: 'bg-blue-50 text-blue-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interviewing: 'bg-sky-50 text-sky-700',
  offer: 'bg-purple-50 text-purple-700',
  negotiating: 'bg-indigo-50 text-indigo-700',
  resolved: 'bg-green-50 text-green-700',
}

const STAT_ICON_COLORS = [
  { bg: 'bg-sky-50', icon: 'text-sky-600' },
  { bg: 'bg-purple-50', icon: 'text-purple-600' },
  { bg: 'bg-green-50', icon: 'text-green-600' },
  { bg: 'bg-slate-100', icon: 'text-slate-500' },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: roles }, { data: documents }, { data: recentEvents }, { data: alertEvents }] =
    await Promise.all([
      supabase.from('roles').select('*, company:companies(*)').order('updated_at', { ascending: false }),
      supabase.from('documents').select('id, classification_status').limit(1000),
      supabase
        .from('role_events')
        .select('*, role:roles(role_title, company:companies(name))')
        .order('created_at', { ascending: false })
        .limit(5),
      // Fetch events for non-resolved roles to detect ghosting
      supabase
        .from('role_events')
        .select('role_id, event_date')
        .order('event_date', { ascending: false }),
    ])

  type RecentEvent = {
    id: string
    title: string
    created_at: string
    role: { role_title: string; company: { name: string } } | null
  }

  const allRoles = (roles ?? []) as RoleWithCompany[]
  const docs = (documents ?? []) as { id: string; classification_status: string }[]
  const events = (recentEvents ?? []) as RecentEvent[]

  const active = allRoles.filter((r) => r.stage !== 'resolved')
  const offers = allRoles.filter((r) => r.stage === 'offer' || r.stage === 'negotiating')
  const classified = docs.filter((d) => d.classification_status === 'classified').length

  // Build a map of role_id → events for ghosting detection
  const roleEventsByRoleId: Record<string, { event_date: string }[]> = {}
  for (const ev of alertEvents ?? []) {
    const e = ev as { role_id: string; event_date: string }
    if (!roleEventsByRoleId[e.role_id]) roleEventsByRoleId[e.role_id] = []
    roleEventsByRoleId[e.role_id].push({ event_date: e.event_date })
  }

  const alertRoles = computeAlertRoles(allRoles, roleEventsByRoleId)

  // Career Snapshot: active roles for mini-timeline
  const activeForTimeline = active.slice(0, 6)

  const STAGE_TIMELINE_COLORS: Record<string, string> = {
    exploring: 'bg-slate-400',
    applied: 'bg-blue-400',
    screening: 'bg-yellow-400',
    interviewing: 'bg-sky-500',
    offer: 'bg-purple-500',
    negotiating: 'bg-indigo-500',
    resolved: 'bg-green-500',
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <h1 className="mb-2 font-headline text-2xl font-extrabold text-slate-900">Overview</h1>
      <p className="mb-8 text-sm text-slate-500">Your job search at a glance</p>

      {/* Career Snapshot mini-timeline */}
      {activeForTimeline.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">Career Snapshot</p>
          <div className="relative flex items-center gap-0">
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 -translate-y-1/2" />
            <div className="relative flex w-full items-center justify-between gap-2">
              {activeForTimeline.map((role) => (
                <Link
                  key={role.id}
                  href={`/roles/${role.id}`}
                  className="group flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className={`h-3 w-3 rounded-full ${STAGE_TIMELINE_COLORS[role.stage] ?? 'bg-slate-400'} ring-2 ring-white shadow-sm group-hover:scale-125 transition-transform`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[80px]">{role.company.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[80px]">{role.stage}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ghosting / deadline alerts */}
      <GhostingAlerts roles={alertRoles} />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active roles', value: active.length, icon: Briefcase, colorIdx: 0 },
          { label: 'Pending offers', value: offers.length, icon: TrendingUp, colorIdx: 1 },
          { label: 'Documents classified', value: classified, icon: FileText, colorIdx: 2 },
          { label: 'Total tracked', value: allRoles.length, icon: Clock, colorIdx: 3 },
        ].map(({ label, value, icon: Icon, colorIdx }) => {
          const colors = STAT_ICON_COLORS[colorIdx]
          return (
            <Card key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 pt-6 pb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div>
                  <p className="text-5xl font-extrabold text-slate-900 leading-none">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active roles */}
        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg font-extrabold text-slate-900">Active roles</CardTitle>
            <Link href="/pipeline" className="text-sm text-sky-700 hover:text-sky-600 font-medium">
              View pipeline →
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {active.slice(0, 6).map((role) => (
              <Link
                key={role.id}
                href={`/roles/${role.id}`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{role.role_title}</p>
                  <p className="text-sm text-slate-500">{role.company.name}</p>
                </div>
                <Badge className={cn('text-xs font-medium border-0', STAGE_COLORS[role.stage] ?? 'bg-slate-100 text-slate-600')}>
                  {role.stage}
                </Badge>
              </Link>
            ))}
            {active.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                No active roles.{' '}
                <Link href="/pipeline" className="text-sky-700 hover:text-sky-600">
                  Add one →
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-extrabold text-slate-900">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => {
              const role = event.role
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">{event.title}</p>
                    {role && (
                      <p className="text-xs text-slate-500">
                        {role.role_title} @ {role.company.name}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            {events.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                No activity yet. Drop a document to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
