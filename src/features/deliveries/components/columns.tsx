import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { Delivery } from '@/mock-api/schemas/delivery'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import { DELIVERY_PRIORITY_CONFIG, DELIVERY_STATUS_CONFIG } from '../delivery-status-config'

const dateOnlyFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
function formatDateOnly(value: string | null) {
  return value ? dateOnlyFormatter.format(new Date(value)) : '—'
}

const helper = createColumnHelper<typeof dataTableFeatures, Delivery>()

export function createDeliveryColumns(
  driverNameById: Map<string, string>,
  vehicleNameById: Map<string, string>,
) {
  return [
    helper.accessor('id', {
      header: 'Delivery ID',
      cell: (info) => (
        <Link to={`/deliveries/${info.getValue()}`} className="font-medium hover:underline">
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('customer', { header: 'Customer' }),
    helper.accessor((row) => row.pickup.label, { id: 'pickup', header: 'Pickup' }),
    helper.accessor((row) => row.destination.label, { id: 'destination', header: 'Destination' }),
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
    helper.accessor('vehicleId', {
      header: 'Vehicle',
      cell: (info) => {
        const id = info.getValue()
        return id ? (
          (vehicleNameById.get(id) ?? id)
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    }),
    helper.accessor('priority', {
      header: 'Priority',
      cell: (info) => {
        const config = DELIVERY_PRIORITY_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = DELIVERY_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('scheduledTime', {
      header: 'Scheduled delivery',
      cell: (info) => formatDateOnly(info.getValue()),
    }),
  ]
}
