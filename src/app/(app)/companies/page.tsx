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
    return { label: 'Alumni', color: 'bg-green-100 text-green-700' }
  }
  if (roles.some((r) => r.stage !== 'resolved')) {
    return { label: 'Active pursuit', color: 'bg-sky-100 text-sky-700' }
  }
  return { label: 'Previously applied', color: 'bg-slate-100 text-slate-600' }
}

export default async function CompaniesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('companies')
    .select('*, roles(*)')
    .order('updated_at', { ascending: false })

  const companies = (data ?? []) as CompanyWithRoles[]

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Companies
        </h1>
        <p className="mt-1 text-sm text-slate-500">All companies you have interacted with.</p>
      </div>

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-700">No companies yet</p>
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
                <Card className="border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00658f] to-[#4ea5d9]">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{company.name}</p>
                        <p className="text-sm text-slate-500">
                          {roles.length} {roles.length === 1 ? 'role' : 'roles'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastApplied && (
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(lastApplied), { addSuffix: true })}
                        </span>
                      )}
                      <Badge className={`${status.color} text-xs border-0`}>
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
