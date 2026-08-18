import { useMemo } from 'react'
import {
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  type LucideIcon,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState, type EmptyStateAction } from '@/shared/components/empty-state/EmptyState'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { TableRowSkeleton } from '@/shared/components/skeletons/TableRowSkeleton'
import { dataTableFeatures } from './data-table-features'

export interface BulkAction {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'destructive'
  onClick: (selectedIds: string[]) => void
}

export interface DataTableProps<TData extends RowData> {
  // The value-type parameter is intentionally `any` — a column array mixes
  // columns with different TValues, matching TanStack's own
  // ColumnHelper.columns() constraint.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<typeof dataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** Omit to render without pagination controls (e.g. a small embedded table). */
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  /** Total row count across all pages, for the page-count/next-page math. */
  rowCount?: number
  /** Adds a selection checkbox column and, when rows are selected, a bulk-action bar. */
  enableRowSelection?: boolean
  bulkActions?: BulkAction[]
  /** Renders skeleton rows in place of data. Takes priority over error/empty. */
  isLoading?: boolean
  /** Renders an ErrorState in place of data. Takes priority over empty. */
  isError?: boolean
  onRetry?: () => void
  errorTitle?: string
  errorDescription?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: EmptyStateAction
}

const ARIA_SORT = {
  asc: 'ascending',
  desc: 'descending',
} as const

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 }

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sorting = [],
  onSortingChange,
  pagination = DEFAULT_PAGINATION,
  onPaginationChange,
  rowCount,
  enableRowSelection = false,
  bulkActions,
  isLoading = false,
  isError = false,
  onRetry,
  errorTitle,
  errorDescription,
  emptyTitle = 'No results',
  emptyDescription,
  emptyAction,
}: DataTableProps<TData>) {
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<typeof dataTableFeatures, TData> = {
      id: 'select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={!table.getIsAllRowsSelected() && table.getIsSomeRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllRowsSelected(checked === true)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(_checked, eventDetails) =>
            row.getToggleSelectedHandler()(eventDetails.event)
          }
          aria-label="Select row"
        />
      ),
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data,
    getRowId,
    enableRowSelection,
    manualSorting: true,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange?.(next)
    },
    manualPagination: true,
    rowCount,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      onPaginationChange?.(next)
    },
  })

  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide())
  const selectedIds = enableRowSelection ? table.getSelectedRowIds() : []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          {enableRowSelection && bulkActions && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{selectedIds.length} selected</p>
              {bulkActions.map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  onClick={() => action.onClick(selectedIds)}
                >
                  {action.icon && <action.icon aria-hidden="true" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {hideableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <SlidersHorizontal aria-hidden="true" />
                  Columns
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={() => column.toggleVisibility()}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDirection = header.column.getIsSorted()

                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      canSort ? (sortDirection ? ARIA_SORT[sortDirection] : 'none') : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 font-medium hover:text-foreground"
                      >
                        <table.FlexRender header={header} />
                        {sortDirection === 'asc' && (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                        )}
                        {sortDirection === 'desc' && (
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        )}
                        {!sortDirection && (
                          <ChevronsUpDown
                            aria-hidden="true"
                            className="size-3.5 text-muted-foreground/50"
                          />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRowSkeleton columns={table.getVisibleFlatColumns().length} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={table.getVisibleFlatColumns().length}>
                <ErrorState
                  title={errorTitle}
                  description={errorDescription}
                  onRetry={onRetry ?? (() => {})}
                />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={table.getVisibleFlatColumns().length}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {onPaginationChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
