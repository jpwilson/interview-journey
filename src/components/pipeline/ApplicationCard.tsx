'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Building2, GripVertical, MapPin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ApplicationWithCompany } from '@/lib/supabase/types'

interface Props {
  application: ApplicationWithCompany
  isDragging?: boolean
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
        'group relative rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-sm',
        (isDragging || isSortableDragging) && 'opacity-50 ring-2 ring-blue-500'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-slate-500" />
      </div>

      <Link href={`/applications/${app.id}`} className="block">
        <div className="flex items-start gap-2 pr-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-700">
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{app.role_title}</p>
            <p className="truncate text-xs text-slate-400">{app.company.name}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
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
          <p className="mt-1 text-xs text-green-400">
            ${app.salary_min ? (app.salary_min / 1000).toFixed(0) : '?'}k
            {app.salary_max ? `–$${(app.salary_max / 1000).toFixed(0)}k` : '+'}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-600">
          {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
        </p>
      </Link>
    </div>
  )
}
