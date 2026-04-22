import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Document } from '@/lib/supabase/types'

type DocumentWithRole = Document & {
  role: { role_title: string; company: { name: string } } | null
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('documents')
    .select('*, role:roles(role_title, company:companies(name))')
    .order('created_at', { ascending: false })

  const documents = (data ?? []) as DocumentWithRole[]
  const needsReview = documents.filter((d) => d.needs_review || d.classification_status === 'failed')

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <h1 className="mb-8 font-headline text-2xl font-extrabold text-slate-900">Documents</h1>

      {needsReview.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-amber-700">Needs review ({needsReview.length})</h2>
          </div>
          <div className="space-y-2">
            {needsReview.map((doc) => (
              <Card key={doc.id} className="border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{doc.file_name}</p>
                      {doc.extracted_summary && (
                        <p className="text-xs text-slate-500">{doc.extracted_summary}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                    {doc.classification_status === 'failed' ? 'Failed' : 'Review needed'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-semibold text-slate-900">No documents yet</p>
            <p className="text-sm text-slate-500">Drop any file anywhere in the app to upload it</p>
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.file_name}</p>
                    {doc.role ? (
                      <Link
                        href={`/roles/${doc.role_id}`}
                        className="text-xs text-sky-700 hover:text-sky-600 font-medium"
                      >
                        {doc.role.role_title} @ {doc.role.company.name}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">Not linked to a role</span>
                    )}
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.doc_type && (
                    <Badge variant="outline" className="border-slate-200 text-xs text-slate-500">
                      {doc.doc_type.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {doc.classification_status === 'pending' && (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
