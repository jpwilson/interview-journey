'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveCompanyNotes(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notes = formData.get('notes') as string | null

  await supabase
    .from('companies')
    .update({ notes: notes || null })
    .eq('id', companyId)
    .eq('user_id', user.id)

  revalidatePath(`/companies/${companyId}`)
}
