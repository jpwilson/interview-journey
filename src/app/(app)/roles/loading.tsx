import { PageSkeletonHeader, CardRowSkeleton } from '@/components/ui/page-skeleton'

export default function RolesLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <PageSkeletonHeader title="Roles" />
      <CardRowSkeleton rows={6} />
    </div>
  )
}
