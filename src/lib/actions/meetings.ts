'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addMeeting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const roleId = formData.get('role_id') as string
  const title = (formData.get('title') as string) || (formData.get('meeting_type') as string) || 'Meeting'

  await supabase.from('meetings').insert({
    user_id: user.id,
    role_id: roleId,
    title,
    meeting_type: formData.get('meeting_type') as string || null,
    scheduled_at: formData.get('scheduled_at') as string || null,
    duration_minutes: formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null,
    platform: formData.get('platform') as string || null,
    notes: formData.get('notes') as string || null,
    outcome: 'pending',
  })

  revalidatePath(`/roles/${roleId}`)
}

export async function updateMeetingOutcome(meetingId: string, outcome: string, roleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('meetings')
    .update({ outcome })
    .eq('id', meetingId)
    .eq('user_id', user.id)

  revalidatePath(`/roles/${roleId}`)
}
