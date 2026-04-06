'use client'

import { useDroppable } from '@dnd-kit/core'
import { ApplicationCard } from './ApplicationCard'
import { cn } from '@/lib/utils'
import type { ApplicationWithCompany, ApplicationStage } from '@/lib/supabase/types'

interface Props {
  stage: { id: ApplicationStage; label: string; color: string }
  applications: ApplicationWithCompany[]
  droppableId: string
}

export function KanbanColumn({ stage, applications, droppableId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className={cn('mb-3 flex items-center gap-2 border-b pb-3', stage.color)}>
        <h3 className="font-semibold text-white">{stage.label}</h3>
        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
          {applications.length}
        </span>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-24 flex-1 flex-col gap-3 rounded-lg p-2 transition-colors',
          isOver ? 'bg-slate-700/50' : 'bg-slate-800/30'
        )}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-600">Drop here</p>
        )}
      </div>
    </div>
  )
}
