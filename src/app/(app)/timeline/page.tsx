import { createClient } from '@/lib/supabase/server'
import { CareerTimeline } from '@/components/timeline/CareerTimeline'
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
    .from('applications')
    .select(`
      *,
      company:companies(*),
      timeline_events(*)
    `)
    .order('applied_at', { ascending: true })

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Career Timeline</h1>
      <CareerTimeline applications={data ?? []} />
    </div>
  )
}
