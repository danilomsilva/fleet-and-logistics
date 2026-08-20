import { AlertTriangle, CalendarClock, UserCheck, Wrench } from 'lucide-react'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { useServiceRecords } from '@/features/services/hooks/useServiceRecords'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'
import { useActivity } from '@/shared/hooks/useActivity'
import { KPICard } from '@/shared/components/kpi-card/KPICard'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { CardSkeleton } from '@/shared/components/skeletons/CardSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { DeliveryStatusChart } from './components/DeliveryStatusChart'
import { FleetStatusChart } from './components/FleetStatusChart'
import { TopAlertsWidget } from './components/TopAlertsWidget'
import { DriverAvailabilityChart } from './components/DriverAvailabilityChart'
import { ServiceStatusChart } from './components/ServiceStatusChart'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function DashboardPage() {
  const vehicles = useVehicles({ pageSize: 200 })
  const drivers = useDrivers({ pageSize: 200 })
  const deliveries = useDeliveries({ pageSize: 200 })
  const deliveriesToday = useDeliveries({ date: todayIso(), pageSize: 1 })
  const serviceRecords = useServiceRecords({ pageSize: 200 })
  const activeAlerts = useAlerts({ status: 'active', pageSize: 200 })
  const activity = useActivity({ pageSize: 8 })

  const isLoading =
    vehicles.isLoading ||
    drivers.isLoading ||
    deliveries.isLoading ||
    deliveriesToday.isLoading ||
    serviceRecords.isLoading ||
    activeAlerts.isLoading ||
    activity.isLoading
  const isError =
    vehicles.isError ||
    drivers.isError ||
    deliveries.isError ||
    deliveriesToday.isError ||
    serviceRecords.isError ||
    activeAlerts.isError ||
    activity.isError

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Couldn't load dashboard data"
          onRetry={() => {
            vehicles.refetch()
            drivers.refetch()
            deliveries.refetch()
            deliveriesToday.refetch()
            serviceRecords.refetch()
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
  const driverList = drivers.data!.data
  const deliveryList = deliveries.data!.data
  const serviceRecordList = serviceRecords.data!.data
  const alertList = activeAlerts.data!.data

  const vehiclesRequiringServiceCount = vehicleList.filter(
    (v) => v.serviceStatus !== 'up_to_date',
  ).length
  const availableDriversCount = driverList.filter((d) => d.status === 'available').length
  const deliveriesDelayedCount = deliveryList.filter((d) => d.status === 'delayed').length

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Vehicles requiring service"
          value={vehiclesRequiringServiceCount}
          icon={Wrench}
        />
        <KPICard label="Available drivers" value={availableDriversCount} icon={UserCheck} />
        <KPICard label="Deliveries delayed" value={deliveriesDelayedCount} icon={AlertTriangle} />
        <KPICard
          label="Deliveries today"
          value={deliveriesToday.data!.total}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <DeliveryStatusChart deliveries={deliveryList} />
        <FleetStatusChart vehicles={vehicleList} />
        <DriverAvailabilityChart drivers={driverList} />
        <ServiceStatusChart serviceRecords={serviceRecordList} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TopAlertsWidget alerts={alertList} />
        <div className="space-y-2 lg:col-span-2">
          <h2 className="text-lg font-medium">Recent activity</h2>
          <ActivityTimeline events={activity.data?.data ?? []} />
        </div>
      </div>
    </div>
  )
}
