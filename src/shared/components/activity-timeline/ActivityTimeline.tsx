import { Link } from 'react-router'
import type { ActivityEvent } from '@/mock-api/schemas/activity'
import { getEntityPath } from '@/shared/lib/entity-routes'
import { cn } from '@/lib/utils'

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export interface ActivityTimelineProps {
  events: ActivityEvent[]
  className?: string
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  return (
    <ol className={cn('space-y-1', className)}>
      {events.map((event) => (
        <li key={event.id}>
          <Link
            to={getEntityPath(event.relatedEntity)}
            className="flex items-baseline justify-between gap-4 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{event.description}</span>
            <time dateTime={event.timestamp} className="shrink-0 text-xs text-muted-foreground">
              {timeFormatter.format(new Date(event.timestamp))}
            </time>
          </Link>
        </li>
      ))}
    </ol>
  )
}
