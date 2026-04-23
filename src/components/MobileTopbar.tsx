'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { SidebarBody } from '@/components/AppSidebar'

export function MobileTopbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center justify-between border-b border-slate-200/60 bg-white px-4 py-3 md:hidden">
      <p
        className="text-base leading-tight"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 500,
          letterSpacing: -0.3,
          color: 'var(--ink)',
        }}
      >
        Interview <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
      </p>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--accent-ij)] focus-visible:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />
        <SheetContent side="left" className="w-72 max-w-[80vw] bg-white p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main app navigation</SheetDescription>
          <div className="flex h-full flex-col">
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
