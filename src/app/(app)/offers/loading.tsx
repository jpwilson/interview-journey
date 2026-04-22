import { PageSkeletonHeader, CardRowSkeleton } from '@/components/ui/page-skeleton'

export default function OffersLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Offers" />
      <CardRowSkeleton rows={4} />
    </div>
  )
}
