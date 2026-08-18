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
import { useVehicles } from '../hooks/useVehicles'
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
          <SelectTrigger className="w-40">
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
          <SelectTrigger className="w-40">
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
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No vehicles found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  )
}
