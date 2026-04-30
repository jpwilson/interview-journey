import { createClient } from '@/lib/supabase/server'

// Free is the "Keeper" tier — unlimited organizing, intelligence (AI + storage) gated.
// See docs/research/launch-brief.md §7: the organizing surface is a commodity;
// intelligence is what pays. Removing the roles cap lets every user treat this
// as their career archive forever, which is what drives retention.
const LIMITS = {
  free: { roles: Infinity, documents_total: 100, ai_per_month: 30 },
  pro: { roles: Infinity, documents_total: Infinity, ai_per_month: Infinity },
} as const

type LimitKey = 'roles' | 'documents_total' | 'ai_per_month'

export async function checkLimits(userId: string, key: LimitKey): Promise<void> {
  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single()

  const rawTier = (sub?.tier ?? 'free') as 'free' | 'pro' | 'lifetime'
  // Lifetime gets Pro limits.
  const tier: 'free' | 'pro' = rawTier === 'free' ? 'free' : 'pro'
  const limit = LIMITS[tier][key]
  if (limit === Infinity) return

  let count = 0

  if (key === 'roles') {
    const { count: c } = await supabase
      .from('roles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('stage', 'in', '("resolved")')
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

export async function getUserTier(userId: string): Promise<'free' | 'pro' | 'lifetime'> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single()
  return (data?.tier ?? 'free') as 'free' | 'pro' | 'lifetime'
}

/** Lifetime has the same feature set as Pro — this helper makes gates read cleanly. */
export function isPaidTier(tier: 'free' | 'pro' | 'lifetime'): boolean {
  return tier === 'pro' || tier === 'lifetime'
}
