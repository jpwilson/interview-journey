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
    .from('offers')
    .select('id, base_salary, signing_bonus, equity, currency, start_date, deadline, status, notes, role:roles(role_title, company:companies(name))')
    .order('created_at', { ascending: false })

  if (error) return new Response('Failed to fetch offers', { status: 500 })

  type Row = {
    company: string
    role_title: string
    status: string
    base_salary: number | null
    signing_bonus: number | null
    equity: string | null
    currency: string | null
    start_date: string | null
    deadline: string | null
    notes: string | null
  }

  const rows: Row[] = (data ?? []).map((o) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = o as any
    return {
      company: row.role?.company?.name ?? '',
      role_title: row.role?.role_title ?? '',
      status: row.status,
      base_salary: row.base_salary,
      signing_bonus: row.signing_bonus,
      equity: row.equity,
      currency: row.currency,
      start_date: row.start_date,
      deadline: row.deadline,
      notes: row.notes,
    }
  })

  const csv = toCsv(rows, [
    'company', 'role_title', 'status', 'base_salary', 'signing_bonus', 'equity',
    'currency', 'start_date', 'deadline', 'notes',
  ])

  const date = new Date().toISOString().slice(0, 10)
  return csvResponse(csv, `interview-journey-offers-${date}.csv`)
}
