import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { Alert, AlertStatus } from '@/mock-api/schemas/alert'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { Button } from '@/components/ui/button'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import { getEntityPath } from '@/shared/lib/entity-routes'
import { ALERT_PRIORITY_CONFIG, ALERT_STATUS_CONFIG } from '../alert-status-config'
import type { useUpdateAlertStatus } from '../hooks/useUpdateAlertStatus'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const helper = createColumnHelper<typeof dataTableFeatures, Alert>()

export function createAlertColumns(updateStatus: ReturnType<typeof useUpdateAlertStatus>) {
  function handleChange(alert: Alert, status: AlertStatus, successMessage: string) {
    updateStatus.mutate(
      { id: alert.id, status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: () => toast.error("Couldn't update the alert. Please try again."),
      },
    )
  }

  return [
    helper.accessor('message', {
      header: 'Message',
      cell: (info) => (
        <Link to={getEntityPath(info.row.original.relatedEntity)} className="hover:underline">
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('type', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue().replace(/_/g, ' ')}</span>,
    }),
    helper.accessor('priority', {
      header: 'Priority',
      cell: (info) => {
        const config = ALERT_PRIORITY_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = ALERT_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('timestamp', {
      header: 'Reported',
      cell: (info) => dateFormatter.format(new Date(info.getValue())),
    }),
    helper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const alert = info.row.original
        return (
          <div className="flex gap-1.5">
            {alert.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                disabled={updateStatus.isPending}
                onClick={() =>
                  handleChange(alert, 'acknowledged', `Alert ${alert.id} acknowledged.`)
                }
              >
                Acknowledge
              </Button>
            )}
            {alert.status !== 'resolved' && (
              <Button
                size="sm"
                disabled={updateStatus.isPending}
                onClick={() => handleChange(alert, 'resolved', `Alert ${alert.id} resolved.`)}
              >
                Resolve
              </Button>
            )}
          </div>
        )
      },
    }),
  ]
}
