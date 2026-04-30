import { createClient } from '@/lib/supabase/server'
import { FileText, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { PageHeader, PageShell } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/button'
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
  const needsReview = documents.filter(
    (d) => d.needs_review || d.classification_status === 'failed'
  )

  return (
    <PageShell>
      <PageHeader
        kicker="Documents"
        title={`${documents.length} ${documents.length === 1 ? 'document' : 'documents'}`}
        subtitle="Every file the AI has classified or routed. Drop anything anywhere in the app — recruiter email, offer PDF, NDA, screenshot — and it lands on the right role."
        right={
          <Link href="/documents/drop">
            <Button
              size="sm"
              className="border-0 text-white"
              style={{ background: 'var(--accent-ij-ink)' }}
            >
              Open drop flow →
            </Button>
          </Link>
        }
      />

      <div style={{ padding: '22px 22px 80px', maxWidth: 1100, margin: '0 auto' }}>
        {needsReview.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'color-mix(in srgb, var(--status-warn) 10%, var(--paper))',
                color: 'var(--status-warn)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <AlertCircle size={12} /> Needs review · {needsReview.length}
            </div>
            <div
              style={{
                border: '1px solid var(--paper-ink)',
                borderRadius: 6,
                background: 'var(--card)',
                overflow: 'hidden',
              }}
            >
              {needsReview.map((doc, i) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <FileText size={16} style={{ color: 'var(--status-warn)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.file_name}
                      </p>
                      {doc.extracted_summary && (
                        <p style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                          {doc.extracted_summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'color-mix(in srgb, var(--status-warn) 12%, var(--paper))',
                      color: 'var(--status-warn)',
                    }}
                  >
                    {doc.classification_status === 'failed' ? 'Failed' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {documents.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              border: '1px dashed var(--paper-ink)',
              background: 'var(--card)',
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <FileText className="mb-3 h-10 w-10" style={{ color: 'var(--ink-5)' }} />
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              No documents yet
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-4)' }}>
              Drop any file anywhere in the app to upload it.
            </p>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid var(--paper-ink)',
              borderRadius: 6,
              background: 'var(--card)',
              overflow: 'hidden',
            }}
          >
            {documents.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
                  gap: 12,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}
                >
                  <FileText size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {doc.file_name}
                    </p>
                    {doc.role ? (
                      <Link
                        href={`/roles/${doc.role_id}`}
                        style={{
                          fontSize: 11,
                          color: 'var(--accent-ij-ink)',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        {doc.role.role_title} @ {doc.role.company.name}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--ink-5)' }}>
                        Not linked to a role
                      </span>
                    )}
                    <p
                      style={{
                        fontSize: 10,
                        color: 'var(--ink-5)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 2,
                      }}
                    >
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {doc.doc_type && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'var(--paper-2)',
                        color: 'var(--ink-3)',
                      }}
                    >
                      {doc.doc_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {doc.classification_status === 'pending' && (
                    <Clock size={14} style={{ color: 'var(--status-warn)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
