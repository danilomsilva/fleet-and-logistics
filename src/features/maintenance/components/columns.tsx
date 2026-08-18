import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { MaintenanceRecord } from '@/mock-api/schemas/maintenance'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import {
  MAINTENANCE_PRIORITY_CONFIG,
  MAINTENANCE_STATUS_CONFIG,
} from '../maintenance-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

const helper = createColumnHelper<typeof dataTableFeatures, MaintenanceRecord>()

export function createMaintenanceColumns(vehicleNameById: Map<string, string>) {
  return [
    helper.accessor('id', {
      header: 'Record ID',
      cell: (info) => (
        <Link to={`/maintenance/${info.getValue()}`} className="font-medium hover:underline">
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('vehicleId', {
      header: 'Vehicle',
      cell: (info) => {
        const id = info.getValue()
        return (
          <Link to={`/vehicles/${id}`} className="hover:underline">
            {vehicleNameById.get(id) ?? id}
          </Link>
        )
      },
    }),
    helper.accessor('maintenanceType', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue().replace('_', ' ')}</span>,
    }),
    helper.accessor('priority', {
      header: 'Priority',
      cell: (info) => {
        const config = MAINTENANCE_PRIORITY_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = MAINTENANCE_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('scheduledDate', {
      header: 'Scheduled date',
      cell: (info) => formatDate(info.getValue()),
    }),
    helper.accessor('completionDate', {
      header: 'Completed',
      cell: (info) => formatDate(info.getValue()),
    }),
  ]
}
