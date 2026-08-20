import { Link } from 'react-router'
import type { Vehicle } from '@/mock-api/schemas/vehicle'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { useMaintenanceRecords } from '@/features/maintenance/hooks/useMaintenanceRecords'
import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { useActivity } from '@/shared/hooks/useActivity'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { formatKm } from '@/shared/lib/format'
import { VEHICLE_MAINTENANCE_STATUS_CONFIG, VEHICLE_STATUS_CONFIG } from '../vehicle-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

export function VehicleOverviewTab({ vehicle }: { vehicle: Vehicle }) {
  const { data: driversData } = useDrivers({ pageSize: 200 })
  const driver = driversData?.data.find((d) => d.id === vehicle.driverId)
  const statusConfig = VEHICLE_STATUS_CONFIG[vehicle.status]

  const fields: [string, React.ReactNode][] = [
    ['Registration', vehicle.registration],
    ['Type', <span className="capitalize">{vehicle.type}</span>],
    [
      'Status',
      <StatusBadge label={statusConfig.label} tone={statusConfig.tone} icon={statusConfig.icon} />,
    ],
    ['Current location', vehicle.location.label],
    [
      'Assigned driver',
      driver ? (
        <Link to={`/drivers/${driver.id}`} className="hover:underline">
          {driver.name}
        </Link>
      ) : (
        'Unassigned'
      ),
    ],
    ['Mileage', formatKm(vehicle.mileage)],
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label} className="space-y-1 rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="text-sm font-medium">{value}</div>
        </div>
      ))}
    </div>
  )
}

export function VehicleMaintenanceTab({ vehicle }: { vehicle: Vehicle }) {
  const { data } = useMaintenanceRecords({ vehicleId: vehicle.id, pageSize: 50 })
  const statusConfig = VEHICLE_MAINTENANCE_STATUS_CONFIG[vehicle.maintenanceStatus]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1 rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Service status</p>
          <StatusBadge
            label={statusConfig.label}
            tone={statusConfig.tone}
            icon={statusConfig.icon}
          />
        </div>
        <div className="space-y-1 rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Next service</p>
          <p className="text-sm font-medium">{formatDate(vehicle.nextServiceDate)}</p>
        </div>
      </div>
      {data && data.data.length === 0 ? (
        <EmptyState
          title="No service history"
          description="No service records for this vehicle yet."
        />
      ) : (
        <ul className="space-y-2">
          {data?.data.map((record) => (
            <li key={record.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium capitalize">{record.maintenanceType.replace('_', ' ')}</p>
              <p className="text-muted-foreground">
                Scheduled {formatDate(record.scheduledDate)} · {record.status.replace('_', ' ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function VehicleDeliveryHistoryTab({ vehicle }: { vehicle: Vehicle }) {
  const { data } = useDeliveries({ vehicleId: vehicle.id, pageSize: 50 })

  if (data && data.data.length === 0) {
    return (
      <EmptyState
        title="No delivery history"
        description="This vehicle hasn't been assigned any deliveries."
      />
    )
  }

  return (
    <ul className="space-y-2">
      {data?.data.map((delivery) => (
        <li key={delivery.id} className="rounded-lg border p-3 text-sm">
          <Link to={`/deliveries/${delivery.id}`} className="font-medium hover:underline">
            {delivery.id}
          </Link>
          <p className="text-muted-foreground">
            {delivery.customer} · {delivery.status.replace('_', ' ')} ·{' '}
            {formatDate(delivery.scheduledTime)}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function VehicleActivityTab({ vehicle }: { vehicle: Vehicle }) {
  const { data } = useActivity({ entityKind: 'vehicle', entityId: vehicle.id, pageSize: 50 })

  if (data && data.data.length === 0) {
    return <EmptyState title="No activity yet" />
  }

  return <ActivityTimeline events={data?.data ?? []} />
}
