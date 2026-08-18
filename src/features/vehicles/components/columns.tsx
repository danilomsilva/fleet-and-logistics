import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { Vehicle } from '@/mock-api/schemas/vehicle'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import { VEHICLE_MAINTENANCE_STATUS_CONFIG, VEHICLE_STATUS_CONFIG } from '../vehicle-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

const helper = createColumnHelper<typeof dataTableFeatures, Vehicle>()

export function createVehicleColumns(driverNameById: Map<string, string>) {
  return [
    helper.accessor('name', {
      header: 'Vehicle',
      cell: (info) => (
        <Link to={`/vehicles/${info.row.original.id}`} className="font-medium hover:underline">
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('registration', { header: 'Registration' }),
    helper.accessor('type', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    helper.accessor('driverId', {
      header: 'Driver',
      cell: (info) => {
        const id = info.getValue()
        return id ? (
          (driverNameById.get(id) ?? id)
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = VEHICLE_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('location', {
      header: 'Location',
      cell: (info) => info.getValue().label,
    }),
    helper.accessor('mileage', {
      header: 'Mileage',
      cell: (info) => info.getValue().toLocaleString(),
    }),
    helper.accessor('nextServiceDate', {
      header: 'Next service',
      cell: (info) => formatDate(info.getValue()),
    }),
    helper.accessor('maintenanceStatus', {
      header: 'Maintenance',
      cell: (info) => {
        const config = VEHICLE_MAINTENANCE_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('lastUpdatedAt', {
      header: 'Last updated',
      cell: (info) => formatDate(info.getValue()),
    }),
  ]
}
