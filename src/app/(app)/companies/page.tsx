import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Company, Role } from '@/lib/supabase/types'

type CompanyWithRoles = Company & { roles: Role[] }

function getCompanyStatus(roles: Role[]): { label: string; color: string } {
  if (roles.some((r) => r.resolution === 'hired')) {
    return { label: 'Alumni', color: 'bg-green-600' }
  }
  if (roles.some((r) => r.stage !== 'resolved')) {
    return { label: 'Active pursuit', color: 'bg-blue-600' }
  }
  return { label: 'Previously applied', color: 'bg-slate-600' }
}

export default async function CompaniesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('companies')
    .select('*, roles(*)')
    .order('updated_at', { ascending: false })

  const companies = (data ?? []) as CompanyWithRoles[]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Companies</h1>
        <p className="mt-1 text-sm text-slate-400">All companies you have interacted with.</p>
      </div>

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-600" />
          <p className="mb-2 text-lg font-medium text-slate-400">No companies yet</p>
          <p className="text-sm text-slate-500">
            Companies are created automatically when you add a role.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => {
            const roles = company.roles ?? []
            const status = getCompanyStatus(roles)
            const lastApplied = roles.reduce<string | null>((acc, r) => {
              const d = r.applied_at ?? r.created_at
              if (!acc || d > acc) return d
              return acc
            }, null)

            return (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <Card className="border-slate-700 bg-slate-800 transition-colors hover:border-slate-600 hover:bg-slate-750">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-sm text-slate-400">
                          {roles.length} {roles.length === 1 ? 'role' : 'roles'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastApplied && (
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(lastApplied), { addSuffix: true })}
                        </span>
                      )}
                      <Badge className={`${status.color} text-white text-xs`}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
