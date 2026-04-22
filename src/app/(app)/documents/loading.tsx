import { PageSkeletonHeader, CardRowSkeleton } from '@/components/ui/page-skeleton'

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Documents" />
      <CardRowSkeleton rows={6} />
    </div>
  )
}
