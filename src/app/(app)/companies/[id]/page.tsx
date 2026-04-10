import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Building2, FileText, Users, StickyNote, Briefcase, Download } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { saveCompanyNotes } from '@/lib/actions/companies'
import type { Company, Role, RoleEvent, Document, Contact } from '@/lib/supabase/types'
import { CompanyDocumentDownload } from '@/components/documents/CompanyDocumentDownload'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-500',
  applied: 'bg-slate-600',
  screening: 'bg-yellow-600',
  interviewing: 'bg-blue-600',
  offer: 'bg-purple-600',
  negotiating: 'bg-indigo-600',
  resolved: 'bg-slate-400',
}

const STAGE_DOT_COLORS: Record<string, string> = {
  exploring: 'bg-slate-400',
  applied: 'bg-slate-500',
  screening: 'bg-yellow-500',
  interviewing: 'bg-blue-500',
  offer: 'bg-purple-500',
  negotiating: 'bg-indigo-500',
  resolved: 'bg-slate-400',
}

const RESOLUTION_LABELS: Record<string, string> = {
  hired: 'Hired',
  rejected: 'Rejected',
  withdrew: 'Withdrew',
  offer_declined: 'Offer Declined',
  ghosted: 'Ghosted',
  on_hold: 'On Hold',
}

type RoleWithEvents = Role & { role_events: RoleEvent[] }

type RoleContact = {
  id: string
  role_id: string
  contact_id: string
  relationship: string | null
  created_at: string
  contact: Contact
}

