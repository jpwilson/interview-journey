import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/AppSidebar'
import { MobileTopbar } from '@/components/MobileTopbar'
import { DropZoneProvider } from '@/components/providers/DropZoneProvider'
import { FloatingHub } from '@/components/hub/FloatingHub'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ count: pipelineCount }, { count: docsPending }, { count: activeOffers }] = await Promise.all([
    supabase.from('roles').select('*', { count: 'exact', head: true }).neq('stage', 'resolved'),
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('classification_status', ['pending', 'processing']),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const sidebarProps = {
    pipelineCount: pipelineCount ?? undefined,
    documentsCount: docsPending ?? undefined,
    hasActiveOffer: (activeOffers ?? 0) > 0,
  }

  return (
    <DropZoneProvider>
      <div
        className="relative flex h-screen overflow-hidden"
        style={{
          // Paper base + three very soft moss radial washes, all baked into
          // a single background image so pages can sit transparent on top.
          backgroundColor: 'var(--paper)',
          backgroundImage: [
            'radial-gradient(circle at 15% 5%, var(--accent-ij-glow-a), transparent 45%)',
            'radial-gradient(circle at 92% 85%, var(--accent-ij-glow-b), transparent 45%)',
            'radial-gradient(circle at 55% 45%, var(--accent-ij-glow-c), transparent 55%)',
          ].join(', '),
        }}
      >
        <div className="hidden md:flex relative z-10">
          <AppSidebar {...sidebarProps} />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          <MobileTopbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <FloatingHub />
    </DropZoneProvider>
  )
}
