'use client'

import { useState } from 'react'
import { CareerTimeline } from './CareerTimeline'
import { ChronicleTimeline } from './ChronicleTimeline'
import type { RoleEvent } from '@/lib/supabase/types'

interface Props {
  roles: any[]
  allEvents: RoleEvent[]
}

export function TimelineTabs({ roles, allEvents }: Props) {
  const [tab, setTab] = useState<'river' | 'chronicle'>('river')

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white border border-slate-100 shadow-sm p-1 w-fit">
        <button
          onClick={() => setTab('river')}
          className={
            tab === 'river'
              ? 'rounded-lg px-5 py-2 text-sm font-semibold bg-sky-600 text-white transition-colors'
              : 'rounded-lg px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors'
          }
        >
          River
        </button>
        <button
          onClick={() => setTab('chronicle')}
          className={
            tab === 'chronicle'
              ? 'rounded-lg px-5 py-2 text-sm font-semibold bg-sky-600 text-white transition-colors'
              : 'rounded-lg px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors'
          }
        >
          Chronicle
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        {tab === 'river' ? (
          <CareerTimeline roles={roles} />
        ) : (
          <ChronicleTimeline events={allEvents} />
        )}
      </div>
    </div>
  )
}
