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

  return (
    <DropZoneProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileTopbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <FloatingHub />
    </DropZoneProvider>
  )
}
