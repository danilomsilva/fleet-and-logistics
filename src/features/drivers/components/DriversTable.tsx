import { useMemo, useState } from 'react'
import { CircleCheck, PowerOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable, type BulkAction } from '@/shared/components/data-table/DataTable'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useDrivers } from '../hooks/useDrivers'
import { useUpdateDriverStatus } from '../hooks/useUpdateDriverStatus'
import { useDeleteDriver } from '../hooks/useDeleteDriver'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { createDriverColumns } from './columns'
import { driversFiltersSchema } from '../drivers-filters'

export function DriversTable() {
  const { filters } = useUrlFilters(driversFiltersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useDrivers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    q: filters.q || undefined,
  })

  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const vehicleNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const vehicle of vehiclesData?.data ?? []) map.set(vehicle.id, vehicle.name)
    return map
  }, [vehiclesData])

  const columns = useMemo(() => createDriverColumns(vehicleNameById), [vehicleNameById])

  const updateStatus = useUpdateDriverStatus()
  const deleteDriver = useDeleteDriver()
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)

  const bulkActions: BulkAction[] = [
    {
      label: 'Mark not available',
      icon: PowerOff,
      onClick: async (selectedIds) => {
        await Promise.all(
          selectedIds.map((id) => updateStatus.mutateAsync({ id, status: 'offline' })),
        )
        toast.success(`${selectedIds.length} driver(s) marked not available.`)
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
        toast.success(`${selectedIds.length} driver(s) marked available.`)
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
    await Promise.all(pendingDeleteIds.map((id) => deleteDriver.mutateAsync(id)))
    toast.success(`${pendingDeleteIds.length} driver(s) deleted.`)
    setPendingDeleteIds(null)
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(d) => d.id}
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
        emptyTitle="No drivers found"
        emptyDescription="Try adjusting your search or filters."
      />

      <ConfirmDialog
        open={!!pendingDeleteIds}
        onOpenChange={(open) => !open && setPendingDeleteIds(null)}
        title={`Delete ${pendingDeleteIds?.length ?? 0} driver(s)?`}
        description="This removes them from the roster. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteDriver.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
