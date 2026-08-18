import { useParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { useVehicle } from './hooks/useVehicle'
import {
  VehicleActivityTab,
  VehicleDeliveryHistoryTab,
  VehicleMaintenanceTab,
  VehicleOverviewTab,
} from './components/VehicleDetailTabs'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id ?? '')

  if (isLoading) return <DetailPageSkeleton label="Loading vehicle" />
  if (isError || !vehicle) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load vehicle" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{vehicle.name}</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery history</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <VehicleOverviewTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="maintenance">
          <VehicleMaintenanceTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="deliveries">
          <VehicleDeliveryHistoryTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="activity">
          <VehicleActivityTab vehicle={vehicle} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
