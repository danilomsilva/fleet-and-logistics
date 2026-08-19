import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { Driver } from '@/mock-api/schemas/driver'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { dataTableFeatures } from '@/shared/components/data-table/data-table-features'
import { DRIVER_SHIFT_CONFIG, DRIVER_STATUS_CONFIG } from '../driver-status-config'

const helper = createColumnHelper<typeof dataTableFeatures, Driver>()

export function createDriverColumns(vehicleNameById: Map<string, string>) {
  return [
    helper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link to={`/drivers/${info.row.original.id}`} className="font-medium hover:underline">
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const config = DRIVER_STATUS_CONFIG[info.getValue()]
        return <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
      },
    }),
    helper.accessor('assignedVehicleId', {
      header: 'Assigned vehicle',
      cell: (info) => {
        const id = info.getValue()
        return id ? (
          (vehicleNameById.get(id) ?? id)
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      },
    }),
    helper.accessor('deliveriesToday', { header: 'Deliveries today' }),
    helper.accessor('completedDeliveries', { header: 'Completed deliveries' }),
    helper.accessor('availability', {
      header: 'Shift',
      cell: (info) => DRIVER_SHIFT_CONFIG[info.getValue().shift].label,
    }),
    // helper.accessor('lastActiveAt', {
    //   header: 'Last active',
    //   cell: (info) => dateFormatter.format(new Date(info.getValue())),
    // }),
  ]
}
