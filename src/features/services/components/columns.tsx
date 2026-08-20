import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { ServiceRecord } from '@/mock-api/schemas/service'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import { SERVICE_PRIORITY_CONFIG, SERVICE_STATUS_CONFIG } from '../service-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})
function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

const helper = createColumnHelper<typeof dataTableFeatures, ServiceRecord>()

export function createServiceColumns(
  vehicleById: Map<string, { name: string; registration: string }>,
) {
  return [
    helper.accessor('id', {
      header: 'Record ID',
      cell: (info) => (
        <Link to={`/services/${info.getValue()}`} className="font-medium hover:underline">
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
            {vehicleById.get(id)?.name ?? id}
          </Link>
        )
      },
    }),
    helper.accessor((row) => vehicleById.get(row.vehicleId)?.registration ?? '—', {
      id: 'registration',
      header: 'Registration',
    }),
    helper.accessor('serviceType', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue().replace('_', ' ')}</span>,
    }),
    helper.accessor('priority', {
      header: 'Priority',
      cell: (info) => {
        const config = SERVICE_PRIORITY_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = SERVICE_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('scheduledDate', {
      header: 'Scheduled date',
      cell: (info) => formatDate(info.getValue()),
    }),
    helper.accessor('completionDate', {
      header: 'Completed in',
      cell: (info) => formatDate(info.getValue()),
    }),
  ]
}
