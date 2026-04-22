'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { RoleStage } from '@/lib/supabase/types'
import { checkLimits } from '@/lib/limits'

const ROLE_STAGES = [
  'exploring', 'applied', 'screening', 'interviewing', 'offer', 'negotiating', 'resolved',
] as const

const EVENT_TYPES = [
  'applied', 'screening_scheduled', 'screening_completed',
  'interview_scheduled', 'interview_completed', 'technical_assessment',
  'offer_received', 'offer_accepted', 'offer_declined', 'offer_rescinded',
  'rejected', 'withdrawn', 'reference_check', 'nda_signed',
  'document_added', 'note_added', 'stage_changed',
] as const

const addRoleEventSchema = z.object({
  role_id: z.string().uuid(),
  event_type: z.enum(EVENT_TYPES),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().trim().max(2000, 'Description is too long').optional().nullable(),
  event_date: z.string().datetime().optional().or(z.literal('')).nullable(),
})

const kanbanUpdateSchema = z.array(
  z.object({
    id: z.string().uuid(),
    kanban_order: z.number().int().min(0).max(1_000_000),
    stage: z.enum(ROLE_STAGES),
  }),
).min(1).max(200)

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

  const parsed = kanbanUpdateSchema.safeParse(updates)
  if (!parsed.success) {
    throw new Error(`Invalid kanban update: ${parsed.error.issues[0]?.message ?? 'validation failed'}`)
  }

  // Pre-verify every role id belongs to this user so we don't silently no-op on forged ids.
  const ids = parsed.data.map((u) => u.id)
  const { data: owned, error: selectErr } = await supabase
    .from('roles')
    .select('id')
    .in('id', ids)
    .eq('user_id', user.id)

  if (selectErr) throw new Error('Failed to verify role ownership')
  const ownedIds = new Set((owned ?? []).map((r) => r.id))
  if (ownedIds.size !== ids.length) {
    throw new Error('Unauthorized: one or more roles do not belong to this user')
  }

  const results = await Promise.all(
    parsed.data.map(({ id, kanban_order, stage }) =>
      supabase
        .from('roles')
        .update({ kanban_order, stage })
        .eq('id', id)
        .eq('user_id', user.id),
    ),
  )

  const firstErr = results.find((r) => r.error)?.error
  if (firstErr) throw new Error(`Kanban update failed: ${firstErr.message}`)

  revalidatePath('/pipeline')
}

export async function addRoleEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rawDate = (formData.get('event_date') as string | null) ?? null
  const parsed = addRoleEventSchema.safeParse({
    role_id: formData.get('role_id'),
    event_type: formData.get('event_type'),
    title: formData.get('title'),
    description: formData.get('description'),
    event_date: rawDate ? new Date(rawDate).toISOString() : null,
  })

  if (!parsed.success) {
    throw new Error(`Invalid event: ${parsed.error.issues[0]?.message ?? 'validation failed'}`)
  }

  // Verify the role belongs to this user before writing an event against it.
  const { data: role, error: ownErr } = await supabase
    .from('roles')
    .select('id')
    .eq('id', parsed.data.role_id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (ownErr) throw new Error('Failed to verify role')
  if (!role) throw new Error('Role not found')

  const { error: insertErr } = await supabase.from('role_events').insert({
    user_id: user.id,
    role_id: parsed.data.role_id,
    event_type: parsed.data.event_type,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    event_date: parsed.data.event_date ?? new Date().toISOString(),
    source: 'manual',
  })
  if (insertErr) throw new Error(`Failed to add event: ${insertErr.message}`)

  revalidatePath(`/roles/${parsed.data.role_id}`)
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
