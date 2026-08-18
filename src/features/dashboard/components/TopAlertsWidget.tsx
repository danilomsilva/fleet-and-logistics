import { Link } from 'react-router'
import type { Alert } from '@/mock-api/schemas/alert'
import { ALERT_PRIORITY_CONFIG, ALERT_PRIORITY_ORDER } from '@/features/alerts/alert-status-config'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { getEntityPath } from '@/shared/lib/entity-routes'

export interface TopAlertsWidgetProps {
  alerts: Alert[]
}

export function TopAlertsWidget({ alerts }: TopAlertsWidgetProps) {
  const top = [...alerts]
    .sort((a, b) => ALERT_PRIORITY_ORDER[a.priority] - ALERT_PRIORITY_ORDER[b.priority])
    .slice(0, 5)

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Top alerts</h2>
      {top.length === 0 ? (
        <EmptyState title="No active alerts" description="Everything looks nominal." />
      ) : (
        <ul className="space-y-1">
          {top.map((alert) => {
            const config = ALERT_PRIORITY_CONFIG[alert.priority]
            return (
              <li key={alert.id}>
                <Link
                  to={getEntityPath(alert.relatedEntity)}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="truncate">{alert.message}</span>
                  <StatusBadge
                    label={config.label}
                    tone={config.tone}
                    icon={config.icon}
                    className="shrink-0"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
