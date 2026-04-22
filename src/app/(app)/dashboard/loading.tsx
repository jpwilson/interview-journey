import { Skeleton } from '@/components/ui/skeleton'
import { StatsGridSkeleton, CardRowSkeleton } from '@/components/ui/page-skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-56" />

      <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-16 w-full" />
      </div>

      <StatsGridSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <Skeleton className="mb-4 h-5 w-32" />
          <CardRowSkeleton rows={4} />
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <Skeleton className="mb-4 h-5 w-32" />
          <CardRowSkeleton rows={4} />
        </div>
      </div>
    </div>
  )
}
