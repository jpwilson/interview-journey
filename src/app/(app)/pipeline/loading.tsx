import { Skeleton } from '@/components/ui/skeleton'
import { PageSkeletonHeader } from '@/components/ui/page-skeleton'

export default function PipelineLoading() {
  return (
    <div className="flex h-full flex-col bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Pipeline" />
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 space-y-3 rounded-xl bg-white p-3 shadow-sm">
              <Skeleton className="mb-2 h-4 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
