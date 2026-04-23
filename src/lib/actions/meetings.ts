'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addMeeting(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roleId = formData.get('role_id') as string

  await supabase.from('meetings').insert({
    user_id: user.id,
    role_id: roleId,
    type: (formData.get('type') as string) || 'other',
    scheduled_at: formData.get('scheduled_at') as string,
    round_number: formData.get('round_number') ? Number(formData.get('round_number')) : null,
    duration_minutes: formData.get('duration_minutes')
      ? Number(formData.get('duration_minutes'))
      : null,
    format: (formData.get('format') as string) || null,
    platform: (formData.get('platform') as string) || null,
    prep_notes: (formData.get('prep_notes') as string) || null,
    questions_to_ask: (formData.get('questions_to_ask') as string) || null,
    outcome: 'pending',
  })

  revalidatePath(`/roles/${roleId}`)
}

export async function updateMeetingOutcome(
  meetingId: string,
  outcome: string,
  outcomeNotes: string,
  roleId: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('meetings')
    .update({ outcome, outcome_notes: outcomeNotes })
    .eq('id', meetingId)
    .eq('user_id', user.id)

  revalidatePath(`/roles/${roleId}`)
}
