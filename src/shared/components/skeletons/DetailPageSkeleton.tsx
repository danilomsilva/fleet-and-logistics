import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface DetailPageSkeletonProps {
  label?: string
  className?: string
}

export function DetailPageSkeleton({ label = 'Loading', className }: DetailPageSkeletonProps) {
  return (
    <div role="status" aria-label={label} className={cn('space-y-6 p-6', className)}>
      <div aria-hidden="true" className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
