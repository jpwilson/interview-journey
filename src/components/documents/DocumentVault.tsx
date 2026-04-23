'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { Document } from '@/lib/supabase/types'

const STATUS_ICONS = {
  pending: Clock,
  processing: RefreshCw,
  classified: CheckCircle,
  failed: AlertCircle,
}

const STATUS_COLORS = {
  pending: 'text-yellow-500',
  processing: 'text-[var(--accent-ij-ink)]',
  classified: 'text-green-600',
  failed: 'text-red-500',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  offer_letter: 'Offer Letter',
  rejection_email: 'Rejection',
  interview_confirmation: 'Interview',
  nda: 'NDA',
  screening_email: 'Screening',
  assessment: 'Assessment',
  reference_request: 'Reference',
  application_confirmation: 'Application',
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  other: 'Other',
  unknown: 'Unknown',
}

interface Props {
  documents: Document[]
  roleId: string
}

export function DocumentVault({ documents, roleId }: Props) {
  const [docs, setDocs] = useState(documents)
  const supabase = createClient()

  async function handleDownload(doc: Document) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      toast.error('Could not generate download link')
    }
  }

  async function handleRetry(doc: Document) {
    toast.loading(`Retrying classification for ${doc.file_name}…`, { id: doc.id })
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, classification_status: 'processing' } : d))
    )

    await fetch('/api/documents/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id }),
    })

    // Subscribe to result
    const channel = supabase
      .channel(`retry:${doc.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'documents', filter: `id=eq.${doc.id}` },
        (payload) => {
          const updated = payload.new as Document
          setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, ...updated } : d)))
          if (updated.classification_status === 'classified') {
            toast.success(`Classified as ${DOC_TYPE_LABELS[updated.doc_type ?? 'unknown']}`, {
              id: doc.id,
            })
          } else if (updated.classification_status === 'failed') {
            toast.error('Classification failed', { id: doc.id })
          }
          supabase.removeChannel(channel)
        }
      )
      .subscribe()
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-500">No documents yet.</p>
        <p className="mt-1 text-sm text-slate-400">Drop any file onto the page to attach it.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => {
        const StatusIcon = STATUS_ICONS[doc.classification_status]
        const statusColor = STATUS_COLORS[doc.classification_status]

        return (
          <Card key={doc.id} className="rounded-xl border border-slate-100 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{doc.file_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                    <span className={`text-xs ${statusColor}`}>{doc.classification_status}</span>
                    {doc.doc_type && (
                      <Badge variant="outline" className="border-slate-200 text-xs text-slate-500">
                        {DOC_TYPE_LABELS[doc.doc_type]}
                      </Badge>
                    )}
                    {doc.ai_confidence && (
                      <span className="text-xs text-slate-400">
                        {Math.round(doc.ai_confidence * 100)}% confident
                      </span>
                    )}
                  </div>
                  {doc.extracted_summary && (
                    <p className="mt-1 text-xs text-slate-500">{doc.extracted_summary}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.classification_status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => handleRetry(doc)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--accent-ij-ink)] hover:bg-[var(--accent-ij-wash)] hover:text-[var(--accent-ij-ink)]"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
