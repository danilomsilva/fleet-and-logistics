import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { useActivity } from '@/shared/hooks/useActivity'
import { useDelivery } from './hooks/useDelivery'
import { useUpdateDeliveryStatus } from './hooks/useUpdateDeliveryStatus'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { DELIVERY_PRIORITY_CONFIG, DELIVERY_STATUS_CONFIG } from './delivery-status-config'
import { AssignDeliveryDialog } from './components/AssignDeliveryDialog'
import { DeliveryRouteMap } from './components/DeliveryRouteMap'
import type { DeliveryStatus } from '@/mock-api/schemas/delivery'

const dateOnlyFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
function formatDateOnly(value: string | null) {
  return value ? dateOnlyFormatter.format(new Date(value)) : '—'
}

const ACTIVE_STATUSES: DeliveryStatus[] = ['new', 'in_transit', 'delayed']

export function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: delivery, isLoading, isError, refetch } = useDelivery(id ?? '')
  const { data: driversData } = useDrivers({ pageSize: 200 })
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const { data: activityData } = useActivity({ entityKind: 'delivery', entityId: id, pageSize: 50 })
  const updateStatus = useUpdateDeliveryStatus()
  const [assignOpen, setAssignOpen] = useState(false)

  if (isLoading) return <DetailPageSkeleton label="Loading delivery" />
  if (isError || !delivery) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load delivery" onRetry={() => refetch()} />
      </div>
    )
  }

  const driver = driversData?.data.find((d) => d.id === delivery.driverId)
  const vehicle = vehiclesData?.data.find((v) => v.id === delivery.vehicleId)
  const statusConfig = DELIVERY_STATUS_CONFIG[delivery.status]
  const priorityConfig = DELIVERY_PRIORITY_CONFIG[delivery.priority]
  const isActive = ACTIVE_STATUSES.includes(delivery.status)

  function handleStatusChange(status: DeliveryStatus, successMessage: string) {
    updateStatus.mutate(
      { id: delivery!.id, status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: () => toast.error("Couldn't update the delivery. Please try again."),
      },
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{delivery.id}</h1>
        <div className="flex flex-wrap gap-2">
          {delivery.status === 'new' && (
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              Assign
            </Button>
          )}
          {delivery.status === 'in_transit' && (
            <Button
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() =>
                handleStatusChange('delivered', `Delivery ${delivery.id} marked delivered.`)
              }
            >
              Mark delivered
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              disabled={updateStatus.isPending}
              onClick={() =>
                handleStatusChange('delayed', `Delivery ${delivery.id} reported as delayed.`)
              }
            >
              Report delay
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Route</h2>
          <DeliveryRouteMap pickup={delivery.pickup} destination={delivery.destination} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-medium">Details</h2>
          <div className="divide-y rounded-lg border">
            <div className="space-y-1 p-4">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium">{delivery.customer}</p>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{delivery.pickup.label}</p>
              </div>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium">{delivery.destination.label}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Priority</p>
                <StatusBadge
                  label={priorityConfig.label}
                  tone={priorityConfig.tone}
                  icon={priorityConfig.icon}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge
                  label={statusConfig.label}
                  tone={statusConfig.tone}
                  icon={statusConfig.icon}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Driver</p>
                <div className="text-sm font-medium">
                  {driver ? (
                    <Link to={`/drivers/${driver.id}`} className="hover:underline">
                      {driver.name}
                    </Link>
                  ) : (
                    'Unassigned'
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <div className="text-sm font-medium">
                  {vehicle ? (
                    <Link to={`/vehicles/${vehicle.id}`} className="hover:underline">
                      {vehicle.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 p-4">
              <p className="text-xs text-muted-foreground">Scheduled delivery</p>
              <p className="text-sm font-medium">{formatDateOnly(delivery.scheduledTime)}</p>
            </div>

            <div className="space-y-1 p-4">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm font-medium">{delivery.notes || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Activity</h2>
        <ActivityTimeline events={activityData?.data ?? []} readOnly />
      </div>

      <AssignDeliveryDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        deliveryId={delivery.id}
        requiredVehicleType={delivery.requiredVehicleType}
      />
    </div>
  )
}
