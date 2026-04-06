'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStage } from '@/lib/supabase/types'
import { checkLimits } from '@/lib/limits'

export async function createApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await checkLimits(user.id, 'applications')

  const companyName = formData.get('company_name') as string
  const roleTitle = formData.get('role_title') as string
  const jobUrl = formData.get('job_url') as string | null
  const notes = formData.get('notes') as string | null

  // Get or create company
  let companyId: string
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', companyName)
    .limit(1)
    .single()

  if (existing) {
    companyId = existing.id
  } else {
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert({ user_id: user.id, name: companyName })
      .select()
      .single()
    if (error || !newCompany) throw new Error('Failed to create company')
    companyId = newCompany.id
  }

  const { data: app, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      company_id: companyId,
      role_title: roleTitle,
      job_url: jobUrl || null,
      notes: notes || null,
      stage: 'applied',
      applied_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !app) throw new Error('Failed to create application')

  // Create initial timeline event
  await supabase.from('timeline_events').insert({
    user_id: user.id,
    application_id: app.id,
    event_type: 'applied',
    title: `Applied to ${companyName}`,
    event_date: new Date().toISOString(),
    source: 'manual',
  })

  revalidatePath('/applications')
  revalidatePath('/pipeline')
  redirect(`/applications/${app.id}`)
}

export async function updateApplicationStage(applicationId: string, stage: ApplicationStage) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: app, error } = await supabase
    .from('applications')
    .update({ stage })
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .select('*, company:companies(name)')
    .single()

  if (error || !app) throw new Error('Failed to update stage')

  const typedApp = app as unknown as { stage: ApplicationStage }

  // Create stage_changed timeline event
  await supabase.from('timeline_events').insert({
    user_id: user.id,
    application_id: applicationId,
    event_type: 'stage_changed',
    title: `Moved to ${stage}`,
    event_date: new Date().toISOString(),
    metadata: { from_stage: typedApp.stage, to_stage: stage },
    source: 'manual',
  })

  revalidatePath('/pipeline')
  revalidatePath(`/applications/${applicationId}`)
}

export async function updateKanbanOrder(
  updates: { id: string; kanban_order: number; stage: ApplicationStage }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await Promise.all(
    updates.map(({ id, kanban_order, stage }) =>
      supabase
        .from('applications')
        .update({ kanban_order, stage })
        .eq('id', id)
        .eq('user_id', user.id)
    )
  )

  revalidatePath('/pipeline')
}

export async function addTimelineEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const applicationId = formData.get('application_id') as string
  const eventType = formData.get('event_type') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const eventDate = (formData.get('event_date') as string) || new Date().toISOString()

  await supabase.from('timeline_events').insert({
    user_id: user.id,
    application_id: applicationId,
    event_type: eventType as never,
    title,
    description: description || null,
    event_date: eventDate,
    source: 'manual',
  })

  revalidatePath(`/applications/${applicationId}`)
}

export async function deleteApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('user_id', user.id)

  revalidatePath('/applications')
  revalidatePath('/pipeline')
  redirect('/applications')
}
