import { createClient } from '@/lib/supabase/server'
import { DropShowcase, type RecentDrop } from '@/components/documents/DropShowcase'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function DropPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select(
      'id, file_name, classification_status, doc_type, extracted_summary, created_at, role:roles(role_title, company:companies(name))',
    )
    .order('created_at', { ascending: false })
    .limit(5)

  type DocRow = {
    id: string
    file_name: string
    classification_status: string | null
    doc_type: string | null
    extracted_summary: string | null
    created_at: string
    role: { role_title: string; company: { name: string } | null } | null
  }

  const recent: RecentDrop[] = ((data ?? []) as unknown as DocRow[]).map((d) => ({
    id: d.id,
    filename: d.file_name,
    routed: d.role
      ? `${d.role.company?.name ?? '—'} · ${d.role.role_title}`
      : d.classification_status === 'pending' || d.classification_status === 'processing'
        ? 'classifying…'
        : 'needs review',
    status:
      d.classification_status === 'classified'
        ? 'attached'
        : d.classification_status === 'failed'
          ? 'failed'
          : d.classification_status === 'processing'
            ? 'processing'
            : 'pending',
    when: formatDistanceToNow(new Date(d.created_at), { addSuffix: true }),
  }))

  return <DropShowcase recent={recent} />
}
