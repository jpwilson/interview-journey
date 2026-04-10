import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { acceptOffer, declineOffer } from '@/lib/actions/offers'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      <div className="rounded-t-xl border border-slate-700 bg-slate-800 px-4 py-3">
        <p className="font-bold text-white truncate">{company}</p>
        <p className="text-sm text-slate-400 truncate">{role}</p>
      </div>

      {/* Rows */}
      <div className="border-x border-slate-700 flex-1 divide-y divide-slate-800">
        {rows.map(({ label, value }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Year 1 cash comp total */}
      <div className="border-x border-t border-slate-700 bg-slate-800/60 px-4 py-3">
        <p className="text-xs text-slate-500 mb-0.5">Year 1 Cash (base + signing)</p>
        <p className="text-lg font-bold text-white">{fmt(cashComp, offer.currency)}</p>
        {offer.equity && (
          <p className="text-xs text-slate-500 mt-1">+ equity: {offer.equity}</p>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-b-xl border border-t-0 border-slate-700 bg-slate-900 px-4 py-3 flex gap-2">
        <form action={acceptOffer.bind(null, offer.id)} className="flex-1">
          <Button
            type="submit"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-500 text-white"
          >
            Accept
          </Button>
        </form>
        <form action={declineOffer.bind(null, offer.id)} className="flex-1">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="w-full border-red-700 text-red-400 hover:bg-red-900/30 hover:text-red-300"
          >
            Decline
          </Button>
        </form>
      </div>
    </div>
  )
}

export default async function OffersPage() {
  const supabase = await createClient()

  const { data: offers } = await supabase
    .from('offers')
    .select('*, role:roles(role_title, company:companies(name))')
    .eq('status', 'pending')
    .order('created_at')

  const pendingOffers = (offers ?? []) as OfferWithRole[]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20">
          <TrendingUp className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Offer Comparison</h1>
          <p className="text-sm text-slate-400">Compare pending offers side by side</p>
        </div>
        {pendingOffers.length > 0 && (
          <Badge className="ml-auto bg-purple-600/20 text-purple-400 border border-purple-600/30">
            {pendingOffers.length} pending
          </Badge>
        )}
      </div>

      {/* Empty state */}
      {pendingOffers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-24 text-center">
          <TrendingUp className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-semibold text-slate-400">No pending offers to compare</p>
          <p className="mt-1 text-sm text-slate-600">
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
