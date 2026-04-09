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
  exploring: 'bg-slate-500',
  applied: 'bg-slate-600',
  screening: 'bg-yellow-600',
  interviewing: 'bg-blue-600',
  offer: 'bg-purple-600',
  negotiating: 'bg-indigo-600',
  resolved: 'bg-slate-400',
}

export default async function RolesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select('*, company:companies(*)')
    .order('updated_at', { ascending: false })

  const roles = (data ?? []) as RoleWithCompany[]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Roles</h1>
        <Dialog>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-500" />}>
            <Plus className="mr-2 h-4 w-4" /> Add role
          </DialogTrigger>
          <DialogContent className="border-slate-700 bg-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add new role</DialogTitle>
            </DialogHeader>
            <form action={createRole} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company name *</Label>
                <Input name="company_name" id="company_name" placeholder="Stripe" required
                  className="border-slate-600 bg-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_title">Role *</Label>
                <Input name="role_title" id="role_title" placeholder="Senior Software Engineer" required
                  className="border-slate-600 bg-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_url">Job URL</Label>
                <Input name="job_url" id="job_url" placeholder="https://..." type="url"
                  className="border-slate-600 bg-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input name="notes" id="notes" placeholder="Optional notes..."
                  className="border-slate-600 bg-slate-700 text-white" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                Add role
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-slate-600" />
          <p className="mb-2 text-lg font-medium text-slate-400">No roles yet</p>
          <p className="mb-6 text-sm text-slate-500">
            Add one manually or drop a document anywhere to let AI create it
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <Link key={role.id} href={`/roles/${role.id}`}>
              <Card className="border-slate-700 bg-slate-800 transition-colors hover:bg-slate-750 hover:border-slate-600">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{role.role_title}</p>
                      <p className="text-sm text-slate-400">{role.company.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {role.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {role.location}
                      </span>
                    )}
                    {role.salary_min && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign className="h-3 w-3" />
                        {(role.salary_min / 1000).toFixed(0)}k
                        {role.salary_max ? `–${(role.salary_max / 1000).toFixed(0)}k` : '+'}
                      </span>
                    )}
                    <Badge className={`${STAGE_COLORS[role.stage] ?? 'bg-slate-600'} text-white text-xs`}>
                      {role.stage}
                    </Badge>
                    <span className="text-xs text-slate-500">
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
