import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Briefcase } from 'lucide-react'

const FREE_FEATURES = [
  '10 active roles',
  '25 document uploads',
  '20 AI classifications per month',
  'Kanban pipeline board',
  'Per-role timeline',
  'Document vault',
]

const PRO_FEATURES = [
  'Unlimited roles',
  'Unlimited document uploads',
  'Unlimited AI classifications',
  'Career timeline (all companies)',
  'Offer comparison',
  'Analytics dashboard',
  'Ghosting alerts',
  'Priority AI processing',
  'Everything in Free',
]

export default function PricingPage() {
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

      <div className="mx-auto max-w-4xl px-6 py-28">
        <h1 className="mb-4 text-center font-headline text-4xl font-extrabold text-slate-900">Simple, honest pricing</h1>
        <p className="mb-16 text-center text-lg text-slate-500">
          Free forever for casual job seekers. Pro for serious ones.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <div className="my-4 text-5xl font-extrabold text-slate-900">$0</div>
            <p className="mb-6 text-slate-500">Perfect for a focused job search</p>
            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <Button variant="outline" className="w-full rounded-full border-slate-300 text-slate-700 font-medium hover:bg-slate-50">Get started free</Button>
            </Link>
          </div>

          <div className="rounded-xl border-2 border-sky-500 bg-white p-8 shadow-lg shadow-sky-100 relative">
            <div className="absolute -top-3 left-6 rounded-full editorial-gradient px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">Recommended</div>
            <h2 className="text-xl font-bold text-slate-900">Pro</h2>
            <div className="my-4 text-5xl font-extrabold text-slate-900">
              $15<span className="text-xl font-normal text-slate-400">/mo</span>
            </div>
            <p className="mb-6 text-slate-500">For active job seekers and career trackers</p>
            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 shrink-0 text-sky-600" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <Button className="w-full editorial-gradient text-white rounded-full font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90">Start Pro</Button>
            </Link>
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
