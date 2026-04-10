'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markFollowUpSent(roleId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await Promise.all([
    supabase
      .from('roles')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', roleId)
      .eq('user_id', user.id),
    supabase.from('role_events').insert({
      user_id: user.id,
      role_id: roleId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event_type: 'follow_up_sent' as any,
      title: 'Follow-up sent',
      event_date: new Date().toISOString(),
      source: 'manual',
    }),
  ])

  revalidatePath('/dashboard')
}
