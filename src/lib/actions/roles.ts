'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { RoleStage } from '@/lib/supabase/types'
import { checkLimits } from '@/lib/limits'

export async function createRole(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await checkLimits(user.id, 'roles')

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

  const { data: role, error } = await supabase
    .from('roles')
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

  if (error || !role) throw new Error('Failed to create role')

  // Create initial timeline event
  await supabase.from('role_events').insert({
    user_id: user.id,
    role_id: role.id,
    event_type: 'applied',
    title: `Applied to ${companyName}`,
    event_date: new Date().toISOString(),
    source: 'manual',
  })

  revalidatePath('/roles')
  revalidatePath('/pipeline')
  redirect(`/roles/${role.id}`)
}

export async function updateRoleStage(roleId: string, stage: RoleStage) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: role, error } = await supabase
    .from('roles')
    .update({ stage })
    .eq('id', roleId)
    .eq('user_id', user.id)
    .select('*, company:companies(name)')
    .single()

  if (error || !role) throw new Error('Failed to update stage')

  // Create stage_changed timeline event
  await supabase.from('role_events').insert({
    user_id: user.id,
    role_id: roleId,
    event_type: 'stage_changed',
    title: `Moved to ${stage}`,
    event_date: new Date().toISOString(),
    metadata: { to_stage: stage },
    source: 'manual',
  })

  revalidatePath('/pipeline')
  revalidatePath(`/roles/${roleId}`)
}

export async function updateKanbanOrder(
  updates: { id: string; kanban_order: number; stage: RoleStage }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await Promise.all(
    updates.map(({ id, kanban_order, stage }) =>
      supabase
        .from('roles')
        .update({ kanban_order, stage })
        .eq('id', id)
        .eq('user_id', user.id)
    )
  )

  revalidatePath('/pipeline')
}

export async function addRoleEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roleId = formData.get('role_id') as string
  const eventType = formData.get('event_type') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const eventDate = (formData.get('event_date') as string) || new Date().toISOString()

  await supabase.from('role_events').insert({
    user_id: user.id,
    role_id: roleId,
    event_type: eventType as never,
    title,
    description: description || null,
    event_date: eventDate,
    source: 'manual',
  })

  revalidatePath(`/roles/${roleId}`)
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)
    .eq('user_id', user.id)

  revalidatePath('/roles')
  revalidatePath('/pipeline')
  redirect('/roles')
}

// ---------------------------------------------------------------------------
// Legacy re-exports — keep old names working during migration
// ---------------------------------------------------------------------------

/** @deprecated Use createRole */
export const createApplication = createRole
/** @deprecated Use updateRoleStage */
export const updateApplicationStage = updateRoleStage
/** @deprecated Use addRoleEvent */
export const addTimelineEvent = addRoleEvent
/** @deprecated Use deleteRole */
export const deleteApplication = deleteRole
