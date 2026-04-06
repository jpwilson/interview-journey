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

  return (
    <DropZoneProvider>
      <div className="flex h-screen overflow-hidden bg-slate-900">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <FloatingHub />
    </DropZoneProvider>
  )
}
