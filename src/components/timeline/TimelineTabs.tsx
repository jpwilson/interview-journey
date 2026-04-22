'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CareerTimeline } from './CareerTimeline'
import { ChronicleTimeline } from './ChronicleTimeline'
import type { RoleEvent } from '@/lib/supabase/types'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roles: any[]
  allEvents: RoleEvent[]
}

export function TimelineTabs({ roles, allEvents }: Props) {
  return (
    <Tabs defaultValue="river" className="gap-0">
      <TabsList className="mb-6 bg-white border border-slate-100 shadow-sm p-1 h-auto w-fit rounded-xl">
        <TabsTrigger
          value="river"
          className="h-auto rounded-lg px-5 py-2 text-sm font-medium data-active:bg-sky-600 data-active:text-white"
        >
          River
        </TabsTrigger>
        <TabsTrigger
          value="chronicle"
          className="h-auto rounded-lg px-5 py-2 text-sm font-medium data-active:bg-sky-600 data-active:text-white"
        >
          Chronicle
        </TabsTrigger>
      </TabsList>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <TabsContent value="river" className="mt-0">
          <CareerTimeline roles={roles} />
        </TabsContent>
        <TabsContent value="chronicle" className="mt-0">
          <ChronicleTimeline events={allEvents} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
