'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(offerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', offerId)
    .eq('user_id', user.id)

  revalidatePath('/offers')
}

export async function declineOffer(offerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('offers')
    .update({ status: 'declined' })
    .eq('id', offerId)
    .eq('user_id', user.id)

  revalidatePath('/offers')
}
