import { useParams } from 'react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { useDriver } from './hooks/useDriver'
import {
  DriverActivityTab,
  DriverDeliveryHistoryTab,
  DriverOverviewTab,
  DriverTodaysDeliveriesTab,
} from './components/DriverDetailTabs'

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: driver, isLoading, isError, refetch } = useDriver(id ?? '')

  if (isLoading) return <DetailPageSkeleton label="Loading driver" />
  if (isError || !driver) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load driver" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{driver.name}</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="today">Today's deliveries</TabsTrigger>
          <TabsTrigger value="history">Delivery history</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <DriverOverviewTab driver={driver} />
        </TabsContent>
        <TabsContent value="today">
          <DriverTodaysDeliveriesTab driver={driver} />
        </TabsContent>
        <TabsContent value="history">
          <DriverDeliveryHistoryTab driver={driver} />
        </TabsContent>
        <TabsContent value="activity">
          <DriverActivityTab driver={driver} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
