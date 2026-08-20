import { useMemo, useState } from 'react'
import { AlertTriangle, CircleCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable, type BulkAction } from '@/shared/components/data-table/DataTable'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useVehicles } from '../hooks/useVehicles'
import { useUpdateVehicleStatus } from '../hooks/useUpdateVehicleStatus'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { createVehicleColumns } from './columns'
import { vehiclesFiltersSchema } from '../vehicles-filters'

export function VehiclesTable() {
  const { filters } = useUrlFilters(vehiclesFiltersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useVehicles({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    type: filters.type || undefined,
    q: filters.q || undefined,
  })

  const { data: driversData } = useDrivers({ pageSize: 200 })
  const driverNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const driver of driversData?.data ?? []) map.set(driver.id, driver.name)
    return map
  }, [driversData])

  const columns = useMemo(() => createVehicleColumns(driverNameById), [driverNameById])

  const updateStatus = useUpdateVehicleStatus()
  const deleteVehicle = useDeleteVehicle()
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)

  const bulkActions: BulkAction[] = [
    {
      label: 'Mark broken',
      icon: AlertTriangle,
      onClick: async (selectedIds) => {
        await Promise.all(
          selectedIds.map((id) => updateStatus.mutateAsync({ id, status: 'broken' })),
        )
        toast.success(`${selectedIds.length} vehicle(s) marked broken.`)
        setRowSelection({})
      },
    },
    {
      label: 'Mark available',
      icon: CircleCheck,
      onClick: async (selectedIds) => {
        await Promise.all(
          selectedIds.map((id) => updateStatus.mutateAsync({ id, status: 'available' })),
        )
        toast.success(`${selectedIds.length} vehicle(s) marked available.`)
        setRowSelection({})
      },
    },
    {
      label: 'Delete selected',
      icon: Trash2,
      variant: 'destructive',
      onClick: (selectedIds) => setPendingDeleteIds(selectedIds),
    },
  ]

  async function handleConfirmDelete() {
    if (!pendingDeleteIds) return
    await Promise.all(pendingDeleteIds.map((id) => deleteVehicle.mutateAsync(id)))
    toast.success(`${pendingDeleteIds.length} vehicle(s) deleted.`)
    setPendingDeleteIds(null)
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(v) => v.id}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={data?.total}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        bulkActions={bulkActions}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No vehicles found"
        emptyDescription="Try adjusting your search or filters."
      />

      <ConfirmDialog
        open={!!pendingDeleteIds}
        onOpenChange={(open) => !open && setPendingDeleteIds(null)}
        title={`Delete ${pendingDeleteIds?.length ?? 0} vehicle(s)?`}
        description="This removes them from the fleet. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteVehicle.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
