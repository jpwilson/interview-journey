import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/AppSidebar'
import { DropZoneProvider } from '@/components/providers/DropZoneProvider'
import { FloatingHub } from '@/components/hub/FloatingHub'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Sidebar badge counts + conditional-visibility state.
  const [{ count: pipelineCount }, { count: docsPending }, { count: activeOffers }] = await Promise.all([
    supabase.from('roles').select('*', { count: 'exact', head: true }).neq('stage', 'resolved'),
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('classification_status', ['pending', 'processing']),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <DropZoneProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--paper)' }}>
        <AppSidebar
          pipelineCount={pipelineCount ?? undefined}
          documentsCount={docsPending ?? undefined}
          hasActiveOffer={(activeOffers ?? 0) > 0}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <FloatingHub />
    </DropZoneProvider>
  )
}
