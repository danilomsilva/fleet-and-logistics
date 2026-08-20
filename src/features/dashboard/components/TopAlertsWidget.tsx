import { Link } from 'react-router'
import type { Alert } from '@/mock-api/schemas/alert'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { getEntityPath } from '@/shared/lib/entity-routes'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export interface TopAlertsWidgetProps {
  alerts: Alert[]
}

export function TopAlertsWidget({ alerts }: TopAlertsWidgetProps) {
  const top = [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Top alerts</h2>
      {top.length === 0 ? (
        <EmptyState title="No active alerts" description="Everything looks nominal." />
      ) : (
        <ul className="space-y-1">
          {top.map((alert) => (
            <li key={alert.id}>
              <Link
                to={getEntityPath(alert.relatedEntity)}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="truncate">{alert.message}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dateFormatter.format(new Date(alert.timestamp))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
