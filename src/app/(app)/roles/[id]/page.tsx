import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplicationTimeline } from '@/components/timeline/ApplicationTimeline'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { AddEventForm } from '@/components/timeline/AddEventForm'
import { MeetingsList } from '@/components/meetings/MeetingsList'
import { deleteRole } from '@/lib/actions/roles'
import { ExternalLink, Trash2, Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-100 text-slate-600',
  applied: 'bg-blue-50 text-blue-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interviewing: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  offer: 'bg-purple-50 text-purple-700',
  negotiating: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  resolved: 'bg-green-50 text-green-700',
}

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: roleData }, { data: events }, { data: documents }, { data: meetings }] =
    await Promise.all([
      supabase.from('roles').select('*, company:companies(*)').eq('id', id).single(),
      supabase
        .from('role_events')
        .select('*')
        .eq('role_id', id)
        .order('event_date', { ascending: false }),
      supabase
        .from('documents')
        .select('*')
        .eq('role_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('meetings')
        .select('*')
        .eq('role_id', id)
        .order('scheduled_at', { ascending: true }),
    ])

  if (!roleData) notFound()

  const role = roleData as RoleWithCompany

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      {/* Header */}
      <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-ij-wash)]">
              <Building2 className="h-7 w-7 text-[var(--accent-ij-ink)]" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-slate-900">
                {role.role_title}
              </h1>
              <p className="text-lg text-slate-500">{role.company.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Badge
                  className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-100 text-slate-600'} border-0 text-xs font-medium`}
                >
                  {role.stage}
                </Badge>
                {role.resolution && (
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-xs text-slate-500 capitalize"
                  >
                    {role.resolution}
                  </Badge>
                )}
                {role.location && <span className="text-sm text-slate-500">{role.location}</span>}
                {role.remote_type && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 capitalize">
                    {role.remote_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role.job_url && (
              <a href={role.job_url} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Job listing
                </Button>
              </a>
            )}
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete role"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Delete this role?"
              description={`This permanently removes ${role.role_title} at ${role.company.name}, along with its timeline, meetings, and documents. This can’t be undone.`}
              confirmLabel="Delete role"
              variant="destructive"
              onConfirm={deleteRole.bind(null, role.id)}
            />
          </div>
        </div>

        {/* Salary */}
        {(role.salary_min || role.salary_max) && (
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs tracking-wide text-slate-400 uppercase">Compensation</p>
            <p className="text-xl font-bold text-slate-900">
              ${role.salary_min ? (role.salary_min / 1000).toFixed(0) : '?'}k
              {role.salary_max ? ` – $${(role.salary_max / 1000).toFixed(0)}k` : '+'}{' '}
              <span className="text-sm font-normal text-slate-400">{role.currency}</span>
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="mb-6 h-auto w-full justify-start gap-0 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="timeline"
            className="rounded-none border-b-2 border-transparent px-4 pt-0 pb-3 font-medium text-slate-500 transition-colors hover:text-slate-900 data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-ij-ink)]"
          >
            Timeline ({events?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="rounded-none border-b-2 border-transparent px-4 pt-0 pb-3 font-medium text-slate-500 transition-colors hover:text-slate-900 data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-ij-ink)]"
          >
            Meetings ({meetings?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none border-b-2 border-transparent px-4 pt-0 pb-3 font-medium text-slate-500 transition-colors hover:text-slate-900 data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-ij-ink)]"
          >
            Documents ({documents?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="add-event"
            className="rounded-none border-b-2 border-transparent px-4 pt-0 pb-3 font-medium text-slate-500 transition-colors hover:text-slate-900 data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-ij-ink)]"
          >
            Add event
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <ApplicationTimeline events={events ?? []} />
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingsList meetings={meetings ?? []} roleId={role.id} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentVault documents={documents ?? []} roleId={role.id} />
        </TabsContent>

        <TabsContent value="add-event">
          <AddEventForm roleId={role.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
