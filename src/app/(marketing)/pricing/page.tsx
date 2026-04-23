import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Briefcase, Sparkle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const LIFETIME_CAP = 500

const FREE_FEATURES = [
  'Unlimited roles — your career, forever',
  'Career timeline (all past employers)',
  'Kanban pipeline board',
  '30 AI classifications / month',
  '100 documents of storage',
  'Single-role share links',
]

const PRO_FEATURES = [
  'Unlimited AI classifications',
  'Unlimited document storage',
  'Full share-link customization',
  'CSV + PDF portfolio export',
  'Priority AI (lower latency)',
  'Monthly market-pulse digest',
  'Coach access',
  'Everything in Free',
]

const LIFETIME_FEATURES = [
  'Everything in Pro — forever',
  'Founding member badge on share-links',
  'First-500 only · never offered again',
]

async function getLifetimeClaimed(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('tier', 'lifetime')
    return count ?? 0
  } catch {
    return 0
  }
}

export default async function PricingPage() {
  const claimed = await getLifetimeClaimed()
  const remaining = Math.max(0, LIFETIME_CAP - claimed)
  const soldOut = remaining === 0

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <nav className="sticky top-0 z-40 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg editorial-gradient">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-headline text-lg font-extrabold text-slate-900 tracking-tight">Interview Journey</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium">Sign in</Button></Link>
          <Link href="/signup"><Button className="editorial-gradient text-white rounded-full px-6 font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90">Get started</Button></Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold text-slate-900">
          Simple, honest pricing
        </h1>
        <p className="mb-4 text-center text-lg text-slate-500">
          Your career, organized forever — free. Pay for the intelligence on top.
        </p>

        {/* Lifetime bar */}
        {!soldOut && (
          <div className="mx-auto mb-12 flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm">
            <Sparkle className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-800">Founding-member lifetime · $99 one-time</span>
            <span className="text-amber-700">·</span>
            <span className="text-amber-700">
              {remaining} of {LIFETIME_CAP} spots left
            </span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-headline text-xl font-bold text-slate-900">Free</h2>
            <p className="mt-1 text-sm text-slate-400">Keeper</p>
            <div className="my-4 text-5xl font-extrabold text-slate-900">$0</div>
            <p className="mb-6 min-h-[3rem] text-sm text-slate-500">
              Your career, organized forever. Free for life.
            </p>
            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <Button variant="outline" className="w-full rounded-full border-slate-300 text-slate-700 font-medium hover:bg-slate-50">
                Get started free
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-sky-500 bg-white p-8 shadow-lg shadow-sky-100 relative">
            <div className="absolute -top-3 left-6 rounded-full editorial-gradient px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">
              Recommended
            </div>
            <h2 className="font-headline text-xl font-bold text-slate-900">Pro</h2>
            <p className="mt-1 text-sm text-slate-400">Companion</p>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900">$12</span>
              <span className="text-lg text-slate-500">/ mo annual</span>
            </div>
            <p className="mb-6 min-h-[3rem] text-sm text-slate-500">
              $144/year billed annually · $19/mo billed monthly. Cancel anytime.
            </p>
            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup?plan=pro-annual">
              <Button className="w-full editorial-gradient text-white rounded-full font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90">
                Start Pro
              </Button>
            </Link>
          </div>

          {/* Lifetime */}
          <div
            className={`rounded-xl border-2 bg-white p-8 shadow-sm relative ${
              soldOut ? 'border-slate-200 opacity-60' : 'border-amber-400 shadow-amber-100'
            }`}
          >
            <div
              className={`absolute -top-3 left-6 flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                soldOut ? 'bg-slate-300 text-slate-600' : 'bg-amber-500 text-white'
              }`}
            >
              <Sparkle className="h-3 w-3" /> {soldOut ? 'Sold out' : 'Founding member'}
            </div>
            <h2 className="font-headline text-xl font-bold text-slate-900">Lifetime</h2>
            <p className="mt-1 text-sm text-slate-400">Capped at {LIFETIME_CAP}</p>
            <div className="my-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900">$99</span>
              <span className="text-lg text-slate-500">once</span>
            </div>
            <p className="mb-6 min-h-[3rem] text-sm text-slate-500">
              {soldOut
                ? 'The founding-member tier has closed. Thank you for the early support.'
                : `${remaining} of ${LIFETIME_CAP} left. Pay once, access forever.`}
            </p>
            <ul className="mb-8 space-y-3">
              {LIFETIME_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {f}
                </li>
              ))}
            </ul>
            {soldOut ? (
              <Button disabled variant="outline" className="w-full rounded-full border-slate-300 text-slate-400">
                Sold out
              </Button>
            ) : (
              <Link href="/signup?plan=lifetime">
                <Button className="w-full rounded-full bg-amber-500 text-white font-semibold shadow-md hover:bg-amber-600 border-0">
                  Claim lifetime — $99
                </Button>
              </Link>
            )}
          </div>
        </div>

        <p className="mt-14 text-center text-sm text-slate-400">
          No contracts. Cancel anytime. Questions?{' '}
          <a href="mailto:hello@interviewjourney.app" className="text-sky-600 hover:text-sky-500 font-medium">
            Get in touch
          </a>
        </p>
      </div>
    </div>
  )
}
