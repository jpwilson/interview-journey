import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UpgradeButton } from '@/components/settings/UpgradeButton'
import { CopyButton } from '@/components/settings/CopyButton'
import { isPaidTier } from '@/lib/limits'
import { CheckCircle, Crown, Mail } from 'lucide-react'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; upgrade?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
  ])

  const tier = (sub?.tier ?? 'free') as 'free' | 'pro' | 'lifetime'
  const isPro = isPaidTier(tier)

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <h1
        className="mb-8 text-3xl font-extrabold text-slate-900"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Settings
      </h1>

      {params.upgraded === 'true' && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
          <CheckCircle className="h-5 w-5 shrink-0" />
          Welcome to Pro! Your account has been upgraded.
        </div>
      )}

      {params.upgrade && (
        <div className="mb-6 rounded-xl bg-[var(--accent-ij-wash)] border border-[var(--accent-ij-wash)] p-4 text-[var(--accent-ij-ink)]">
          This feature requires a Pro plan. Upgrade below to unlock it.
        </div>
      )}

      {/* Account */}
      <Card className="mb-6 border-slate-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Email</p>
            <p className="text-slate-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">Name</p>
            <p className="text-slate-900">{profile?.display_name ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Email forwarding */}
      <Card className="mb-6 border-slate-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail className="h-5 w-5 text-[var(--accent-ij-ink)]" />
          <CardTitle className="text-slate-900 font-bold">Email forwarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-500">Your personal forwarding address</p>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <code className="flex-1 select-all font-mono text-sm text-[var(--accent-ij-ink)]">
                parse+{user.id}@interviewjourney.app
              </code>
              <CopyButton text={`parse+${user.id}@interviewjourney.app`} />
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Forward any email from recruiters, interview invitations, or offer letters to this
            address. We&apos;ll automatically classify and update your roles.
          </p>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 font-bold">Plan</CardTitle>
          {isPro && (
            <Badge className="bg-green-100 text-green-700 border-0">
              <Crown className="mr-1 h-3 w-3" /> Pro
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-3">
              <p className="text-slate-500">You&apos;re on the Pro plan — unlimited everything.</p>
              {sub?.current_period_end && (
                <p className="text-sm text-slate-400">
                  Renews {new Date(sub.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-500">
                You&apos;re on the Free plan (10 applications, 25 document uploads).
              </p>
              <div className="space-y-2 text-sm text-slate-500">
                {[
                  'Unlimited applications',
                  'Unlimited document uploads',
                  'Career timeline',
                  'Multi-company timeline view',
                  'CSV/JSON export',
                  'Priority AI processing',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[var(--accent-ij-ink)]" />
                    {f}
                  </div>
                ))}
              </div>
              <UpgradeButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
