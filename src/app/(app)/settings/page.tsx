import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UpgradeButton } from '@/components/settings/UpgradeButton'
import { CopyButton } from '@/components/settings/CopyButton'
import { CheckCircle, Crown, Mail } from 'lucide-react'
import { PageHeader, PageShell, EditorialCard, SectionLabel } from '@/components/ui/PageHeader'

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
    <PageShell>
      <PageHeader kicker="Settings" title="Your account" />

      <div style={{ padding: '22px 22px 80px', maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {params.upgraded === 'true' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 6,
              background: 'color-mix(in srgb, var(--status-ok) 12%, var(--paper))',
              border: '1px solid color-mix(in srgb, var(--status-ok) 30%, var(--paper))',
              padding: 14,
              color: 'var(--status-ok)',
              fontSize: 13,
            }}
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            Welcome to Pro — your account has been upgraded.
          </div>
        )}

        {params.upgrade && (
          <div
            style={{
              borderRadius: 6,
              background: 'var(--accent-ij-wash)',
              border: '1px solid color-mix(in srgb, var(--accent-ij) 30%, var(--paper))',
              padding: 14,
              color: 'var(--accent-ij-ink)',
              fontSize: 13,
            }}
          >
            This feature requires a Pro plan. Upgrade below to unlock it.
          </div>
        )}

        <section>
          <SectionLabel>Account</SectionLabel>
          <EditorialCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 4 }}>
                  Email
                </p>
                <p style={{ color: 'var(--ink)', fontSize: 14 }}>{user.email}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 4 }}>
                  Name
                </p>
                <p style={{ color: 'var(--ink)', fontSize: 14 }}>{profile?.display_name ?? '—'}</p>
              </div>
            </div>
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Mail size={11} /> Email forwarding
            </span>
          </SectionLabel>
          <EditorialCard>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 10 }}>
              Your personal forwarding address
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid var(--paper-ink)',
                background: 'var(--paper-2)',
                borderRadius: 4,
                padding: '10px 12px',
              }}
            >
              <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-ij-ink)', userSelect: 'all' }}>
                parse+{user.id}@interviewjourney.app
              </code>
              <CopyButton text={`parse+${user.id}@interviewjourney.app`} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 10, lineHeight: 1.5 }}>
              Forward any recruiter email, interview invitation, or offer letter to this address.
              The AI classifies it and updates your roles automatically.
            </p>
          </EditorialCard>
        </section>

        <section>
          <SectionLabel>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Plan</span>
              {isPro && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--accent-ij-wash)',
                    color: 'var(--accent-ij-ink)',
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  <Crown size={11} /> Pro
                </span>
              )}
            </span>
          </SectionLabel>
          <EditorialCard>
            {isPro ? (
              <div>
                <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                  You&apos;re on the Pro plan — unlimited everything.
                </p>
                {sub?.current_period_end && (
                  <p style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-4)' }}>
                    Renews {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
                  You&apos;re on the Free plan. Unlimited tracking is included; Pro unlocks intelligence.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Unlimited AI classifications',
                    'Unlimited document storage',
                    'Career timeline (Pro)',
                    'Multi-company timeline view',
                    'CSV / PDF export',
                    'Priority AI processing',
                    'Monthly market-pulse digest',
                  ].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                      <CheckCircle size={14} style={{ color: 'var(--accent-ij-ink)' }} />
                      {f}
                    </div>
                  ))}
                </div>
                <UpgradeButton />
              </div>
            )}
          </EditorialCard>
        </section>
      </div>
    </PageShell>
  )
}
