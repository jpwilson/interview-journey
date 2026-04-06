import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplicationTimeline } from '@/components/timeline/ApplicationTimeline'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { AddEventForm } from '@/components/timeline/AddEventForm'
import { deleteApplication } from '@/lib/actions/applications'
import { ExternalLink, Trash2, Building2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApplicationWithCompany } from '@/lib/supabase/types'

const STAGE_COLORS: Record<string, string> = {
  applied: 'bg-slate-600',
  screening: 'bg-yellow-600',
  interview: 'bg-blue-600',
  offer: 'bg-purple-600',
  hired: 'bg-green-600',
  rejected: 'bg-red-600',
  withdrawn: 'bg-slate-500',
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: appData }, { data: events }, { data: documents }] = await Promise.all([
    supabase
      .from('applications')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('timeline_events')
      .select('*')
      .eq('application_id', id)
      .order('event_date', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!appData) notFound()

  const app = appData as ApplicationWithCompany

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-700">
            <Building2 className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{app.role_title}</h1>
            <p className="text-lg text-slate-400">{app.company.name}</p>
            <div className="mt-2 flex items-center gap-3">
              <Badge className={`${STAGE_COLORS[app.stage]} text-white`}>{app.stage}</Badge>
              {app.location && <span className="text-sm text-slate-500">{app.location}</span>}
              {app.remote_type && (
                <span className="text-sm text-slate-500 capitalize">{app.remote_type}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <ExternalLink className="mr-2 h-4 w-4" /> Job listing
              </Button>
            </a>
          )}
          <form action={deleteApplication.bind(null, app.id)}>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Salary */}
      {(app.salary_min || app.salary_max) && (
        <div className="mb-6 rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Compensation</p>
          <p className="text-xl font-bold text-white">
            ${app.salary_min ? (app.salary_min / 1000).toFixed(0) : '?'}k
            {app.salary_max ? ` – $${(app.salary_max / 1000).toFixed(0)}k` : '+'}
            {' '}
            <span className="text-sm font-normal text-slate-400">{app.currency}</span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="mb-6 bg-slate-800">
          <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-700">
            Timeline ({events?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700">
            Documents ({documents?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="add-event" className="data-[state=active]:bg-slate-700">
            Add event
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <ApplicationTimeline events={events ?? []} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentVault documents={documents ?? []} applicationId={app.id} />
        </TabsContent>

        <TabsContent value="add-event">
          <AddEventForm applicationId={app.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
