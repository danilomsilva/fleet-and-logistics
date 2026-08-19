import { Link } from 'react-router'
import type { Driver } from '@/mock-api/schemas/driver'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { useActivity } from '@/shared/hooks/useActivity'
import { DRIVER_SHIFT_CONFIG, DRIVER_STATUS_CONFIG } from '../driver-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}
function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function DriverOverviewTab({ driver }: { driver: Driver }) {
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const vehicle = vehiclesData?.data.find((v) => v.id === driver.assignedVehicleId)
  const statusConfig = DRIVER_STATUS_CONFIG[driver.status]

  const fields: [string, React.ReactNode][] = [
    [
      'Status',
      <StatusBadge label={statusConfig.label} tone={statusConfig.tone} icon={statusConfig.icon} />,
    ],
    [
      'Assigned vehicle',
      vehicle ? (
        <Link to={`/vehicles/${vehicle.id}`} className="hover:underline">
          {vehicle.name}
        </Link>
      ) : (
        'Unassigned'
      ),
    ],
    ['Shift', DRIVER_SHIFT_CONFIG[driver.availability.shift].label],
    ['Deliveries today', driver.deliveriesToday],
    ['Completed deliveries', driver.completedDeliveries],
    ['Last active', formatDate(driver.lastActiveAt)],
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

export function DriverTodaysDeliveriesTab({ driver }: { driver: Driver }) {
  const { data } = useDeliveries({ driverId: driver.id, date: todayIso(), pageSize: 50 })

  if (data && data.data.length === 0) {
    return <EmptyState title="No deliveries today" />
  }

  return (
    <ul className="space-y-2">
      {data?.data.map((delivery) => (
        <li key={delivery.id} className="rounded-lg border p-3 text-sm">
          <Link to={`/deliveries/${delivery.id}`} className="font-medium hover:underline">
            {delivery.id}
          </Link>
          <p className="text-muted-foreground">
            {delivery.customer} · {delivery.status.replace('_', ' ')}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function DriverDeliveryHistoryTab({ driver }: { driver: Driver }) {
  const { data } = useDeliveries({ driverId: driver.id, pageSize: 50 })

  if (data && data.data.length === 0) {
    return <EmptyState title="No delivery history" />
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

export function DriverActivityTab({ driver }: { driver: Driver }) {
  const { data } = useActivity({ entityKind: 'driver', entityId: driver.id, pageSize: 50 })

  if (data && data.data.length === 0) {
    return <EmptyState title="No activity yet" />
  }

  return <ActivityTimeline events={data?.data ?? []} />
}
