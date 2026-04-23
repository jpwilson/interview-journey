import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ApplicationTimeline } from '@/components/timeline/ApplicationTimeline'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { AddEventForm } from '@/components/timeline/AddEventForm'
import { MeetingsList } from '@/components/meetings/MeetingsList'
import { deleteRole } from '@/lib/actions/roles'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageShell } from '@/components/ui/PageHeader'
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_DOT: Record<string, string> = {
  exploring: 'var(--s-exploring)',
  applied: 'var(--s-applied)',
  screening: 'var(--s-screening)',
  interviewing: 'var(--s-interview)',
  offer: 'var(--s-offer)',
  negotiating: 'var(--s-negotiate)',
  resolved: 'var(--s-hired)',
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: roleData }, { data: events }, { data: documents }, { data: meetings }] = await Promise.all([
    supabase
      .from('roles')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single(),
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

  const stageDot = STAGE_DOT[role.stage] ?? 'var(--ink-4)'

  return (
    <PageShell>
      {/* Editorial page header */}
      <header style={{ padding: '24px 22px 18px', borderBottom: '1px solid var(--paper-ink)', background: 'var(--card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
              Role · {role.company.name}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}>
              {role.role_title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--ink-4)', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: stageDot }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageDot }} />
                {role.stage}
              </span>
              {role.resolution && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  · {role.resolution}
                </span>
              )}
              {role.location && <span>· {role.location}</span>}
              {role.remote_type && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>· {role.remote_type}</span>
              )}
              {(role.salary_min || role.salary_max) && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)' }}>
                  · ${role.salary_min ? (role.salary_min / 1000).toFixed(0) : '?'}k
                  {role.salary_max ? `–${(role.salary_max / 1000).toFixed(0)}k` : '+'} {role.currency}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {role.job_url && (
              <a href={role.job_url} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: 'var(--paper-ink)', background: 'var(--card)', color: 'var(--ink-3)' }}
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
                  style={{ color: 'var(--ink-5)' }}
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
      </header>

      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <Tabs defaultValue="timeline">
          <TabsList className="mb-6 bg-transparent border-b rounded-none w-full justify-start gap-0 p-0 h-auto" style={{ borderColor: 'var(--paper-ink)' }}>
          <TabsTrigger
            value="timeline"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-slate-500 font-medium data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:text-[var(--accent-ij-ink)] data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
          >
            Timeline ({events?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="meetings"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-slate-500 font-medium data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:text-[var(--accent-ij-ink)] data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
          >
            Meetings ({meetings?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-slate-500 font-medium data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:text-[var(--accent-ij-ink)] data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
          >
            Documents ({documents?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="add-event"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-slate-500 font-medium data-[state=active]:border-[var(--accent-ij-ink)] data-[state=active]:text-[var(--accent-ij-ink)] data-[state=active]:bg-transparent hover:text-slate-900 transition-colors"
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
    </PageShell>
  )
}
