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
import { useAlerts } from '../hooks/useAlerts'
import { useUpdateAlertStatus } from '../hooks/useUpdateAlertStatus'
import { createAlertColumns } from './columns'
import { alertPrioritySchema, alertStatusSchema, alertTypeSchema } from '@/mock-api/schemas/alert'

const filtersSchema = z.object({
  status: z.string().optional().default(''),
  type: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  q: z.string().optional().default(''),
})

export function AlertsTable() {
  const { filters, setFilters } = useUrlFilters(filtersSchema)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : undefined

  const { data, isLoading, isError, refetch } = useAlerts({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort,
    status: filters.status || undefined,
    type: filters.type || undefined,
    priority: filters.priority || undefined,
    q: filters.q || undefined,
  })

  const updateStatus = useUpdateAlertStatus()
  const columns = useMemo(() => createAlertColumns(updateStatus), [updateStatus])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search alert messages…"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
          className="max-w-xs"
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
            {alertStatusSchema.options.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters({ type: !value || value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-44" aria-label="Filter by type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {alertTypeSchema.options.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
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
            {alertPrioritySchema.options.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
