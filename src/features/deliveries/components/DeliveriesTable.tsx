import { useMemo, useState } from 'react'
import { z } from 'zod'
import { XCircle } from 'lucide-react'
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
import { useDeliveries } from '../hooks/useDeliveries'
import { useUpdateDeliveryStatus } from '../hooks/useUpdateDeliveryStatus'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { createDeliveryColumns } from './columns'
import { deliveryPrioritySchema, deliveryStatusSchema } from '@/mock-api/schemas/delivery'

const filtersSchema = z.object({
  status: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  driverId: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  date: z.string().optional().default(''),
  destination: z.string().optional().default(''),
  q: z.string().optional().default(''),
})

export function DeliveriesTable() {
  const { filters, setFilters } = useUrlFilters(filtersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useDeliveries({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    driverId: filters.driverId || undefined,
    vehicleId: filters.vehicleId || undefined,
    date: filters.date || undefined,
    destination: filters.destination || undefined,
    q: filters.q || undefined,
  })

  const { data: driversData } = useDrivers({ pageSize: 200 })
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })

  const driverNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const driver of driversData?.data ?? []) map.set(driver.id, driver.name)
    return map
  }, [driversData])

  const vehicleNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const vehicle of vehiclesData?.data ?? []) map.set(vehicle.id, vehicle.name)
    return map
  }, [vehiclesData])

  const columns = useMemo(
    () => createDeliveryColumns(driverNameById, vehicleNameById),
    [driverNameById, vehicleNameById],
  )

  const updateStatus = useUpdateDeliveryStatus()
  const bulkActions: BulkAction[] = [
    {
      label: 'Cancel selected',
      icon: XCircle,
      variant: 'destructive',
      onClick: async (selectedIds) => {
        await Promise.all(
          selectedIds.map((id) => updateStatus.mutateAsync({ id, status: 'cancelled' })),
        )
        toast.success(`${selectedIds.length} delivery(ies) cancelled.`)
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search deliveries…"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          className="max-w-xs"
        />
        <Input
          placeholder="Destination…"
          value={filters.destination}
          onChange={(e) => setFilters({ destination: e.target.value })}
          className="max-w-40"
        />
        <Input
          type="date"
          aria-label="Filter by scheduled date"
          value={filters.date}
          onChange={(e) => setFilters({ date: e.target.value })}
          className="w-40"
        />
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ status: !value || value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {deliveryStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            setFilters({ priority: !value || value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {deliveryPrioritySchema.options.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.driverId || 'all'}
          onValueChange={(value) =>
            setFilters({ driverId: !value || value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by driver">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All drivers</SelectItem>
            {driversData?.data.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.vehicleId || 'all'}
          onValueChange={(value) =>
            setFilters({ vehicleId: !value || value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by vehicle">
            <SelectValue placeholder="Vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All vehicles</SelectItem>
            {vehiclesData?.data.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        bulkActions={bulkActions}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No deliveries found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  )
}
