import { createClient } from '@/lib/supabase/server'
import { createRole } from '@/lib/actions/roles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Briefcase, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { RoleWithCompany } from '@/lib/supabase/types'

const STAGE_COLORS: Record<string, string> = {
  exploring: 'bg-slate-100 text-slate-600',
  applied: 'bg-blue-50 text-blue-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interviewing: 'bg-sky-50 text-sky-700',
  offer: 'bg-purple-50 text-purple-700',
  negotiating: 'bg-indigo-50 text-indigo-700',
  resolved: 'bg-green-50 text-green-700',
}

export default async function RolesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .order('updated_at', { ascending: false })

  const roles = (data ?? []) as RoleWithCompany[]

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-slate-900">Roles</h1>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-gradient-to-br from-[#00658f] to-[#4ea5d9] text-white rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity" />
          }>
            <Plus className="mr-2 h-4 w-4" /> Add role
          </DialogTrigger>
          <DialogContent className="border-slate-100 bg-white text-slate-900 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-['Plus_Jakarta_Sans'] font-extrabold">Add new role</DialogTitle>
            </DialogHeader>
            <form action={createRole} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-slate-700">Company name *</Label>
                <Input name="company_name" id="company_name" placeholder="Stripe" required
                  className="border-slate-200 bg-white text-slate-900 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_title" className="text-slate-700">Role *</Label>
                <Input name="role_title" id="role_title" placeholder="Senior Software Engineer" required
                  className="border-slate-200 bg-white text-slate-900 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_url" className="text-slate-700">Job URL</Label>
                <Input name="job_url" id="job_url" placeholder="https://..." type="url"
                  className="border-slate-200 bg-white text-slate-900 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-700">Notes</Label>
                <Input name="notes" id="notes" placeholder="Optional notes..."
                  className="border-slate-200 bg-white text-slate-900 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-br from-[#00658f] to-[#4ea5d9] text-white rounded-full font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity">
                Add role
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
            <Briefcase className="h-8 w-8 text-sky-600" />
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
              <Card className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                      <Briefcase className="h-5 w-5 text-sky-600" />
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
                    <Badge className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-100 text-slate-600'} text-xs font-medium border-0`}>
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
