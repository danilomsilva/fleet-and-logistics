import { useMemo, useState } from 'react'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { useServiceRecords } from '../hooks/useServiceRecords'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { createServiceColumns } from './columns'
import { serviceFiltersSchema } from '../services-filters'

export function ServicesTable() {
  const { filters } = useUrlFilters(serviceFiltersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useServiceRecords({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    vehicleId: filters.vehicleId || undefined,
    q: filters.q || undefined,
  })

  const { data: vehiclesData } = useVehicles({ pageSize: 200 })

  const vehicleById = useMemo(() => {
    const map = new Map<string, { name: string; registration: string }>()
    for (const vehicle of vehiclesData?.data ?? [])
      map.set(vehicle.id, { name: vehicle.name, registration: vehicle.registration })
    return map
  }, [vehiclesData])

  const columns = useMemo(() => createServiceColumns(vehicleById), [vehicleById])

  return (
    <div className="space-y-4">
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
        emptyTitle="No service records found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  )
}
