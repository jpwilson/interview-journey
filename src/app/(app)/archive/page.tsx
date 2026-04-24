import { redirect } from 'next/navigation'

// Temporary: Archive is an alias for the Pipeline Table filtered to closed
// roles until we design a dedicated archive view. See docs/product/decisions.md.
export default function ArchivePage() {
  redirect('/pipeline?tab=table')
}
