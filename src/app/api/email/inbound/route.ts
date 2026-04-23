import { createServiceClient } from '@/lib/supabase/server'

// POST /api/email/inbound
// Accepts Postmark inbound webhook format.
// Users forward recruiter emails to: parse+{userId}@interviewjourney.app
export async function POST(request: Request) {
  const body = await request.json()

  // Postmark inbound format
  const { From, Subject, TextBody, HtmlBody, To } = body as {
    From: string
    Subject: string
    TextBody?: string
    HtmlBody?: string
    To: string | { Email: string }[]
    Attachments?: unknown[]
  }

  // Extract user ID from To address: parse+{userId}@interviewjourney.app
  const toAddress = Array.isArray(To) ? (To[0] as { Email: string })?.Email : To
  const userMatch = toAddress?.match(/parse\+([a-zA-Z0-9_-]+)@/)
  if (!userMatch) {
    return Response.json({ error: 'Invalid recipient format' }, { status: 400 })
  }

  const userId = userMatch[1]

  // Sanitise HTML fallback
  const bodyText =
    TextBody ||
    (HtmlBody
      ? HtmlBody.replace(/<[^>]+>/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
      : '')

  const content = `Subject: ${Subject}\nFrom: ${From}\n\n${bodyText}`

  const service = createServiceClient()

  // Verify user exists
  const { data: profile } = await service.from('profiles').select('id').eq('id', userId).single()

  if (!profile) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  // Store email body as a plain-text file in Storage
  const fileName = `email_${Date.now()}.txt`
  const storagePath = `${userId}/email/${fileName}`
  const blob = new Blob([content], { type: 'text/plain' })

  const { error: uploadError } = await service.storage
    .from('documents')
    .upload(storagePath, blob, { contentType: 'text/plain', upsert: false })

  if (uploadError) {
    console.error('[email/inbound] Storage upload failed:', uploadError.message)
    return Response.json({ error: 'Storage upload failed' }, { status: 500 })
  }

  // Insert document record
  const { data: doc, error: docError } = await service
    .from('documents')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      file_name: fileName,
      file_type: 'text/plain',
      classification_status: 'pending',
    })
    .select()
    .single()

  if (docError || !doc) {
    console.error('[email/inbound] Document insert failed:', docError?.message)
    return Response.json({ error: 'Failed to store document record' }, { status: 500 })
  }

  // Fire-and-forget: trigger classification pipeline
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  if (appUrl) {
    fetch(`${appUrl}/api/documents/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id, userId }),
    }).catch((err) => console.error('[email/inbound] Classify trigger failed:', err))
  }

  return Response.json({ received: true, documentId: doc.id })
}
