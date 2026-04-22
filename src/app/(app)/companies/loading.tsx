import { Skeleton } from '@/components/ui/skeleton'
import { PageSkeletonHeader, CardRowSkeleton } from '@/components/ui/page-skeleton'

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Companies" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      <CardRowSkeleton rows={6} />
    </div>
  )
}
