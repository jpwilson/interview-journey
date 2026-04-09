import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, FileText, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-500',
  applied: 'bg-slate-600',
  screening: 'bg-yellow-600',
  interviewing: 'bg-blue-600',
  offer: 'bg-purple-600',
  negotiating: 'bg-indigo-600',
  resolved: 'bg-slate-400',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: roles }, { data: documents }, { data: recentEvents }] = await Promise.all([
    supabase
      .from('roles')
      .select('*, company:companies(*)')
      .order('updated_at', { ascending: false }),
    supabase.from('documents').select('id, classification_status').limit(1000),
    supabase
      .from('role_events')
      .select('*, role:roles(role_title, company:companies(name))')
      .order('created_at', { ascending: false })
      .limit(5),
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

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active roles', value: active.length, icon: Briefcase, color: 'text-blue-400' },
          { label: 'Pending offers', value: offers.length, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Documents classified', value: classified, icon: FileText, color: 'text-green-400' },
          { label: 'Total tracked', value: allRoles.length, icon: Clock, color: 'text-slate-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-slate-700 bg-slate-800">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700">
                <Icon className={cn('h-6 w-6', color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active roles */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Active roles</CardTitle>
            <Link href="/pipeline" className="text-sm text-blue-400 hover:text-blue-300">
              View pipeline →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {active.slice(0, 6).map((role) => (
              <Link
                key={role.id}
                href={`/roles/${role.id}`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-700"
              >
                <div>
                  <p className="font-medium text-white">{role.role_title}</p>
                  <p className="text-sm text-slate-400">{role.company.name}</p>
                </div>
                <Badge className={cn('text-white text-xs', STAGE_COLORS[role.stage] ?? 'bg-slate-600')}>
                  {role.stage}
                </Badge>
              </Link>
            ))}
            {active.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
                No active roles.{' '}
                <Link href="/pipeline" className="text-blue-400">
                  Add one →
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => {
              const role = event.role
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{event.title}</p>
                    {role && (
                      <p className="text-xs text-slate-400">
                        {role.role_title} @ {role.company.name}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            {events.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">
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
