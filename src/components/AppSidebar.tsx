'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Columns3, Building2, GitBranch, Sparkle,
  BarChart3, FileText, Archive, Settings, LogOut, Upload,
} from 'lucide-react'
import { toast } from 'sonner'

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number | string
  conditional?: 'has-active-offer'
}

const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Columns3 },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/timeline', label: 'Career Timeline', icon: GitBranch },
  { href: '/offers', label: 'Offers', icon: Sparkle, conditional: 'has-active-offer' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/documents', label: 'Documents', icon: FileText },
]

const secondaryNav: NavItem[] = [
  { href: '/archive', label: 'Archive', icon: Archive },
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

type SidebarProps = {
  pipelineCount?: number
  documentsCount?: number
  hasActiveOffer?: boolean
  onNavigate?: () => void
}

export function SidebarBody({ pipelineCount, documentsCount, hasActiveOffer = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  const visiblePrimary = primaryNav.filter((item) =>
    item.conditional === 'has-active-offer' ? hasActiveOffer : true,
  )

  return (
    <>
      {/* Wordmark */}
      <div className="px-5 pt-6 pb-5">
        <p
          className="leading-tight"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 15, letterSpacing: -0.3, color: 'var(--ink)' }}
        >
          Interview{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
        </p>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          Your career CRM
        </p>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col px-2" style={{ gap: 1 }}>
        {visiblePrimary.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            onNavigate={onNavigate}
            badge={
              item.href === '/pipeline'
                ? pipelineCount
                : item.href === '/documents'
                  ? documentsCount
                  : item.badge
            }
          />
        ))}
      </nav>

      {/* Drop zone nested under Documents */}
      <div className="px-2 mt-2">
        <Link
          href="/documents/drop"
          onClick={onNavigate}
          className="flex flex-col items-center justify-center transition-colors"
          style={{
            marginLeft: 26,
            padding: '12px 10px',
            border: '1.5px dashed var(--accent-ij)',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--accent-ij-wash) 55%, transparent)',
            color: 'var(--accent-ij-ink)',
            gap: 4,
          }}
        >
          <Upload size={14} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500 }}>Drop here</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)' }}>or ⌘V to paste</span>
        </Link>
      </div>

      {/* Spacer */}
      <div style={{ marginTop: 12 }} />

      {/* Secondary nav */}
      <nav className="flex flex-col px-2" style={{ gap: 1 }}>
        {secondaryNav.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            onNavigate={onNavigate}
            muted
          />
        ))}
      </nav>

      {/* Bottom: user */}
      <div className="mt-auto p-3" style={{ borderTop: '1px solid var(--paper-ink)' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex shrink-0 items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--accent-ij-wash)',
              color: 'var(--accent-ij-ink)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {userDisplay?.initials ?? 'IJ'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate leading-tight" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>
              {userDisplay?.name ?? 'Loading…'}
            </p>
            {userDisplay?.email && userDisplay.email !== userDisplay.name && (
              <p
                className="truncate leading-tight"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}
              >
                {userDisplay.email}
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 transition-colors"
            style={{ padding: 4, color: 'var(--ink-4)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  )
}

export function AppSidebar(props: SidebarProps) {
  return (
    <aside
      className="flex h-full w-[200px] flex-col"
      style={{ background: 'var(--card)', borderRight: '1px solid var(--paper-ink)' }}
    >
      <SidebarBody {...props} />
    </aside>
  )
}

function SidebarLink({
  item,
  active,
  badge,
  muted,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  badge?: number | string
  muted?: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn('relative flex items-center transition-colors')}
      style={{
        gap: 10,
        padding: '6px 10px',
        borderRadius: 4,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        color: active ? '#fafaf9' : muted ? 'var(--ink-5)' : 'var(--ink-3)',
        background: active ? 'var(--accent-ij-ink)' : 'transparent',
      }}
    >
      <span style={{ color: 'inherit', display: 'flex', opacity: active ? 0.9 : 1 }}>
        <Icon size={14} strokeWidth={1.5} />
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge != null && badge !== 0 && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            padding: '1px 6px',
            borderRadius: 4,
            background: active ? 'color-mix(in srgb, var(--paper) 20%, transparent)' : 'var(--paper-2)',
            color: active ? '#fafaf9' : 'var(--ink-4)',
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
