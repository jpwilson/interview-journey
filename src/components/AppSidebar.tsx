'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Briefcase, LayoutDashboard, Kanban,
  FileText, Settings, LogOut, GitBranch,
  Building2, TrendingUp, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/roles', label: 'Roles', icon: Briefcase },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/timeline', label: 'Career Timeline', icon: GitBranch },
  { href: '/offers', label: 'Offers', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function getInitials(name: string | undefined, email: string | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'IJ'
}

function useUserDisplay() {
  const supabase = createClient()
  const [userDisplay, setUserDisplay] = useState<{ name: string; email: string; initials: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = data.user.user_metadata?.full_name as string | undefined
        const email = data.user.email ?? ''
        setUserDisplay({ name: name ?? email, email, initials: getInitials(name, email) })
      }
    })
    // supabase client is a stable singleton; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return userDisplay
}

export function SidebarBrand() {
  return (
    <div className="px-8 pt-8 pb-10">
      <p
        className="text-lg leading-tight"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: -0.3, color: 'var(--ink)' }}
      >
        Interview{' '}
        <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
      </p>
      <p
        className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Curated career journey
      </p>
    </div>
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 flex flex-col gap-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 py-3 px-6 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-r-md',
              isActive
                ? 'text-sky-700 font-bold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded-r-full'
                : 'text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-100/60',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function SidebarUserCard() {
  const router = useRouter()
  const supabase = createClient()
  const userDisplay = useUserDisplay()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="p-4 mt-auto">
      <div className="bg-white/50 rounded-xl px-3 py-3 flex items-center gap-3 border border-slate-100">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
          {userDisplay?.initials ?? 'IJ'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate leading-tight">
            {userDisplay?.name ?? 'Loading…'}
          </p>
          {userDisplay?.email && userDisplay.email !== userDisplay.name && (
            <p className="text-[11px] text-slate-400 truncate leading-tight">
              {userDisplay.email}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-slate-400 hover:text-slate-700"
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <SidebarBrand />
      <SidebarNav onNavigate={onNavigate} />
      <SidebarUserCard />
    </>
  )
}

export function AppSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-slate-200/60">
      <SidebarBody />
    </aside>
  )
}
