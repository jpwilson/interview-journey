import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Archive, RotateCcw, Trash2, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { restoreRole, purgeRole } from '@/lib/actions/roles'
import type { RoleWithCompany } from '@/lib/supabase/types'

export default async function ArchivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  const archived = (data ?? []) as (RoleWithCompany & { deleted_at: string })[]

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Archive className="h-5 w-5 text-slate-500" />
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Archive</h1>
      </div>
      <p className="mb-8 text-sm text-slate-500">
        Deleted roles live here. Restore to put them back into your pipeline, or delete permanently to
        remove them and their events, meetings, and documents.
      </p>

      {archived.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <Archive className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">Archive is empty</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            When you delete a role, it lands here — not gone, just tucked away. You can restore it anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {archived.map((role) => (
            <Card key={role.id} className="bg-white rounded-xl border border-slate-100 shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{role.role_title}</p>
                    <p className="truncate text-sm text-slate-500">{role.company.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Deleted {formatDistanceToNow(new Date(role.deleted_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="hidden border-0 bg-slate-100 text-xs text-slate-500 sm:inline-flex">
                    {role.stage}
                  </Badge>
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Restore
                      </Button>
                    }
                    title={`Restore ${role.role_title}?`}
                    description={`This puts ${role.role_title} at ${role.company.name} back into your pipeline at its previous stage (${role.stage}).`}
                    confirmLabel="Restore role"
                    onConfirm={restoreRole.bind(null, role.id)}
                  />
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete permanently?"
                    description={`This permanently removes ${role.role_title} at ${role.company.name}, along with all its timeline events, meetings, and documents. This can't be undone.`}
                    confirmLabel="Delete forever"
                    variant="destructive"
                    onConfirm={purgeRole.bind(null, role.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
