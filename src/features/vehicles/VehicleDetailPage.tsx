import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useVehicle } from './hooks/useVehicle'
import { useDeleteVehicle } from './hooks/useDeleteVehicle'
import { VehicleFormDialog } from './components/VehicleFormDialog'
import {
  VehicleActivityTab,
  VehicleDeliveryHistoryTab,
  VehicleServiceTab,
  VehicleOverviewTab,
} from './components/VehicleDetailTabs'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id ?? '')
  const deleteVehicle = useDeleteVehicle()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) return <DetailPageSkeleton label="Loading vehicle" />
  if (isError || !vehicle) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load vehicle" onRetry={() => refetch()} />
      </div>
    )
  }

  function handleDelete() {
    deleteVehicle.mutate(vehicle!.id, {
      onSuccess: () => {
        toast.success(`${vehicle!.name} removed from the fleet.`)
        navigate('/vehicles')
      },
      onError: () => toast.error("Couldn't delete the vehicle. Please try again."),
    })
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{vehicle.name}</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery history</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <VehicleOverviewTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="service">
          <VehicleServiceTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="deliveries">
          <VehicleDeliveryHistoryTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="activity">
          <VehicleActivityTab vehicle={vehicle} />
        </TabsContent>
      </Tabs>

      {editOpen && <VehicleFormDialog onOpenChange={setEditOpen} vehicle={vehicle} />}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${vehicle.name}?`}
        description="This removes the vehicle from the fleet. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteVehicle.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
