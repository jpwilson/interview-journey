import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createRole } from '@/lib/actions/roles'
import { PageHeader, PageShell, EditorialCard } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus } from 'lucide-react'

export default async function NewRolePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Pull existing companies for autocomplete hints
  const { data: companies } = await supabase
    .from('companies')
    .select('name')
    .eq('user_id', user.id)
    .order('name')

  const companyNames = (companies ?? []).map((c) => c.name)

  return (
    <PageShell>
      <PageHeader
        kicker="New application"
        title="Add a role to your pipeline"
        subtitle="One application per form. Company + role is all you need — everything else can wait."
        right={
          <Link href="/pipeline">
            <Button
              variant="outline"
              size="sm"
              style={{ borderColor: 'var(--paper-ink)', background: 'var(--card)', color: 'var(--ink-3)' }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to pipeline
            </Button>
          </Link>
        }
      />

      <div style={{ padding: '22px 22px 80px', maxWidth: 640, margin: '0 auto' }}>
        <EditorialCard>
          <form action={createRole} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Label
                htmlFor="company_name"
                style={fieldLabelStyle()}
              >
                Company *
              </Label>
              <Input
                id="company_name"
                name="company_name"
                list="known-companies"
                placeholder="Stripe"
                required
                autoFocus
                style={inputStyle()}
              />
              <datalist id="known-companies">
                {companyNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              <p style={helpStyle()}>
                We&apos;ll reuse the company if it already exists in your pipeline, or create a new
                one automatically.
              </p>
            </div>

            <div>
              <Label htmlFor="role_title" style={fieldLabelStyle()}>
                Role title *
              </Label>
              <Input
                id="role_title"
                name="role_title"
                placeholder="Senior Software Engineer"
                required
                style={inputStyle()}
              />
            </div>

            <div>
              <Label htmlFor="job_url" style={fieldLabelStyle()}>
                Job posting URL
              </Label>
              <Input
                id="job_url"
                name="job_url"
                type="url"
                placeholder="https://..."
                style={inputStyle()}
              />
            </div>

            <div>
              <Label htmlFor="notes" style={fieldLabelStyle()}>
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Referral from Jamie · systems team · recruiter is Priya"
                rows={3}
                style={inputStyle()}
              />
              <p style={helpStyle()}>
                Salary, location, and stage can be edited from the role detail page after it&apos;s
                created.
              </p>
            </div>

            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                Starts at <strong style={{ color: 'var(--ink)' }}>Applied</strong> with today&apos;s
                date. Drop documents later to auto-advance.
              </p>
              <Button
                type="submit"
                className="border-0 text-white"
                style={{ background: 'var(--accent-ij-ink)' }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add to pipeline
              </Button>
            </div>
          </form>
        </EditorialCard>

        <div
          style={{
            marginTop: 22,
            padding: '14px 16px',
            border: '1px dashed var(--paper-ink)',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--accent-ij-wash) 55%, transparent)',
            fontSize: 12,
            color: 'var(--ink-3)',
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-ij-ink)',
              marginRight: 6,
            }}
          >
            Faster way
          </span>
          Forward a recruiter email to your forwarding address or drag a PDF anywhere in the app —
          the AI will create the role for you.{' '}
          <Link href="/documents/drop" style={{ color: 'var(--accent-ij-ink)', fontWeight: 500 }}>
            See how →
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

function fieldLabelStyle(): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
    marginBottom: 6,
    display: 'block',
  }
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    borderColor: 'var(--paper-ink)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
  }
}

function helpStyle(): React.CSSProperties {
  return {
    marginTop: 6,
    fontSize: 11,
    color: 'var(--ink-4)',
    lineHeight: 1.5,
  }
}
