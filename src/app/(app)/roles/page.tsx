import { createClient } from '@/lib/supabase/server'
import { createRole } from '@/lib/actions/roles'
import { getUserTier } from '@/lib/limits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-100 text-slate-600',
  applied: 'bg-blue-50 text-blue-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interviewing: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  offer: 'bg-purple-50 text-purple-700',
  negotiating: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  resolved: 'bg-green-50 text-green-700',
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900">Roles</h1>
        <div className="flex items-center gap-2">
          {tier === 'pro' ? (
            <a href="/api/export/roles" download>
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </a>
          ) : (
            <Link href="/settings?upgrade=export" title="CSV export is a Pro feature">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <Lock className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </Link>
          )}
          <Dialog>
            <DialogTrigger
              render={
                <Button className="rounded-full border-0 bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] px-6 py-2.5 font-semibold text-white shadow-[var(--accent-ij-glow-a)] shadow-lg transition-opacity hover:opacity-90" />
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add role
            </DialogTrigger>
            <DialogContent className="border-slate-100 bg-white text-slate-900 shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-headline font-extrabold text-slate-900">
                  Add new role
                </DialogTitle>
              </DialogHeader>
              <form action={createRole} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-slate-700">
                    Company name *
                  </Label>
                  <Input
                    name="company_name"
                    id="company_name"
                    placeholder="Stripe"
                    required
                    className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[var(--accent-ij)] focus:ring-[var(--accent-ij)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_title" className="text-slate-700">
                    Role *
                  </Label>
                  <Input
                    name="role_title"
                    id="role_title"
                    placeholder="Senior Software Engineer"
                    required
                    className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[var(--accent-ij)] focus:ring-[var(--accent-ij)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_url" className="text-slate-700">
                    Job URL
                  </Label>
                  <Input
                    name="job_url"
                    id="job_url"
                    placeholder="https://..."
                    type="url"
                    className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[var(--accent-ij)] focus:ring-[var(--accent-ij)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-700">
                    Notes
                  </Label>
                  <Input
                    name="notes"
                    id="notes"
                    placeholder="Optional notes..."
                    className="rounded-lg border-slate-200 bg-white text-slate-900 focus:border-[var(--accent-ij)] focus:ring-[var(--accent-ij)]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full border-0 bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] font-semibold text-white shadow-[var(--accent-ij-glow-a)] shadow-lg transition-opacity hover:opacity-90"
                >
                  Add role
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-ij-wash)]">
            <Briefcase className="h-8 w-8 text-[var(--accent-ij-ink)]" />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-900">No roles yet</p>
          <p className="mb-6 text-sm text-slate-500">
            Add one manually or drop a document anywhere to let AI create it
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <Link key={role.id} href={`/roles/${role.id}`}>
              <Card className="cursor-pointer rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-ij-wash)]">
                      <Briefcase className="h-5 w-5 text-[var(--accent-ij-ink)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{role.role_title}</p>
                      <p className="text-sm text-slate-500">{role.company.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {role.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {role.location}
                      </span>
                    )}
                    {role.salary_min && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {(role.salary_min / 1000).toFixed(0)}k
                        {role.salary_max ? `–${(role.salary_max / 1000).toFixed(0)}k` : '+'}
                      </span>
                    )}
                    {role.remote_type && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 capitalize">
                        {role.remote_type}
                      </span>
                    )}
                    <Badge
                      className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-100 text-slate-600'} border-0 text-xs font-medium`}
                    >
                      {role.stage}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(role.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
