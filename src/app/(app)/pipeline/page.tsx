import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { RoleWithCompany } from '@/lib/supabase/types'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .not('stage', 'in', '("resolved")')
    .order('kanban_order', { ascending: true })

  const roles = (data ?? []) as RoleWithCompany[]

  return (
    <div className="flex h-full flex-col bg-[#f8f9fa] p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-900">Pipeline</h1>
        <Link href="/roles">
          <Button className="bg-gradient-to-br from-[#00658f] to-[#4ea5d9] text-white rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity">
            <Plus className="mr-2 h-4 w-4" /> Add role
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialRoles={roles} />
      </div>
    </div>
  )
}
