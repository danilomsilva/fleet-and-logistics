import { useMemo, useState } from 'react'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { useMaintenanceRecords } from '../hooks/useMaintenanceRecords'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { createMaintenanceColumns } from './columns'
import { maintenanceFiltersSchema } from '../maintenance-filters'

export function MaintenanceTable() {
  const { filters } = useUrlFilters(maintenanceFiltersSchema)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useMaintenanceRecords({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    vehicleId: filters.vehicleId || undefined,
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
