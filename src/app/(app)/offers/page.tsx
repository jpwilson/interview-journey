import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { acceptOffer, declineOffer } from '@/lib/actions/offers'
import { getUserTier } from '@/lib/limits'
import Link from 'next/link'
import { TrendingUp, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageHeader, PageShell } from '@/components/ui/PageHeader'
import type { Offer } from '@/lib/supabase/types'

type OfferWithRole = Offer & {
  role: {
    role_title: string
    company: {
      name: string
    }
  } | null
}

function fmt(value: number | null, currency = 'USD') {
  if (!value) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function calcCashComp(offer: Offer) {
  return (offer.base_salary ?? 0) + (offer.signing_bonus ?? 0)
}

interface OfferColumnProps {
  offer: OfferWithRole
}

function OfferColumn({ offer }: OfferColumnProps) {
  const company = offer.role?.company?.name ?? 'Unknown company'
  const role = offer.role?.role_title ?? 'Unknown role'
  const cashComp = calcCashComp(offer)
  const deadline = fmtDate(offer.deadline)
  const startDate = fmtDate(offer.start_date)

  const rows: { label: string; value: string | ReactNode }[] = [
    { label: 'Company', value: company },
    { label: 'Role', value: role },
    { label: 'Base Salary', value: fmt(offer.base_salary, offer.currency) },
    { label: 'Signing Bonus', value: fmt(offer.signing_bonus, offer.currency) },
    { label: 'Equity', value: offer.equity ?? '—' },
    { label: 'Start Date', value: startDate },
    { label: 'Offer Expires', value: deadline },
    { label: 'Notes', value: offer.notes ?? '—' },
  ]

  return (
    <div
      className="flex flex-col min-w-[260px] max-w-xs flex-1"
      style={{ border: '1px solid var(--paper-ink)', borderRadius: 6, overflow: 'hidden', background: 'var(--card)' }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--accent-ij-ink)',
          padding: '14px 16px',
          color: '#fff',
        }}
      >
        <p
          className="truncate"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, letterSpacing: -0.2 }}
        >
          {company}
        </p>
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'color-mix(in srgb, var(--accent-ij-wash) 85%, transparent)',
            marginTop: 3,
          }}
        >
          {role}
        </p>
      </div>

      {/* Rows */}
      <div style={{ flex: 1 }}>
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              padding: '10px 14px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-4)',
                marginBottom: 3,
              }}
            >
              {label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Year 1 cash comp total */}
      <div
        style={{
          borderTop: '1px solid var(--border-soft)',
          background: 'var(--accent-ij-wash)',
          padding: '12px 14px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-ij-ink)',
            marginBottom: 4,
          }}
        >
          Total Year 1
        </p>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--accent-ij-ink)',
          }}
        >
          {fmt(cashComp, offer.currency)}
        </p>
        {offer.equity && (
          <p style={{ fontSize: 11, color: 'var(--accent-ij-ink)', opacity: 0.8, marginTop: 2 }}>
            + equity: {offer.equity}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          borderTop: '1px solid var(--border-soft)',
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          background: 'var(--paper-2)',
        }}
      >
        <div className="flex-1">
          <ConfirmDialog
            trigger={
              <Button
                size="sm"
                className="w-full border-0 text-white"
                style={{ background: 'var(--accent-ij-ink)' }}
              >
                Accept
              </Button>
            }
            title={`Accept the offer from ${company}?`}
            description={`Accepting will mark this offer as accepted. Any other pending offers stay as-is — you can decline them separately.`}
            confirmLabel="Accept offer"
            onConfirm={acceptOffer.bind(null, offer.id)}
          />
        </div>
        <div className="flex-1">
          <ConfirmDialog
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                style={{ borderColor: 'var(--paper-ink)', background: 'var(--card)', color: 'var(--ink-3)' }}
              >
                Decline
              </Button>
            }
            title={`Decline the offer from ${company}?`}
            description="This marks the offer as declined and removes it from the comparison view."
            confirmLabel="Decline offer"
            variant="destructive"
            onConfirm={declineOffer.bind(null, offer.id)}
          />
        </div>
      </div>
    </div>
  )
}

export default async function OffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tier = user ? await getUserTier(user.id) : 'free'

  const { data: offers } = await supabase
    .from('offers')
    .select('*, role:roles(role_title, company:companies(name))')
    .eq('status', 'pending')
    .order('created_at')

  const pendingOffers = (offers ?? []) as OfferWithRole[]

  const exportButton =
    tier === 'pro' ? (
      <a href="/api/export/offers" download>
        <Button
          variant="outline"
          size="sm"
          style={{ borderColor: 'var(--paper-ink)', background: 'var(--card)', color: 'var(--ink-3)' }}
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </a>
    ) : (
      <Link href="/settings?upgrade=export" title="CSV export is a Pro feature">
        <Button
          variant="outline"
          size="sm"
          style={{ borderColor: 'var(--paper-ink)', background: 'var(--card)', color: 'var(--ink-5)' }}
        >
          <Lock className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </Link>
    )

  return (
    <PageShell>
      <PageHeader
        kicker="Offers"
        title={
          pendingOffers.length > 0
            ? `${pendingOffers.length} ${pendingOffers.length === 1 ? 'offer' : 'offers'} on the table`
            : 'Offer comparison'
        }
        subtitle="Compare pending offers side by side. Accept one, decline the rest — or keep negotiating."
        right={exportButton}
      />

      <div style={{ padding: '22px 22px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {pendingOffers.length === 0 ? (
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
            <TrendingUp className="mb-4 h-10 w-10" style={{ color: 'var(--ink-5)' }} />
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              No pending offers to compare
            </p>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-4)' }}>
              Offers you receive will appear here once their status is set to pending.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {pendingOffers.map((offer) => (
                <OfferColumn key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
