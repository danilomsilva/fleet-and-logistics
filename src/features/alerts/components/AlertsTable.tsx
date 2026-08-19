import { useMemo, useState } from 'react'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { useAlerts } from '../hooks/useAlerts'
import { useUpdateAlertStatus } from '../hooks/useUpdateAlertStatus'
import { createAlertColumns } from './columns'
import { alertsFiltersSchema } from '../alerts-filters'

export interface AlertsTableProps {
  category?: string
}

export function AlertsTable({ category = '' }: AlertsTableProps) {
  const { filters } = useUrlFilters(alertsFiltersSchema)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useAlerts({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    type: filters.type || undefined,
    priority: filters.priority || undefined,
    category,
    q: filters.q || undefined,
  })

  const updateStatus = useUpdateAlertStatus()
  const columns = useMemo(() => createAlertColumns(updateStatus), [updateStatus])

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(a) => a.id}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={data?.total}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No alerts found"
        emptyDescription="Try adjusting your search or filters."
      />
    </div>
  )
}
