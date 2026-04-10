'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface FunnelCounts {
  applied: number
  screening: number
  interviewing: number
  offer: number
  hired: number
}

const STAGE_COLORS: Record<string, string> = {
  Applied: '#475569',
  Screening: '#ca8a04',
  Interviewing: '#2563eb',
  Offer: '#7c3aed',
  Hired: '#16a34a',
}

interface AnalyticsFunnelProps {
  counts: FunnelCounts
}

export function AnalyticsFunnel({ counts }: AnalyticsFunnelProps) {
  const data = [
    { stage: 'Applied', count: counts.applied },
    { stage: 'Screening', count: counts.screening },
    { stage: 'Interviewing', count: counts.interviewing },
    { stage: 'Offer', count: counts.offer },
    { stage: 'Hired', count: counts.hired },
  ]

  return (
    <div className="space-y-4">
      {/* Conversion rates between stages */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
        {data.map((d, i) => {
          if (i === 0) return null
          const prev = data[i - 1].count
          const rate = prev > 0 ? Math.round((d.count / prev) * 100) : 0
          return (
            <span key={d.stage}>
              ↓ {rate}% to {d.stage}
            </span>
          )
        })}
      </div>

      {/* Horizontal bar chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 24, bottom: 0, left: 80 }}
        >
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="stage"
            tick={{ fill: '#cbd5e1', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? '#475569'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