function getCompanyStatus(roles: RoleWithEvents[]): { label: string; color: string } {
  if (roles.some((r) => r.resolution === 'hired')) {
    return { label: 'Alumni', color: 'bg-green-600' }
  }
  if (roles.some((r) => r.stage !== 'resolved')) {
    return { label: 'Active pursuit', color: 'bg-blue-600' }
  }
  return { label: 'Previously applied', color: 'bg-slate-600' }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: companyData },
    { data: rolesData },
    { data: documentsData },
    { data: roleContactsData },
  ] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('roles')
      .select('*, role_events(*)')
      .eq('company_id', id)
      .order('applied_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .in(
        'role_id',
        // We fetch roles first in parallel — we use a subquery approach via RPC isn't available,
        // so we'll re-fetch after the parallel block if needed. For now pass empty array guard.
        ['__placeholder__']
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('role_contacts')
      .select('*, contact:contacts(*)')
      .in('role_id', ['__placeholder__']),
  ])

  if (!companyData) notFound()

  const company = companyData as Company
  const roles = (rolesData ?? []) as RoleWithEvents[]
  const roleIds = roles.map((r) => r.id)

  // Fetch documents and contacts scoped to this company's roles
  const [{ data: docs }, { data: roleContacts }] = await Promise.all([
    roleIds.length > 0
      ? supabase
          .from('documents')
          .select('*')
          .in('role_id', roleIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Document[] }),
    roleIds.length > 0
      ? supabase
          .from('role_contacts')
          .select('*, contact:contacts(*)')
          .in('role_id', roleIds)
      : Promise.resolve({ data: [] as RoleContact[] }),
  ])

  const documents = (docs ?? []) as Document[]
  const contacts = (roleContacts ?? []) as RoleContact[]

  // Stats
  const applicationCount = roles.length
  const interviewCount = roles.filter(
    (r) => r.stage === 'interviewing' || r.role_events.some((e) => e.event_type.startsWith('interview'))
  ).length
  const offerCount = roles.filter((r) => r.stage === 'offer' || r.stage === 'negotiating' || r.resolution === 'hired' || r.resolution === 'offer_declined').length
  const lastApplied = roles.reduce<string | null>((acc, r) => {
    const d = r.applied_at ?? r.created_at
    if (!acc || d > acc) return d
    return acc
  }, null)

  const status = getCompanyStatus(roles)

  // Group documents by role
  const docsByRole = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const roleId = doc.role_id ?? '__unlinked__'
    if (!acc[roleId]) acc[roleId] = []
    acc[roleId].push(doc)
    return acc
  }, {})

  // Deduplicate contacts by contact_id, keep all role associations
  const contactMap = new Map<string, { contact: Contact; roles: { roleId: string; relationship: string | null }[] }>()
  for (const rc of contacts) {
    const existing = contactMap.get(rc.contact_id)
    if (existing) {
      existing.roles.push({ roleId: rc.role_id, relationship: rc.relationship })
    } else {
      contactMap.set(rc.contact_id, {
        contact: rc.contact,
        roles: [{ roleId: rc.role_id, relationship: rc.relationship }],
      })
    }
  }

  const saveNotes = saveCompanyNotes.bind(null, company.id)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-700">
              <Building2 className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <Badge className={`${status.color} text-white text-xs`}>{status.label}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-xs text-slate-400">Applications</p>
            <p className="text-2xl font-bold text-white">{applicationCount}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-xs text-slate-400">Interviews</p>
            <p className="text-2xl font-bold text-white">{interviewCount}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-xs text-slate-400">Offers</p>
            <p className="text-2xl font-bold text-white">{offerCount}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-xs text-slate-400">Last applied</p>
            <p className="text-sm font-medium text-white">
              {lastApplied
                ? formatDistanceToNow(new Date(lastApplied), { addSuffix: true })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles">
        <TabsList className="mb-6 bg-slate-800">
          <TabsTrigger value="roles" className="data-[state=active]:bg-slate-700">
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="people" className="data-[state=active]:bg-slate-700">
            People ({contactMap.size})
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-slate-700">
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Roles */}
        <TabsContent value="roles">
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="mb-4 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No roles tracked at this company yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const events = [...role.role_events].sort(
                  (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                )
                return (
                  <Link key={role.id} href={`/roles/${role.id}`}>
                    <Card className="border-slate-700 bg-slate-800 transition-colors hover:border-slate-600 hover:bg-slate-750">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-white">{role.role_title}</p>
                              <Badge className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-600'} text-white text-xs`}>
                                {role.stage}
                              </Badge>
                              {role.resolution && (
                                <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs capitalize">
                                  {RESOLUTION_LABELS[role.resolution] ?? role.resolution}
                                </Badge>
                              )}
                            </div>
                            {role.applied_at && (
                              <p className="mt-1 text-xs text-slate-500">
                                Applied {format(new Date(role.applied_at), 'MMM d, yyyy')}
                              </p>
                            )}

                            {/* Mini event timeline */}
                            {events.length > 0 && (
                              <div className="mt-3 flex items-center gap-1">
                                {events.map((event, i) => (
                                  <div key={event.id} className="flex items-center gap-1">
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT_COLORS[role.stage] ?? 'bg-slate-500'} ring-1 ring-slate-900`}
                                      title={event.title}
                                    />
                                    {i < events.length - 1 && (
                                      <div className="h-px w-4 bg-slate-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: Documents */}
        <TabsContent value="documents">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No documents linked to any role at this company.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {roles.map((role) => {
                const roleDocs = docsByRole[role.id]
                if (!roleDocs || roleDocs.length === 0) return null
                return (
                  <div key={role.id}>
                    <h3 className="mb-2 text-sm font-medium text-slate-400">
                      <Link href={`/roles/${role.id}`} className="hover:text-white transition-colors">
                        {role.role_title}
                      </Link>
                    </h3>
                    <div className="space-y-2">
                      {roleDocs.map((doc) => (
                        <Card key={doc.id} className="border-slate-700 bg-slate-800">
                          <CardContent className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{doc.file_name}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                  {doc.doc_type && (
                                    <Badge variant="outline" className="border-slate-600 text-xs text-slate-400 capitalize">
                                      {doc.doc_type.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                  <span
                                    className={`text-xs ${
                                      doc.classification_status === 'classified'
                                        ? 'text-green-400'
                                        : doc.classification_status === 'failed'
                                        ? 'text-red-400'
                                        : 'text-yellow-400'
                                    }`}
                                  >
                                    {doc.classification_status}
                                  </span>
                                </div>
                                {doc.extracted_summary && (
                                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{doc.extracted_summary}</p>
                                )}
                              </div>
                            </div>
                            <CompanyDocumentDownload storagePath={doc.storage_path} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: People */}
        <TabsContent value="people">
          {contactMap.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No contacts linked to roles at this company.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(contactMap.values()).map(({ contact, roles: contactRoles }) => (
                <Card key={contact.id} className="border-slate-700 bg-slate-800">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{contact.name}</p>
                        {contact.title && (
                          <p className="text-sm text-slate-400">{contact.title}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {contactRoles.map((cr) => {
                            const role = roles.find((r) => r.id === cr.roleId)
                            return (
                              <div key={cr.roleId} className="flex items-center gap-1.5">
                                {cr.relationship && (
                                  <Badge
                                    className={`text-xs text-white ${
                                      cr.relationship === 'recruiter'
                                        ? 'bg-blue-600'
                                        : cr.relationship === 'interviewer'
                                        ? 'bg-purple-600'
                                        : cr.relationship === 'hiring_manager'
                                        ? 'bg-indigo-600'
                                        : 'bg-slate-600'
                                    }`}
                                  >
                                    {cr.relationship.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {role && (
                                  <Link
                                    href={`/roles/${role.id}`}
                                    className="text-xs text-slate-400 hover:text-white transition-colors"
                                  >
                                    {role.role_title}
                                  </Link>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            <ExternalLink className="h-3 w-3 mr-1" /> LinkedIn
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Notes */}
        <TabsContent value="notes">
          <form action={saveNotes} className="space-y-4">
            <Textarea
              name="notes"
              defaultValue={company.notes ?? ''}
              placeholder="Add notes about this company — culture, interview process, contacts, anything relevant…"
              className="min-h-48 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-slate-600"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
              <StickyNote className="mr-2 h-4 w-4" /> Save notes
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
