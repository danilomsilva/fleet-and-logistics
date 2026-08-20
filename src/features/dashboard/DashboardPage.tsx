import { AlertTriangle, Package, Truck, Wrench } from 'lucide-react'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'
import { useActivity } from '@/shared/hooks/useActivity'
import { KPICard } from '@/shared/components/kpi-card/KPICard'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { CardSkeleton } from '@/shared/components/skeletons/CardSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { DeliveryStatusChart } from './components/DeliveryStatusChart'
import { FleetStatusWidget } from './components/FleetStatusWidget'
import { TopAlertsWidget } from './components/TopAlertsWidget'

const ACTIVE_DELIVERY_STATUSES = new Set(['pending', 'assigned', 'in_transit', 'delayed'])

export function DashboardPage() {
  const vehicles = useVehicles({ pageSize: 200 })
  const deliveries = useDeliveries({ pageSize: 200 })
  const activeAlerts = useAlerts({ status: 'active', pageSize: 200 })
  const activity = useActivity({ pageSize: 8 })

  const isLoading =
    vehicles.isLoading || deliveries.isLoading || activeAlerts.isLoading || activity.isLoading
  const isError = vehicles.isError || deliveries.isError || activeAlerts.isError || activity.isError

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Couldn't load dashboard data"
          onRetry={() => {
            vehicles.refetch()
            deliveries.refetch()
            activeAlerts.refetch()
            activity.refetch()
          }}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const vehicleList = vehicles.data!.data
  const deliveryList = deliveries.data!.data
  const alertList = activeAlerts.data!.data
  const activeDeliveryCount = deliveryList.filter((d) =>
    ACTIVE_DELIVERY_STATUSES.has(d.status),
  ).length
  const serviceCount = vehicleList.filter((v) => v.status === 'service').length

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total vehicles" value={vehicles.data!.total} icon={Truck} />
        <KPICard label="Active deliveries" value={activeDeliveryCount} icon={Package} />
        <KPICard label="Active alerts" value={activeAlerts.data!.total} icon={AlertTriangle} />
        <KPICard label="In service" value={serviceCount} icon={Wrench} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DeliveryStatusChart deliveries={deliveryList} />
        <FleetStatusWidget vehicles={vehicleList} />
        <TopAlertsWidget alerts={alertList} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Recent activity</h2>
        <ActivityTimeline events={activity.data?.data ?? []} />
      </div>
    </div>
  )
}
