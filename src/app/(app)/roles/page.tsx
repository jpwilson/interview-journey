import { createClient } from '@/lib/supabase/server'
import { createRole } from '@/lib/actions/roles'
import { getUserTier } from '@/lib/limits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Briefcase, MapPin, DollarSign, Download, Lock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { PageHeader, PageShell } from '@/components/ui/PageHeader'
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_DOT: Record<string, string> = {
  exploring: 'var(--s-exploring)',
  applied: 'var(--s-applied)',
  screening: 'var(--s-screening)',
  interviewing: 'var(--s-interview)',
  offer: 'var(--s-offer)',
  negotiating: 'var(--s-negotiate)',
  resolved: 'var(--s-hired)',
}

export default async function RolesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const tier = user ? await getUserTier(user.id) : 'free'

  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .order('updated_at', { ascending: false })

  const roles = (data ?? []) as RoleWithCompany[]

  const rightActions = (
    <>
      {tier === 'pro' ? (
        <a href="/api/export/roles" download>
          <Button
            variant="outline"
            size="sm"
            style={{
              borderColor: 'var(--paper-ink)',
              background: 'var(--card)',
              color: 'var(--ink-3)',
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </a>
      ) : (
        <Link href="/settings?upgrade=export" title="CSV export is a Pro feature">
          <Button
            variant="outline"
            size="sm"
            style={{
              borderColor: 'var(--paper-ink)',
              background: 'var(--card)',
              color: 'var(--ink-5)',
            }}
          >
            <Lock className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </Link>
      )}
      <Dialog>
        <DialogTrigger
          render={
            <Button
              size="sm"
              className="border-0 text-white hover:opacity-90"
              style={{ background: 'var(--accent-ij-ink)' }}
            />
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add role
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: -0.2,
                color: 'var(--ink)',
              }}
            >
              Add new role
            </DialogTitle>
          </DialogHeader>
          <form action={createRole} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label
                htmlFor="company_name"
                style={{ color: 'var(--ink-3)', fontSize: 11, fontWeight: 500 }}
              >
                Company name *
              </Label>
              <Input name="company_name" id="company_name" placeholder="Stripe" required />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="role_title"
                style={{ color: 'var(--ink-3)', fontSize: 11, fontWeight: 500 }}
              >
                Role *
              </Label>
              <Input
                name="role_title"
                id="role_title"
                placeholder="Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="job_url"
                style={{ color: 'var(--ink-3)', fontSize: 11, fontWeight: 500 }}
              >
                Job URL
              </Label>
              <Input name="job_url" id="job_url" placeholder="https://..." type="url" />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                style={{ color: 'var(--ink-3)', fontSize: 11, fontWeight: 500 }}
              >
                Notes
              </Label>
              <Input name="notes" id="notes" placeholder="Optional notes..." />
            </div>
            <Button
              type="submit"
              className="w-full border-0 text-white"
              style={{ background: 'var(--accent-ij-ink)' }}
            >
              Add role
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )

  return (
    <PageShell>
      <PageHeader
        kicker="Roles"
        title={`${roles.length} ${roles.length === 1 ? 'role' : 'roles'} tracked`}
        subtitle="Every role you've opened — active, silent, or resolved. Click any row for the full history."
        right={rightActions}
      />

      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {roles.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              border: '1px dashed var(--paper-ink)',
              background: 'var(--card)',
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <Briefcase className="mb-3 h-10 w-10" style={{ color: 'var(--ink-5)' }} />
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              No roles yet
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-4)' }}>
              Add one manually or drop a document anywhere to let AI create it.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--paper-ink)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {roles.map((role, i) => (
              <Link
                key={role.id}
                href={`/roles/${role.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  gap: 16,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: 'var(--paper-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--ink-3)',
                      flexShrink: 0,
                    }}
                  >
                    {role.company.name[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                      {role.role_title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--ink-4)' }}>{role.company.name}</p>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 11,
                    color: 'var(--ink-4)',
                    flexWrap: 'wrap',
                  }}
                >
                  {role.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {role.location}
                    </span>
                  )}
                  {role.salary_min && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--ink-2)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <DollarSign size={11} />
                      {(role.salary_min / 1000).toFixed(0)}k
                      {role.salary_max ? `–${(role.salary_max / 1000).toFixed(0)}k` : '+'}
                    </span>
                  )}
                  {role.remote_type && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--ink-4)',
                      }}
                    >
                      {role.remote_type}
                    </span>
                  )}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: STAGE_DOT[role.stage] ?? 'var(--ink-4)',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: STAGE_DOT[role.stage] ?? 'var(--ink-4)',
                      }}
                    />
                    {role.stage}
                  </span>
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-5)' }}
                  >
                    {formatDistanceToNow(new Date(role.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
