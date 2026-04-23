'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// URL-safe alphabet, no ambiguous chars (no 0/O/1/I/l).
const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const SLUG_LEN = 8

function generateSlug(): string {
  // crypto.getRandomValues keeps us out of Math.random's predictable pool.
  const buf = new Uint8Array(SLUG_LEN)
  crypto.getRandomValues(buf)
  let out = ''
  for (let i = 0; i < SLUG_LEN; i++) {
    out += SLUG_ALPHABET[buf[i] % SLUG_ALPHABET.length]
  }
  return out
}

const createSchema = z.object({
  scope: z.enum(['full_timeline', 'single_role']),
  role_id: z.string().uuid().nullable(),
  display_name: z.string().trim().max(60).nullable(),
  anonymize_companies: z.boolean(),
  show_compensation: z.boolean(),
})

export async function createShareLink(formData: FormData): Promise<{ slug: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = createSchema.safeParse({
    scope: formData.get('scope') ?? 'full_timeline',
    role_id: (formData.get('role_id') as string) || null,
    display_name: ((formData.get('display_name') as string | null) ?? '').trim() || null,
    anonymize_companies: formData.get('anonymize_companies') === 'on',
    show_compensation: formData.get('show_compensation') === 'on',
  })

  if (!parsed.success) {
    throw new Error(`Invalid share link: ${parsed.error.issues[0]?.message ?? 'validation failed'}`)
  }
  if (parsed.data.scope === 'single_role' && !parsed.data.role_id) {
    throw new Error('role_id is required when scope is single_role')
  }

  // If a role id is supplied, verify ownership before minting the link.
  if (parsed.data.role_id) {
    const { data: owned } = await supabase
      .from('roles')
      .select('id')
      .eq('id', parsed.data.role_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!owned) throw new Error('Role not found')
  }

  let slug = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateSlug()
    const { data: existing } = await supabase
      .from('share_links')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!existing) {
      slug = candidate
      break
    }
  }
  if (!slug) throw new Error('Failed to generate unique slug — please try again')

  const { error } = await supabase.from('share_links').insert({
    user_id: user.id,
    slug,
    scope: parsed.data.scope,
    role_id: parsed.data.role_id,
    display_name: parsed.data.display_name,
    anonymize_companies: parsed.data.anonymize_companies,
    show_compensation: parsed.data.show_compensation,
  })

  if (error) throw new Error(`Failed to create share link: ${error.message}`)

  revalidatePath('/timeline')
  return { slug }
}

export async function revokeShareLink(slug: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('slug', slug)
    .eq('user_id', user.id)

  if (error) throw new Error(`Failed to revoke share link: ${error.message}`)
  revalidatePath('/timeline')
  revalidatePath(`/s/${slug}`)
}
