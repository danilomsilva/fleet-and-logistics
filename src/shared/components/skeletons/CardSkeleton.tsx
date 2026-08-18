import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface CardSkeletonProps {
  label?: string
  className?: string
}

export function CardSkeleton({ label = 'Loading', className }: CardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('space-y-3 rounded-lg border p-4', className)}
    >
      <Skeleton aria-hidden="true" className="h-4 w-24" />
      <Skeleton aria-hidden="true" className="h-7 w-16" />
      <Skeleton aria-hidden="true" className="h-3 w-32" />
    </div>
  )
}
