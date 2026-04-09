'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Briefcase, LayoutDashboard, Kanban, Clock,
  FileText, Settings, LogOut, GitBranch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/roles', label: 'Roles', icon: Briefcase },
  { href: '/timeline', label: 'Career Timeline', icon: GitBranch },
  { href: '/documents', label: 'Documents', icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-800 bg-slate-950 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 pb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white">Interview Journey</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 px-2 pt-2 border-t border-slate-800 mt-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white px-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
