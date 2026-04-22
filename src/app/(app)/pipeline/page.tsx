import { createClient } from '@/lib/supabase/server'
import type { RoleWithCompany } from '@/lib/supabase/types'
import { PipelineTabs } from '@/components/pipeline/PipelineTabs'

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .order('kanban_order', { ascending: true })

  const roles = (data ?? []) as RoleWithCompany[]
  const initialTab = (await searchParams).tab === 'board' ? 'board' : 'table'

  return <PipelineTabs initialRoles={roles} initialTab={initialTab} />
}
