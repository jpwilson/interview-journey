'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, HeartPulse, Compass, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

type SearchStatus = 'happy' | 'open' | 'active'

const STATUS_OPTS: {
  id: SearchStatus
  label: string
  sub: string
  icon: typeof HeartPulse
}[] = [
  { id: 'happy', label: 'Happy where I am', sub: 'Keep receipts, no nudges.', icon: HeartPulse },
  { id: 'open', label: 'Open to better', sub: 'Market pulse monthly. No pressure.', icon: Compass },
  {
    id: 'active',
    label: 'Actively looking',
    sub: 'Full pipeline mode. Daily digest.',
    icon: Search,
  },
]

export function OnboardingModal({
  userId,
  existingCompanies,
}: {
  userId: string
  existingCompanies: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [employer, setEmployer] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [notEmployed, setNotEmployed] = useState(false)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<SearchStatus>('open')
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  function pickCompany(name: string, id?: string) {
    setEmployer(name)
    setCompanyId(id ?? null)
  }

  function pickNotEmployed() {
    setNotEmployed(true)
    setEmployer('')
    setCompanyId(null)
    setStep(3)
  }

  async function finish() {
    startTransition(async () => {
      try {
        let finalCompanyId = companyId
        // Create the company if it's a new name
        if (!notEmployed && employer && !finalCompanyId) {
          const { data, error } = await supabase
            .from('companies')
            .insert({ user_id: userId, name: employer.trim() })
            .select('id')
            .single()
          if (error) throw error
          finalCompanyId = data.id
        }
        const update: Record<string, unknown> = {
          search_status: status,
          current_employer_id: notEmployed ? null : finalCompanyId,
          current_title: notEmployed ? null : title || null,
          employment_start_date: notEmployed ? null : startDate || null,
          prefs: {
            funnelRange: '90d',
            autoCloseDays: 30,
            docConfidenceThreshold: 85,
            onboardedAt: new Date().toISOString(),
          },
        }
        const { error } = await supabase.from('profiles').update(update).eq('id', userId)
        if (error) throw error
        toast.success('All set. Your dashboard is ready.')
        setOpen(false)
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(`Couldn't save: ${msg}`)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[520px]"
        style={{ background: 'var(--card)', border: '1px solid var(--paper-ink)' }}
      >
        <DialogHeader>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-4)',
              marginBottom: 6,
            }}
          >
            Welcome · step {step} of 3
          </div>
          <DialogTitle
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: -0.3,
              color: 'var(--ink)',
            }}
          >
            {step === 1 && 'Where do you work now?'}
            {step === 2 && 'What do you do there?'}
            {step === 3 && 'How would you describe your search?'}
          </DialogTitle>
          <DialogDescription style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            {step === 1 && 'This lets your dashboard show you — not just your pipeline.'}
            {step === 2 && 'We use tenure to tell you when you\'re "due."'}
            {step === 3 && 'You can change this anytime. It sets how often we nudge you.'}
          </DialogDescription>
        </DialogHeader>

        <div style={{ marginTop: 12 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Company name"
                value={employer}
                onChange={(e) => pickCompany(e.target.value)}
                autoFocus
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  border: '1px solid var(--paper-ink)',
                  borderRadius: 4,
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              {existingCompanies.length > 0 && employer.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {existingCompanies
                    .filter((c) => c.name.toLowerCase().includes(employer.toLowerCase()))
                    .slice(0, 6)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => pickCompany(c.name, c.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          border: '1px solid var(--paper-ink)',
                          borderRadius: 999,
                          background: 'var(--paper-2)',
                          color: 'var(--ink-2)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              )}
              <button
                type="button"
                onClick={pickNotEmployed}
                style={{
                  padding: '8px 12px',
                  fontSize: 12,
                  border: '1px dashed var(--paper-ink)',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'left',
                }}
              >
                Not currently employed
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={labelStyle()}>Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                style={inputStyle()}
              />
              <label style={labelStyle()}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle()}
              />
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                Approximate is fine — you can edit later.
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STATUS_OPTS.map((s) => {
                const active = status === s.id
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    style={{
                      padding: '14px 16px',
                      border: `1px solid ${active ? 'var(--accent-ij-ink)' : 'var(--paper-ink)'}`,
                      borderRadius: 6,
                      background: active ? 'var(--accent-ij-wash)' : 'var(--card)',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        background: active ? 'var(--accent-ij-ink)' : 'var(--paper-2)',
                        color: active ? '#fff' : 'var(--ink-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: active ? 'var(--accent-ij-ink)' : 'var(--ink)',
                        }}
                      >
                        {s.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
                        {s.sub}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                // "Skip for now" — close without saving anything, user can add later
                setOpen(false)
              } else {
                setStep((step - 1) as 1 | 2)
              }
            }}
            style={{
              padding: '8px 10px',
              fontSize: 12,
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-4)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {step === 1 ? 'Skip for now' : '← Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !notEmployed && employer.trim().length === 0}
              onClick={() => {
                if (step === 1 && notEmployed) {
                  setStep(3)
                } else {
                  setStep((step + 1) as 2 | 3)
                }
              }}
              style={primaryButton(step === 1 && !notEmployed && employer.trim().length === 0)}
            >
              <Briefcase size={13} /> Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              style={primaryButton(pending)}
            >
              {pending ? 'Saving…' : 'Finish'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function labelStyle(): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
  }
}

function inputStyle(): React.CSSProperties {
  return {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid var(--paper-ink)',
    borderRadius: 4,
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
  }
}

function primaryButton(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    borderRadius: 4,
    background: disabled ? 'var(--ink-5)' : 'var(--accent-ij-ink)',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-sans)',
  }
}
