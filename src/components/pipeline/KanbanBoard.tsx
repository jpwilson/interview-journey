'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { ApplicationCard } from './ApplicationCard'
import { updateKanbanOrder } from '@/lib/actions/applications'
import { toast } from 'sonner'
import type { ApplicationWithCompany, ApplicationStage } from '@/lib/supabase/types'

const STAGES: { id: ApplicationStage; label: string; color: string }[] = [
  { id: 'applied', label: 'Applied', color: 'border-slate-500' },
  { id: 'screening', label: 'Screening', color: 'border-yellow-500' },
  { id: 'interview', label: 'Interview', color: 'border-blue-500' },
  { id: 'offer', label: 'Offer', color: 'border-purple-500' },
  { id: 'hired', label: 'Hired', color: 'border-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-500' },
]

interface Props {
  initialApplications: ApplicationWithCompany[]
}

export function KanbanBoard({ initialApplications }: Props) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeApp, setActiveApp] = useState<ApplicationWithCompany | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const appsByStage = useCallback(
    (stage: ApplicationStage) =>
      applications
        .filter((a) => a.stage === stage)
        .sort((a, b) => a.kanban_order - b.kanban_order),
    [applications]
  )

  function handleDragStart({ active }: DragStartEvent) {
    const app = applications.find((a) => a.id === active.id)
    setActiveApp(app ?? null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const activeApp = applications.find((a) => a.id === activeId)
    if (!activeApp) return

    // overId could be a stage column ID or an application ID
    const targetStage = STAGES.find((s) => s.id === overId)?.id
    const targetApp = applications.find((a) => a.id === overId)
    const newStage = (targetStage ?? targetApp?.stage) as ApplicationStage | undefined

    if (!newStage || newStage === activeApp.stage) return

    setApplications((prev) =>
      prev.map((a) => (a.id === activeId ? { ...a, stage: newStage } : a))
    )
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveApp(null)
    if (!over) return

    const activeId = active.id as string
    const app = applications.find((a) => a.id === activeId)
    if (!app) return

    // Recalculate kanban_order for the dropped column
    const colApps = applications
      .filter((a) => a.stage === app.stage)
      .sort((a, b) => a.kanban_order - b.kanban_order)

    const updates = colApps.map((a, i) => ({
      id: a.id,
      kanban_order: i,
      stage: a.stage,
    }))

    try {
      await updateKanbanOrder(updates)
    } catch {
      toast.error('Failed to save position')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageApps = appsByStage(stage.id)
          return (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={stageApps.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                stage={stage}
                applications={stageApps}
                droppableId={stage.id}
              />
            </SortableContext>
          )
        })}
      </div>

      <DragOverlay>
        {activeApp ? <ApplicationCard application={activeApp} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
