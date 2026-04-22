import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'
import type { Company, Role } from '@/lib/supabase/types'
import { CompaniesTable } from '@/components/companies/CompaniesTable'

type CompanyWithRoles = Company & { roles: Role[] }

export type CompanyRow = {
  id: string
  name: string
  domain: string | null
  industry: string | null
  size: string | null
  rolesCount: number
  activeCount: number
  status: 'active' | 'alumni' | 'past'
  statusLabel: string
  lastActivity: string | null
}

function toRow(company: CompanyWithRoles): CompanyRow {
  const roles = company.roles ?? []
  const isAlumni = roles.some((r) => r.resolution === 'hired')
  const isActive = roles.some((r) => r.stage !== 'resolved')
  const status = isAlumni ? 'alumni' : isActive ? 'active' : 'past'
  const statusLabel = isAlumni ? 'Alumni' : isActive ? 'Active pursuit' : 'Previously applied'
  const lastActivity = roles.reduce<string | null>((acc, r) => {
    const d = r.applied_at ?? r.created_at
    return !acc || d > acc ? d : acc
  }, null)

  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    industry: company.industry,
    size: company.size,
    rolesCount: roles.length,
    activeCount: roles.filter((r) => r.stage !== 'resolved').length,
    status,
    statusLabel,
    lastActivity,
  }
}

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*, roles(*)')
    .order('updated_at', { ascending: false })

  const rows = ((data ?? []) as CompanyWithRoles[]).map(toRow)

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} companies tracked</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <p className="mb-2 text-lg font-semibold text-slate-700">No companies yet</p>
          <p className="text-sm text-slate-500">Companies are created automatically when you add a role.</p>
        </div>
      ) : (
        <CompaniesTable rows={rows} />
      )}
    </div>
  )
}
