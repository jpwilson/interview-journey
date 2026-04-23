'use client'

import { useState, useTransition } from 'react'
import { Share2, Copy, Check, ExternalLink } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createShareLink } from '@/lib/actions/share'

export function ShareTimelineButton() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [slug, setSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [anonymize, setAnonymize] = useState(false)
  const [showComp, setShowComp] = useState(false)

  function handleCreate() {
    const formData = new FormData()
    formData.set('scope', 'full_timeline')
    if (displayName) formData.set('display_name', displayName)
    if (anonymize) formData.set('anonymize_companies', 'on')
    if (showComp) formData.set('show_compensation', 'on')

    startTransition(async () => {
      try {
        const { slug } = await createShareLink(formData)
        setSlug(slug)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create share link')
      }
    })
  }

  async function handleCopy() {
    if (!slug) return
    const url = `${window.location.origin}/s/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Copied share link')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset on close so a fresh mint next time.
      setTimeout(() => {
        setSlug(null)
        setDisplayName('')
        setAnonymize(false)
        setShowComp(false)
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your career timeline</DialogTitle>
          <DialogDescription>
            A public, read-only link. No sign-in required for viewers. You can revoke it anytime from
            this dialog.
          </DialogDescription>
        </DialogHeader>

        {slug ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <code className="flex-1 truncate font-mono text-xs text-slate-700">
                {typeof window !== 'undefined' ? window.location.origin : ''}/s/{slug}
              </code>
              <Button size="sm" variant="ghost" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <a
              href={`/s/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--accent-ij-ink)] hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open in new tab
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                placeholder="e.g., Maya Lin (or leave blank for 'Anonymous')"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-slate-500">Shown at the top of the public page.</p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--accent-ij-ink)]"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Anonymize company names</p>
                <p className="text-xs text-slate-500">
                  Show companies as <code className="font-mono">S••••e</code> instead of the real name.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={showComp}
                onChange={(e) => setShowComp(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--accent-ij-ink)]"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Show compensation</p>
                <p className="text-xs text-slate-500">
                  Include offer base salary on the public timeline. Off by default.
                </p>
              </div>
            </label>
          </div>
        )}

        <DialogFooter>
          {slug ? (
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={pending}>
                {pending ? 'Creating…' : 'Create share link'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
