import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Building2, FileText, Users, StickyNote, Briefcase } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { saveCompanyNotes } from '@/lib/actions/companies'
import type { Company, Role, RoleEvent, Document, Contact } from '@/lib/supabase/types'
import { CompanyDocumentDownload } from '@/components/documents/CompanyDocumentDownload'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-100 text-slate-600',
  applied: 'bg-slate-100 text-slate-600',
  screening: 'bg-yellow-100 text-yellow-700',
  interviewing: 'bg-blue-100 text-blue-700',
  offer: 'bg-purple-100 text-purple-700',
  negotiating: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  resolved: 'bg-slate-100 text-slate-500',
}

const STAGE_DOT_COLORS: Record<string, string> = {
  exploring: 'bg-slate-400',
  applied: 'bg-slate-500',
  screening: 'bg-yellow-500',
  interviewing: 'bg-blue-500',
  offer: 'bg-purple-500',
  negotiating: 'bg-[var(--accent-ij-wash)]0',
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
    return { label: 'Alumni', color: 'bg-green-100 text-green-700' }
  }
  if (roles.some((r) => r.stage !== 'resolved')) {
    return { label: 'Active pursuit', color: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]' }
  }
  return { label: 'Previously applied', color: 'bg-slate-100 text-slate-600' }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: companyData }, { data: rolesData }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase
      .from('roles')
      .select('*, role_events(*)')
      .eq('company_id', id)
      .order('applied_at', { ascending: false }),
  ])

  if (!companyData) notFound()

  const company = companyData as Company
  const roles = (rolesData ?? []) as RoleWithEvents[]
  const roleIds = roles.map((r) => r.id)

  const [{ data: docs }, { data: roleContacts }] = roleIds.length > 0
    ? await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .in('role_id', roleIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('role_contacts')
          .select('*, contact:contacts(*)')
          .in('role_id', roleIds),
      ])
    : [{ data: [] as Document[] }, { data: [] as RoleContact[] }]

  const documents = (docs ?? []) as Document[]
  const contacts = (roleContacts ?? []) as RoleContact[]

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

  const docsByRole = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const roleId = doc.role_id ?? '__unlinked__'
    if (!acc[roleId]) acc[roleId] = []
    acc[roleId].push(doc)
    return acc
  }, {})

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
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      {/* Editorial header */}
      <header style={{ padding: '24px 22px 18px', borderBottom: '1px solid var(--paper-ink)', background: 'var(--card)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
          Company
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', marginTop: 4, letterSpacing: -0.3 }}>
            {company.name}
          </h1>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              background: status.color.includes('green') ? 'var(--accent-ij-wash)' : 'var(--paper-2)',
              color: status.color.includes('green') ? 'var(--accent-ij-ink)' : 'var(--ink-3)',
            }}
          >
            {status.label}
          </span>
        </div>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              fontSize: 12,
              color: 'var(--accent-ij-ink)',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} />
            {company.website.replace(/^https?:\/\//, '')}
          </a>
        )}

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Applications', value: applicationCount },
            { label: 'Interviews', value: interviewCount },
            { label: 'Offers', value: offerCount, accent: offerCount > 0 },
            {
              label: 'Last applied',
              value: lastApplied ? formatDistanceToNow(new Date(lastApplied), { addSuffix: true }) : '—',
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              style={{
                background: accent ? 'var(--accent-ij-wash)' : 'var(--paper-2)',
                border: `1px solid ${accent ? 'var(--accent-ij-wash)' : 'var(--border-soft)'}`,
                borderRadius: 6,
                padding: '10px 14px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: accent ? 'var(--accent-ij-ink)' : 'var(--ink-4)',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: typeof value === 'number' ? 'var(--font-serif)' : 'var(--font-sans)',
                  fontSize: typeof value === 'number' ? 22 : 13,
                  fontWeight: 500,
                  color: accent ? 'var(--accent-ij-ink)' : 'var(--ink)',
                  marginTop: 4,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Tabs */}
      <Tabs defaultValue="roles">
        <TabsList className="mb-6 bg-white border border-slate-100 shadow-sm">
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white text-slate-600"
          >
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white text-slate-600"
          >
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white text-slate-600"
          >
            People ({contactMap.size})
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white text-slate-600"
          >
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Roles */}
        <TabsContent value="roles">
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="mb-4 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">No roles tracked at this company yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const events = [...role.role_events].sort(
                  (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                )
                return (
                  <Link key={role.id} href={`/roles/${role.id}`}>
                    <Card className="border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900">{role.role_title}</p>
                              <Badge className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-100 text-slate-600'} text-xs border-0`}>
                                {role.stage}
                              </Badge>
                              {role.resolution && (
                                <Badge variant="outline" className="border-slate-200 text-slate-500 text-xs capitalize">
                                  {RESOLUTION_LABELS[role.resolution] ?? role.resolution}
                                </Badge>
                              )}
                            </div>
                            {role.applied_at && (
                              <p className="mt-1 text-xs text-slate-400">
                                Applied {format(new Date(role.applied_at), 'MMM d, yyyy')}
                              </p>
                            )}

                            {events.length > 0 && (
                              <div className="mt-3 flex items-center gap-1">
                                {events.map((event, i) => (
                                  <div key={event.id} className="flex items-center gap-1">
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT_COLORS[role.stage] ?? 'bg-slate-400'} ring-1 ring-white`}
                                      title={event.title}
                                    />
                                    {i < events.length - 1 && (
                                      <div className="h-px w-4 bg-slate-200" />
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
              <FileText className="mb-4 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">No documents linked to any role at this company.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {roles.map((role) => {
                const roleDocs = docsByRole[role.id]
                if (!roleDocs || roleDocs.length === 0) return null
                return (
                  <div key={role.id}>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">
                      <Link href={`/roles/${role.id}`} className="hover:text-[var(--accent-ij-ink)] transition-colors">
                        {role.role_title}
                      </Link>
                    </h3>
                    <div className="space-y-2">
                      {roleDocs.map((doc) => (
                        <Card key={doc.id} className="border-slate-100 bg-white shadow-sm">
                          <CardContent className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{doc.file_name}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                  {doc.doc_type && (
                                    <Badge variant="outline" className="border-slate-200 text-xs text-slate-500 capitalize">
                                      {doc.doc_type.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                  <span
                                    className={`text-xs ${
                                      doc.classification_status === 'classified'
                                        ? 'text-green-600'
                                        : doc.classification_status === 'failed'
                                        ? 'text-red-500'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {doc.classification_status}
                                  </span>
                                </div>
                                {doc.extracted_summary && (
                                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{doc.extracted_summary}</p>
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
              <Users className="mb-4 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">No contacts linked to roles at this company.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(contactMap.values()).map(({ contact, roles: contactRoles }) => (
                <Card key={contact.id} className="border-slate-100 bg-white shadow-sm">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{contact.name}</p>
                        {contact.title && (
                          <p className="text-sm text-slate-500">{contact.title}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {contactRoles.map((cr) => {
                            const role = roles.find((r) => r.id === cr.roleId)
                            return (
                              <div key={cr.roleId} className="flex items-center gap-1.5">
                                {cr.relationship && (
                                  <Badge
                                    className={`text-xs border-0 ${
                                      cr.relationship === 'recruiter'
                                        ? 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]'
                                        : cr.relationship === 'interviewer'
                                        ? 'bg-purple-100 text-purple-700'
                                        : cr.relationship === 'hiring_manager'
                                        ? 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {cr.relationship.replace(/_/g, ' ')}
                                  </Badge>
                                )}
                                {role && (
                                  <Link
                                    href={`/roles/${role.id}`}
                                    className="text-xs text-slate-400 hover:text-[var(--accent-ij-ink)] transition-colors"
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
                          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:border-[var(--accent-ij-wash)]">
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
              className="min-h-48 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[var(--accent-ij)]/20"
            />
            <Button type="submit" className="bg-[var(--accent-ij-ink)] hover:bg-[var(--accent-ij-ink)] text-white">
              <StickyNote className="mr-2 h-4 w-4" /> Save notes
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
