import { Skeleton } from '@/components/ui/skeleton'
import { PageSkeletonHeader, StatsGridSkeleton } from '@/components/ui/page-skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Analytics" />
      <StatsGridSkeleton />
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
