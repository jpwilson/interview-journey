import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { acceptOffer, declineOffer } from '@/lib/actions/offers'
import { getUserTier } from '@/lib/limits'
import Link from 'next/link'
import { TrendingUp, Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
    <div className="flex flex-col min-w-[240px] max-w-xs flex-1">
      {/* Header */}
      <div className="rounded-t-xl border border-slate-100 bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] px-4 py-4">
        <p className="font-bold text-white truncate">{company}</p>
        <p className="text-sm text-[var(--accent-ij-wash)] truncate">{role}</p>
      </div>

      {/* Rows */}
      <div className="border-x border-slate-100 flex-1 divide-y divide-slate-50 bg-white">
        {rows.map(({ label, value }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Year 1 cash comp total — highlighted in green */}
      <div className="border-x border-t border-slate-100 bg-green-50 px-4 py-4">
        <p className="text-xs text-green-700 font-medium mb-0.5">Total Year 1</p>
        <p className="text-lg font-bold text-green-800">{fmt(cashComp, offer.currency)}</p>
        {offer.equity && (
          <p className="text-xs text-green-600 mt-1">+ equity: {offer.equity}</p>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-b-xl border border-t-0 border-slate-100 bg-[#f8f9fa] px-4 py-3 flex gap-2">
        <div className="flex-1">
          <ConfirmDialog
            trigger={
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-[var(--accent-ij)] to-[var(--accent-ij-ink)] hover:from-[#005578] hover:to-[#3a8fbf] text-white border-0"
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
                className="w-full border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
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

  return (
    <div className="min-h-full bg-[#f8f9fa] p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)]">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Offer Comparison
          </h1>
          <p className="text-sm text-slate-500">Compare pending offers side by side</p>
        </div>
        {pendingOffers.length > 0 && (
          <Badge className="ml-auto bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)] border-0">
            {pendingOffers.length} pending
          </Badge>
        )}
        <div className={pendingOffers.length > 0 ? '' : 'ml-auto'}>
          {tier === 'pro' ? (
            <a href="/api/export/offers" download>
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </a>
          ) : (
            <Link href="/settings?upgrade=export" title="CSV export is a Pro feature">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-500 hover:bg-slate-50">
                <Lock className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Empty state */}
      {pendingOffers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <TrendingUp className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">No pending offers to compare</p>
          <p className="mt-1 text-sm text-slate-400">
            Offers you receive will appear here once their status is set to pending.
          </p>
        </div>
      )}

      {/* Comparison grid */}
      {pendingOffers.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {pendingOffers.map((offer) => (
              <OfferColumn key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
