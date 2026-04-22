import { Skeleton } from '@/components/ui/skeleton'
import { PageSkeletonHeader } from '@/components/ui/page-skeleton'

export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Career Timeline" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <Skeleton className="h-20 flex-1 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
