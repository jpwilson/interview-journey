import { createClient } from '@/lib/supabase/server'

const LIMITS = {
  free: { applications: 10, documents_total: 25, ai_per_month: 20 },
  pro: { applications: Infinity, documents_total: Infinity, ai_per_month: Infinity },
} as const

type LimitKey = 'applications' | 'documents_total' | 'ai_per_month'

export async function checkLimits(userId: string, key: LimitKey): Promise<void> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single()

  const tier = (sub?.tier ?? 'free') as 'free' | 'pro'
  const limit = LIMITS[tier][key]
  if (limit === Infinity) return

  let count = 0

  if (key === 'applications') {
    const { count: c } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('stage', 'in', '("hired","rejected","withdrawn")')
    count = c ?? 0
  } else if (key === 'documents_total') {
    const { count: c } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    count = c ?? 0
  } else if (key === 'ai_per_month') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const { count: c } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())
      .eq('classification_status', 'classified')
    count = c ?? 0
  }

  if (count >= limit) {
    throw new Error(
      `Free plan limit reached (${limit} ${key}). Upgrade to Pro for unlimited access.`
    )
  }
}

export async function getUserTier(userId: string): Promise<'free' | 'pro'> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single()
  return (data?.tier ?? 'free') as 'free' | 'pro'
}
