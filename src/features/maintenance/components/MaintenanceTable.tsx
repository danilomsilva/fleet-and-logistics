import { useMemo, useState } from 'react'
import { z } from 'zod'
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
import { DataTable } from '@/shared/components/data-table/DataTable'
import { useMaintenanceRecords } from '../hooks/useMaintenanceRecords'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { createMaintenanceColumns } from './columns'
import { maintenancePrioritySchema, maintenanceStatusSchema } from '@/mock-api/schemas/maintenance'

const filtersSchema = z.object({
  status: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  date: z.string().optional().default(''),
  q: z.string().optional().default(''),
})

export function MaintenanceTable() {
  const { filters, setFilters } = useUrlFilters(filtersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useMaintenanceRecords({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    vehicleId: filters.vehicleId || undefined,
    date: filters.date || undefined,
    q: filters.q || undefined,
  })

  const { data: vehiclesData } = useVehicles({ pageSize: 200 })

  const vehicleNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const vehicle of vehiclesData?.data ?? []) map.set(vehicle.id, vehicle.name)
    return map
  }, [vehiclesData])

  const columns = useMemo(() => createMaintenanceColumns(vehicleNameById), [vehicleNameById])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search descriptions…"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          className="max-w-xs"
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
            {maintenanceStatusSchema.options.map((status) => (
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
            {maintenancePrioritySchema.options.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
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
        getRowId={(m) => m.id}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={data?.total}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No maintenance records found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  )
}
