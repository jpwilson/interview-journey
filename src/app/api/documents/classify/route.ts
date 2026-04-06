import { createClient, createServiceClient } from '@/lib/supabase/server'
import { classifyDocument, docTypeToEventType, inferStageAdvance } from '@/lib/ai/classify'
import type { ClassificationResult } from '@/lib/ai/classify'

// Langfuse is optional — only init if real keys are present
function maybeGetLangfuse() {
  const pk = process.env.LANGFUSE_PUBLIC_KEY
  const sk = process.env.LANGFUSE_SECRET_KEY
  if (!pk || !sk || pk.includes('placeholder')) return null
  try {
    const { Langfuse } = require('langfuse')
    return new Langfuse({ publicKey: pk, secretKey: sk, baseUrl: process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com' })
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const { documentId } = await request.json()
  if (!documentId) return Response.json({ error: 'documentId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client for writes (bypasses RLS on internal operations)
  const service = createServiceClient()

  // Mark as processing
  await service
    .from('documents')
    .update({ classification_status: 'processing' })
    .eq('id', documentId)
    .eq('user_id', user.id)

  // Run classification in background — respond immediately
  processDocument(documentId, user.id, service).catch(async (err) => {
    console.error('Classification failed:', err)
    await service
      .from('documents')
      .update({ classification_status: 'failed' })
      .eq('id', documentId)
  })

  return Response.json({ status: 'processing' })
}

async function processDocument(documentId: string, userId: string, service: ReturnType<typeof createServiceClient>) {
  const langfuse = maybeGetLangfuse()
  const trace = langfuse?.trace({ name: 'document-classification', userId, metadata: { documentId } })

  // Fetch document record
  const { data: doc } = await service
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!doc) throw new Error('Document not found')

  // Fetch file from Supabase Storage
  const { data: fileData } = await service.storage
    .from('documents')
    .download(doc.storage_path)

  if (!fileData) throw new Error('File not found in storage')

  let content: string

  if (doc.file_type.startsWith('image/')) {
    // Convert to base64 data URL for vision models
    const buffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    content = `data:${doc.file_type};base64,${base64}`
  } else if (doc.file_type === 'application/pdf') {
    // For PDFs: extract as text if possible; otherwise send as base64
    const text = await fileData.text()
    content = text.trim() || `[Binary PDF — ${doc.file_name}]`
  } else {
    content = await fileData.text()
  }

  const span = trace?.span({ name: 'classify', input: { documentId, mimeType: doc.file_type } })

  let result: ClassificationResult
  try {
    result = await classifyDocument(content, doc.file_type)
    span?.end({ output: result })
  } catch (err) {
    span?.end({ level: 'ERROR', statusMessage: String(err) })
    await langfuse?.flushAsync()
    throw err
  }

  const needsReview = result.confidence < 0.6

  // Fuzzy company match — use try/catch since .single() throws on no match
  let companyId: string | null = null
  try {
    const { data: matchedCompany } = await service
      .from('companies')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', `%${result.company_name ?? ''}%`)
      .limit(1)
      .single()
    companyId = matchedCompany?.id ?? null
  } catch {
    companyId = null
  }

  let applicationId: string | null = doc.application_id

  if (result.company_name && !needsReview) {
    // Get or create company
    if (!companyId) {
      const { data: newCompany } = await service
        .from('companies')
        .insert({ user_id: userId, name: result.company_name })
        .select()
        .single()
      companyId = newCompany?.id ?? null
    }

    if (companyId && !applicationId) {
      // Find most recent open application for this company — try/catch for no-match
      try {
        const { data: existingApp } = await service
          .from('applications')
          .select('id, stage')
          .eq('user_id', userId)
          .eq('company_id', companyId)
          .not('stage', 'in', '("hired","rejected","withdrawn")')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingApp) {
          applicationId = existingApp.id

          // Advance stage if appropriate
          const newStage = inferStageAdvance(existingApp.stage, result.doc_type)
          if (newStage) {
            await service
              .from('applications')
              .update({ stage: newStage as import('@/lib/supabase/types').ApplicationStage })
              .eq('id', applicationId as string)
          }
        }
      } catch {
        // No existing application — create stub unless it's a resume/cover letter
        if (result.doc_type !== 'resume' && result.doc_type !== 'cover_letter') {
          const { data: newApp } = await service
            .from('applications')
            .insert({
              user_id: userId,
              company_id: companyId,
              role_title: result.role_title ?? 'Unknown Role',
              stage: 'applied' as const,
            })
            .select()
            .single()
          applicationId = newApp?.id ?? null
        }
      }
    }

    // Create timeline event
    if (applicationId) {
      await service.from('timeline_events').insert({
        user_id: userId,
        application_id: applicationId,
        event_type: docTypeToEventType(result.doc_type) as import('@/lib/supabase/types').TimelineEventType,
        title: result.summary,
        event_date: result.event_date ?? new Date().toISOString(),
        metadata: {
          doc_id: documentId,
          doc_type: result.doc_type,
          interview_details: result.interview_details,
          offer_details: result.offer_details,
        },
        source: 'ai_parsed',
      })
    }
  }

  // Update document record with classification results
  await service.from('documents').update({
    classification_status: 'classified',
    application_id: applicationId,
    doc_type: result.doc_type,
    ai_confidence: result.confidence,
    ai_raw_response: result as unknown as Record<string, unknown>,
    extracted_company: result.company_name,
    extracted_role: result.role_title,
    extracted_date: result.event_date,
    extracted_outcome: result.outcome,
    extracted_summary: result.summary,
    needs_review: needsReview,
  }).eq('id', documentId)

  await langfuse?.flushAsync()
}
