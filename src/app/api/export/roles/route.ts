import { createClient } from '@/lib/supabase/server'
import { getUserTier, isPaidTier } from '@/lib/limits'
import { toCsv, csvResponse } from '@/lib/csv'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const tier = await getUserTier(user.id)
  if (!isPaidTier(tier)) {
    return new Response('Export is a Pro feature', { status: 402 })
  }

  const { data, error } = await supabase
    .from('roles')
    .select('id, role_title, stage, resolution, location, remote_type, salary_min, salary_max, currency, job_url, applied_at, updated_at, notes, company:companies(name)')
    .order('updated_at', { ascending: false })

  if (error) return new Response('Failed to fetch roles', { status: 500 })

  type Row = {
    company: string
    role_title: string
    stage: string
    resolution: string | null
    location: string | null
    remote_type: string | null
    salary_min: number | null
    salary_max: number | null
    currency: string | null
    job_url: string | null
    applied_at: string | null
    updated_at: string | null
    notes: string | null
  }

  const rows: Row[] = (data ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = r as any
    return {
      company: row.company?.name ?? '',
      role_title: row.role_title,
      stage: row.stage,
      resolution: row.resolution,
      location: row.location,
      remote_type: row.remote_type,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      currency: row.currency,
      job_url: row.job_url,
      applied_at: row.applied_at,
      updated_at: row.updated_at,
      notes: row.notes,
    }
  })

  const csv = toCsv(rows, [
    'company', 'role_title', 'stage', 'resolution', 'location', 'remote_type',
    'salary_min', 'salary_max', 'currency', 'job_url', 'applied_at', 'updated_at', 'notes',
  ])

  const date = new Date().toISOString().slice(0, 10)
  return csvResponse(csv, `interview-journey-roles-${date}.csv`)
}
