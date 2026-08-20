import type { Vehicle, VehicleStatus } from '@/mock-api/schemas/vehicle'
import { vehicleStatusSchema } from '@/mock-api/schemas/vehicle'
import { VEHICLE_STATUS_CONFIG } from '@/features/vehicles/vehicle-status-config'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'

export interface FleetStatusWidgetProps {
  vehicles: Vehicle[]
}

export function FleetStatusWidget({ vehicles }: FleetStatusWidgetProps) {
  const counts = vehicleStatusSchema.options.map((status: VehicleStatus) => ({
    status,
    count: vehicles.filter((v) => v.status === status).length,
  }))

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Fleet status</h2>
      <ul className="space-y-2">
        {counts.map(({ status, count }) => {
          const config = VEHICLE_STATUS_CONFIG[status]
          return (
            <li key={status} className="flex items-center justify-between">
              <StatusBadge label={config.label} tone={config.tone} icon={config.icon} />
              <span className="text-sm font-medium tabular-nums">{count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
