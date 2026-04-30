import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'
import type { Company, Role } from '@/lib/supabase/types'
import { CompaniesTable } from '@/components/companies/CompaniesTable'
import { PageHeader, PageShell } from '@/components/ui/PageHeader'

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
    <PageShell>
      <PageHeader
        kicker="Companies"
        title={`${rows.length} ${rows.length === 1 ? 'company' : 'companies'} tracked`}
        subtitle="Every org you've engaged — active pursuits, alumni, and previously-applied. Companies are created automatically when you add a role."
      />
      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {rows.length === 0 ? (
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
            <Building2 className="mb-3 h-10 w-10" style={{ color: 'var(--ink-5)' }} />
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              No companies yet
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-4)' }}>
              Companies are created automatically when you add a role.
            </p>
          </div>
        ) : (
          <CompaniesTable rows={rows} />
        )}
      </div>
    </PageShell>
  )
}
