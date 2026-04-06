import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UpgradeButton } from '@/components/settings/UpgradeButton'
import { CheckCircle, Crown } from 'lucide-react'

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

  const isPro = sub?.tier === 'pro'

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-white">Settings</h1>

      {params.upgraded === 'true' && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-600/20 p-4 text-green-400">
          <CheckCircle className="h-5 w-5" />
          Welcome to Pro! Your account has been upgraded.
        </div>
      )}

      {params.upgrade && (
        <div className="mb-6 rounded-lg bg-blue-600/20 p-4 text-blue-400">
          This feature requires a Pro plan. Upgrade below to unlock it.
        </div>
      )}

      {/* Profile */}
      <Card className="mb-6 border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Name</p>
            <p className="text-white">{profile?.display_name ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Plan</CardTitle>
          {isPro && (
            <Badge className="bg-purple-600 text-white">
              <Crown className="mr-1 h-3 w-3" /> Pro
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-3">
              <p className="text-slate-400">You&apos;re on the Pro plan — unlimited everything.</p>
              {sub?.current_period_end && (
                <p className="text-sm text-slate-500">
                  Renews {new Date(sub.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400">
                You&apos;re on the Free plan (10 applications, 25 document uploads).
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                {[
                  'Unlimited applications',
                  'Unlimited document uploads',
                  'Career timeline',
                  'Multi-company timeline view',
                  'CSV/JSON export',
                  'Priority AI processing',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
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
