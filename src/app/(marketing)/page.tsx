import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Briefcase, Upload, BarChart3, FileText, CheckCircle,
  ArrowRight, Zap, Globe, Lock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">Interview Journey</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-500">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-600/30">
          Your entire career, one timeline
        </Badge>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
          The CRM for your{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            job search
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-400">
          Drop any document — emails, offer letters, NDAs, rejection emails — and AI instantly
          classifies and organises it. Track every application, interview, and career milestone
          on a beautiful timeline.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 px-8 hover:bg-blue-500">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300">
              See pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Upload,
              title: 'Drop anywhere',
              desc: 'Drag and drop any file from your desktop. AI reads it and knows where it belongs.',
            },
            {
              icon: BarChart3,
              title: 'Pipeline board',
              desc: 'See all your applications in a kanban view. Drag cards to move them through stages.',
            },
            {
              icon: FileText,
              title: 'Career timeline',
              desc: 'Every job, every interview, every offer — visualised across your whole career.',
            },
            {
              icon: Zap,
              title: 'AI-powered',
              desc: 'Gemini reads offer letters, rejection emails, NDAs, and extracts the key details automatically.',
            },
            {
              icon: Globe,
              title: 'All your companies',
              desc: 'Track every company you\'ve applied to. See the full journey for each one.',
            },
            {
              icon: Lock,
              title: 'Yours alone',
              desc: 'Row-level security. Your data is locked to your account — no one else can see it.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-slate-700 bg-slate-800/50">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-slate-800 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Simple pricing</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white">Free</h3>
                <div className="my-4 text-4xl font-bold">$0</div>
                <ul className="space-y-2 text-sm text-slate-400">
                  {['Up to 10 active applications', '25 document uploads', 'Pipeline board', 'Single-app timeline'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button className="w-full" variant="outline">Get started</Button>
                </Link>
              </CardContent>
            </Card>
            {/* Pro */}
            <Card className="border-blue-600 bg-blue-600/10">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white">Pro</h3>
                <div className="my-4 text-4xl font-bold">$12<span className="text-lg text-slate-400">/mo</span></div>
                <ul className="space-y-2 text-sm text-slate-400">
                  {['Unlimited applications', 'Unlimited documents', 'Career timeline', 'Multi-company view', 'CSV/JSON export', 'Priority AI processing'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500">Start Pro trial</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Interview Journey. Built for job seekers, by job seekers.
      </footer>
    </div>
  )
}
