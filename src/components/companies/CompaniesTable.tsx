'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { CompanyRow } from '@/app/(app)/companies/page'

type SortKey = 'name' | 'rolesCount' | 'activeCount' | 'status' | 'lastActivity'
type SortDir = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'alumni' | 'past'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-[var(--accent-ij-wash)] text-[var(--accent-ij-ink)] border-[var(--accent-ij-wash)]',
  alumni: 'bg-green-50 text-green-700 border-green-200',
  past: 'bg-slate-50 text-slate-500 border-slate-200',
}

const FILTER_PILLS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'past', label: 'Previous' },
]

function SortIcon({
  col,
  activeKey,
  dir,
}: {
  col: SortKey
  activeKey: SortKey
  dir: SortDir
}) {
  if (activeKey !== col) return <ArrowUpDown className="h-3 w-3 text-slate-300" />
  return dir === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-[var(--accent-ij-ink)]" />
  ) : (
    <ArrowDown className="h-3 w-3 text-[var(--accent-ij-ink)]" />
  )
}

export function CompaniesTable({ rows }: { rows: CompanyRow[] }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('lastActivity')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState<FilterStatus>('all')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const filtered = useMemo(() => {
    let result = rows

    // Filter by status
    if (filter !== 'all') {
      result = result.filter((r) => r.status === filter)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.domain?.toLowerCase().includes(q) ||
          r.industry?.toLowerCase().includes(q)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'rolesCount':
          cmp = a.rolesCount - b.rolesCount
          break
        case 'activeCount':
          cmp = a.activeCount - b.activeCount
          break
        case 'status': {
          const order = { active: 0, alumni: 1, past: 2 }
          cmp = order[a.status] - order[b.status]
          break
        }
        case 'lastActivity':
          cmp = (a.lastActivity ?? '').localeCompare(b.lastActivity ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [rows, search, sortKey, sortDir, filter])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ij)]/20 focus:border-[var(--accent-ij)]"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {FILTER_PILLS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ij)] focus-visible:ring-offset-1 ${
                filter === key
                  ? 'bg-[var(--accent-ij-ink)] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--accent-ij-wash)] hover:text-[var(--accent-ij-ink)]'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {rows.filter((r) => r.status === key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left py-3 px-4">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
                  Company <SortIcon col="name" activeKey={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left py-3 px-4 hidden md:table-cell">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Industry</span>
              </th>
              <th className="text-center py-3 px-4">
                <button onClick={() => toggleSort('rolesCount')} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 mx-auto">
                  Roles <SortIcon col="rolesCount" activeKey={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button onClick={() => toggleSort('activeCount')} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 mx-auto">
                  Active <SortIcon col="activeCount" activeKey={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button onClick={() => toggleSort('status')} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 mx-auto">
                  Status <SortIcon col="status" activeKey={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 ml-auto">
                  Last Activity <SortIcon col="lastActivity" activeKey={sortKey} dir={sortDir} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  {search ? `No companies matching "${search}"` : 'No companies in this filter'}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className={`group transition-colors hover:bg-[var(--accent-ij-wash)]/40 ${i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/companies/${row.id}`}
                      className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ij)] focus-visible:ring-offset-2"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] text-white text-xs font-bold">
                        {row.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-[var(--accent-ij-ink)] transition-colors">{row.name}</p>
                        {row.domain && (
                          <p className="text-xs text-slate-400">{row.domain}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    {row.industry ? (
                      <span className="text-xs text-slate-500 capitalize">{row.industry}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-sm font-semibold text-slate-900">{row.rolesCount}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {row.activeCount > 0 ? (
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--accent-ij-wash)] px-2 text-xs font-bold text-[var(--accent-ij-ink)]">
                        {row.activeCount}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[row.status]}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.lastActivity ? (
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(row.lastActivity), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400">
        Showing {filtered.length} of {rows.length} companies
      </p>
    </div>
  )
}
