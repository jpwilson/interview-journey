import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Briefcase } from 'lucide-react'

const FREE_FEATURES = [
  '10 active applications',
  '25 document uploads',
  '20 AI classifications per month',
  'Kanban pipeline board',
  'Per-application timeline',
  'Document vault',
]

const PRO_FEATURES = [
  'Unlimited applications',
  'Unlimited document uploads',
  'Unlimited AI classifications',
  'Career timeline (all companies)',
  'Multi-company view',
  'CSV / JSON export',
  'Priority AI processing',
  'Everything in Free',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">Interview Journey</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost" className="text-slate-300">Sign in</Button></Link>
          <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-500">Get started</Button></Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="mb-4 text-center text-4xl font-bold">Simple, honest pricing</h1>
        <p className="mb-16 text-center text-lg text-slate-400">
          Free forever for casual job seekers. Pro for serious ones.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-8">
              <h2 className="text-xl font-bold text-white">Free</h2>
              <div className="my-4 text-5xl font-bold">$0</div>
              <p className="mb-6 text-slate-400">Perfect for a focused job search</p>
              <ul className="mb-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full border-slate-600">Get started free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-500 bg-blue-600/10">
            <CardContent className="pt-8">
              <h2 className="text-xl font-bold text-white">Pro</h2>
              <div className="my-4 text-5xl font-bold">
                $12<span className="text-xl font-normal text-slate-400">/mo</span>
              </div>
              <p className="mb-6 text-slate-400">For active job seekers and career trackers</p>
              <ul className="mb-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-blue-600 hover:bg-blue-500">Start Pro</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          No contracts. Cancel anytime. Questions?{' '}
          <a href="mailto:hello@interviewjourney.app" className="text-blue-400 hover:text-blue-300">
            Get in touch
          </a>
        </p>
      </div>
    </div>
  )
}
