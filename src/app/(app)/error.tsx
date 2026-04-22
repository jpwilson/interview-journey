'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App route error:', error)
  }, [error])

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2
          className="text-xl"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}
        >
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t load this page. The issue has been logged — try again in a moment.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-slate-400">ref: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset} variant="default">Try again</Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
