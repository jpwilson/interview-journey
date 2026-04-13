import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Briefcase, Upload, BarChart3, FileText, CheckCircle,
  ArrowRight, Zap, Globe, Lock, Sparkles
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg editorial-gradient">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 tracking-tight">Interview Journey</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="editorial-gradient text-white rounded-full px-6 font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
          <span className="text-xs font-bold text-sky-700 tracking-wide uppercase">Your entire career, one timeline</span>
        </div>
        <h1 className="mb-6 font-['Plus_Jakarta_Sans'] text-5xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-6xl">
          The CRM for your{' '}
          <span className="bg-gradient-to-r from-[#00658f] to-[#4ea5d9] bg-clip-text text-transparent">
            job search
          </span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-500 leading-relaxed">
          Drop any document — emails, offer letters, NDAs, rejection emails — and AI instantly
          classifies and organises it. Track every application, interview, and career milestone
          on a beautiful timeline.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="editorial-gradient text-white rounded-full px-8 font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity text-base">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-base">
              🚀 Live demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Upload,
              title: 'Drop anywhere',
              desc: 'Drag and drop any file from your desktop. AI reads it and knows where it belongs.',
              color: 'bg-sky-50 text-sky-600',
            },
            {
              icon: BarChart3,
              title: 'Pipeline board',
              desc: 'See all your applications in a kanban view. Drag cards to move them through stages.',
              color: 'bg-indigo-50 text-indigo-600',
            },
            {
              icon: FileText,
              title: 'Career timeline',
              desc: 'Every job, every interview, every offer — visualised across your whole career.',
              color: 'bg-purple-50 text-purple-600',
            },
            {
              icon: Zap,
              title: 'AI-powered',
              desc: 'Gemini reads offer letters, rejection emails, NDAs, and extracts the key details automatically.',
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: Globe,
              title: 'All your companies',
              desc: 'Track every company you\'ve applied to. See the full journey for each one.',
              color: 'bg-green-50 text-green-600',
            },
            {
              icon: Lock,
              title: 'Yours alone',
              desc: 'Row-level security. Your data is locked to your account — no one else can see it.',
              color: 'bg-rose-50 text-rose-600',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-['Plus_Jakarta_Sans'] font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-slate-200 bg-white px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-slate-900">Simple pricing</h2>
          <p className="mb-14 text-center text-slate-500">Free forever for casual job seekers. Pro for serious ones.</p>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Free</h3>
              <div className="my-4 text-5xl font-extrabold text-slate-900">$0</div>
              <p className="mb-6 text-sm text-slate-500">Perfect for a focused job search</p>
              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                {['Up to 10 active roles', '25 document uploads', 'Pipeline board', 'Per-role timeline'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full rounded-full border-slate-300 text-slate-700 font-medium hover:bg-slate-50">Get started</Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-xl border-2 border-sky-500 bg-white p-8 shadow-lg shadow-sky-100 relative">
              <div className="absolute -top-3 left-6 rounded-full editorial-gradient px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">Recommended</div>
              <h3 className="text-lg font-bold text-slate-900">Pro</h3>
              <div className="my-4 text-5xl font-extrabold text-slate-900">$15<span className="text-lg font-normal text-slate-400">/mo</span></div>
              <p className="mb-6 text-sm text-slate-500">For active job seekers and career trackers</p>
              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                {['Unlimited roles', 'Unlimited documents', 'Career timeline', 'Offer comparison', 'Analytics dashboard', 'Priority AI processing'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle className="h-4 w-4 shrink-0 text-sky-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full editorial-gradient text-white rounded-full font-semibold shadow-lg shadow-sky-200 border-0 hover:opacity-90 transition-opacity">Start Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#f8f9fa] px-6 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Interview Journey. Built for job seekers, by job seekers.
      </footer>
    </div>
  )
}
