import { cn } from '@/lib/utils'

export type ChipStatus =
  | 'exploring'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'negotiate'
  | 'hired'
  | 'rejected'
  | 'withdrew'
  | 'ghosted'
  | 'declined'

const LABELS: Record<ChipStatus, string> = {
  exploring: 'exploring',
  applied: 'applied',
  screening: 'screening',
  interview: 'interviewing',
  offer: 'offer',
  negotiate: 'negotiating',
  hired: 'hired',
  rejected: 'rejected',
  withdrew: 'withdrew',
  ghosted: 'ghosted',
  declined: 'declined',
}

export function Chip({
  status,
  children,
  className,
}: {
  status: ChipStatus
  children?: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('chip', `chip-${status}`, className)}>{children ?? LABELS[status]}</span>
  )
}
