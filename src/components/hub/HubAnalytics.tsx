'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  totalApps: number
  byStage: { stage: string; count: number }[]
  classified: number
  totalDocs: number
}

const STAGE_COLORS: Record<string, string> = {
  applied: '#64748b',
  screening: '#eab308',
  interview: '#3b82f6',
  offer: '#a855f7',
  hired: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
}

export function HubAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: apps }, { data: docs }] = await Promise.all([
        supabase.from('applications').select('stage'),
        supabase.from('documents').select('classification_status'),
      ])

      const byStage = Object.entries(
        (apps ?? []).reduce<Record<string, number>>((acc, a) => {
          acc[a.stage] = (acc[a.stage] ?? 0) + 1
          return acc
        }, {})
      ).map(([stage, count]) => ({ stage, count }))

      setStats({
        totalApps: apps?.length ?? 0,
        byStage,
        classified: docs?.filter((d) => d.classification_status === 'classified').length ?? 0,
        totalDocs: docs?.length ?? 0,
      })
    }
    load()
  }, [])

  if (!stats) return <p className="text-center text-sm text-slate-500 py-8">Loading stats…</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Applications', value: stats.totalApps },
          { label: 'Documents', value: stats.totalDocs },
          { label: 'AI classified', value: stats.classified },
          { label: 'Active', value: stats.byStage.filter(s => !['hired','rejected','withdrawn'].includes(s.stage)).reduce((a,b)=>a+b.count,0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-slate-700 p-3 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {stats.byStage.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-400">By stage</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats.byStage} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.byStage.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
