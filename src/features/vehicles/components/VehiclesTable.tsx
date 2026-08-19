import { useMemo, useState } from 'react'
import { z } from 'zod'
import { CircleCheck, PowerOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable, type BulkAction } from '@/shared/components/data-table/DataTable'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useVehicles } from '../hooks/useVehicles'
import { useUpdateVehicleStatus } from '../hooks/useUpdateVehicleStatus'
import { useDeleteVehicle } from '../hooks/useDeleteVehicle'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { createVehicleColumns } from './columns'
import { vehicleStatusSchema, vehicleTypeSchema } from '@/mock-api/schemas/vehicle'

const filtersSchema = z.object({
  status: z.string().optional().default(''),
  type: z.string().optional().default(''),
  q: z.string().optional().default(''),
})

export function VehiclesTable() {
  const { filters, setFilters } = useUrlFilters(filtersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

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
      label: 'Mark offline',
      icon: PowerOff,
      onClick: async (selectedIds) => {
        await Promise.all(
          selectedIds.map((id) => updateStatus.mutateAsync({ id, status: 'offline' })),
        )
        toast.success(`${selectedIds.length} vehicle(s) marked offline.`)
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
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search vehicles…"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          className="max-w-xs"
        />
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ status: !value || value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {vehicleStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters({ type: !value || value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-40" aria-label="Filter by type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {vehicleTypeSchema.options.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
