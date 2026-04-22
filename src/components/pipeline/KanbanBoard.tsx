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
import { updateKanbanOrder } from '@/lib/actions/roles'
import { toast } from 'sonner'
import type { RoleWithCompany, RoleStage } from '@/lib/supabase/types'

const STAGES: { id: RoleStage; label: string; color: string }[] = [
  { id: 'exploring', label: 'Exploring', color: 'border-slate-400' },
  { id: 'applied', label: 'Applied', color: 'border-blue-400' },
  { id: 'screening', label: 'Screening', color: 'border-yellow-400' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-sky-500' },
  { id: 'offer', label: 'Offer', color: 'border-purple-500' },
  { id: 'negotiating', label: 'Negotiating', color: 'border-indigo-500' },
]

interface Props {
  initialRoles: RoleWithCompany[]
}

export function KanbanBoard({ initialRoles }: Props) {
  const [roles, setRoles] = useState(initialRoles)
  const [activeRole, setActiveRole] = useState<RoleWithCompany | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const rolesByStage = useCallback(
    (stage: RoleStage) =>
      roles
        .filter((r) => r.stage === stage)
        .sort((a, b) => a.kanban_order - b.kanban_order),
    [roles]
  )

  function handleDragStart({ active }: DragStartEvent) {
    const role = roles.find((r) => r.id === active.id)
    setActiveRole(role ?? null)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const activeRole = roles.find((r) => r.id === activeId)
    if (!activeRole) return

    // overId could be a stage column ID or a role ID
    const targetStage = STAGES.find((s) => s.id === overId)?.id
    const targetRole = roles.find((r) => r.id === overId)
    const newStage = (targetStage ?? targetRole?.stage) as RoleStage | undefined

    if (!newStage || newStage === activeRole.stage) return

    setRoles((prev) =>
      prev.map((r) => (r.id === activeId ? { ...r, stage: newStage } : r))
    )
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveRole(null)
    if (!over) return

    const activeId = active.id as string
    const role = roles.find((r) => r.id === activeId)
    if (!role) return

    // Recalculate kanban_order for the dropped column
    const colRoles = roles
      .filter((r) => r.stage === role.stage)
      .sort((a, b) => a.kanban_order - b.kanban_order)

    const updates = colRoles.map((r, i) => ({
      id: r.id,
      kanban_order: i,
      stage: r.stage,
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
      <div className="flex h-full gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:snap-none [scrollbar-width:thin]">
        {STAGES.map((stage) => {
          const stageRoles = rolesByStage(stage.id)
          return (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={stageRoles.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                stage={stage}
                applications={stageRoles}
                droppableId={stage.id}
              />
            </SortableContext>
          )
        })}
      </div>

      <DragOverlay>
        {activeRole ? <ApplicationCard application={activeRole} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
