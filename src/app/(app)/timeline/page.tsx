import { createClient } from '@/lib/supabase/server'
import { CareerTimeline } from '@/components/timeline/CareerTimeline'
import { ChronicleTimeline } from '@/components/timeline/ChronicleTimeline'
import { TimelineTabs } from '@/components/timeline/TimelineTabs'
import { getUserTier } from '@/lib/limits'
import { redirect } from 'next/navigation'

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier(user.id)
  if (tier === 'free') {
    redirect('/settings?upgrade=timeline')
  }

  const { data } = await supabase
    .from('roles')
    .select(`
      *,
      company:companies(*),
      role_events(*)
    `)
    .order('applied_at', { ascending: true })

  const roles = data ?? []

  // Flatten all events sorted most recent first for Chronicle tab
  const allEvents = roles
    .flatMap((r: any) => r.role_events ?? [])
    .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <h1
        className="mb-8 text-3xl font-extrabold text-slate-900"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Career Timeline
      </h1>
      <TimelineTabs roles={roles} allEvents={allEvents} />
    </div>
  )
}
