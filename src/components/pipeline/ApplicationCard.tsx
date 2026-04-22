'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GripVertical, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { RoleWithCompany } from '@/lib/supabase/types'

interface Props {
  application: RoleWithCompany
  isDragging?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const INITIALS_BG = [
  'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)]',
  'bg-rose-100 text-rose-700',
]

function companyColorClass(name: string) {
  const idx = name.charCodeAt(0) % INITIALS_BG.length
  return INITIALS_BG[idx]
}

export function ApplicationCard({ application: app, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow',
        (isDragging || isSortableDragging) && 'opacity-50 ring-2 ring-[var(--accent-ij)]'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>

      <Link
        href={`/roles/${app.id}`}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ij)] focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-2 pr-6">
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold', companyColorClass(app.company.name))}>
            {getInitials(app.company.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{app.role_title}</p>
            <p className="truncate text-xs text-slate-500">{app.company.name}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          {app.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3" /> {app.location}
            </span>
          )}
          {app.remote_type && (
            <span className="capitalize">{app.remote_type}</span>
          )}
        </div>

        {(app.salary_min || app.salary_max) && (
          <p className="mt-1 text-xs font-medium text-green-600">
            ${app.salary_min ? (app.salary_min / 1000).toFixed(0) : '?'}k
            {app.salary_max ? `–$${(app.salary_max / 1000).toFixed(0)}k` : '+'}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-400">
          {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
        </p>
      </Link>
    </div>
  )
}
