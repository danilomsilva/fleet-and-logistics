import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useDriver } from './hooks/useDriver'
import { useDeleteDriver } from './hooks/useDeleteDriver'
import { DriverFormDialog } from './components/DriverFormDialog'
import {
  DriverActivityTab,
  DriverDeliveryHistoryTab,
  DriverOverviewTab,
  DriverTodaysDeliveriesTab,
} from './components/DriverDetailTabs'

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: driver, isLoading, isError, refetch } = useDriver(id ?? '')
  const deleteDriver = useDeleteDriver()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) return <DetailPageSkeleton label="Loading driver" />
  if (isError || !driver) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load driver" onRetry={() => refetch()} />
      </div>
    )
  }

  function handleDelete() {
    deleteDriver.mutate(driver!.id, {
      onSuccess: () => {
        toast.success(`${driver!.name} removed.`)
        navigate('/drivers')
      },
      onError: () => toast.error("Couldn't delete the driver. Please try again."),
    })
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{driver.name}</h1>
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

      {editOpen && <DriverFormDialog onOpenChange={setEditOpen} driver={driver} />}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${driver.name}?`}
        description="This removes the driver from the roster. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteDriver.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
