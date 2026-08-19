import { useMemo, useState } from 'react'
import {
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type RowSelectionState,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  /** Controlled selection state — pass both to clear selection after a bulk action completes. */
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void
  /** Shows the "Columns" visibility-toggle dropdown. Off by default. */
  showColumnToggle?: boolean
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

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 25 }

const PAGE_SIZE_OPTIONS = [10, 25, 50]
const PAGE_SIZE_ITEMS = Object.fromEntries(PAGE_SIZE_OPTIONS.map((size) => [size, String(size)]))

const MAX_VISIBLE_PAGES = 5

/** Up to `MAX_VISIBLE_PAGES` consecutive page indices, centered on the current page. */
function getVisiblePageIndices(currentPageIndex: number, pageCount: number): number[] {
  if (pageCount <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }
  let start = Math.max(0, currentPageIndex - Math.floor(MAX_VISIBLE_PAGES / 2))
  const end = Math.min(pageCount - 1, start + MAX_VISIBLE_PAGES - 1)
  start = Math.max(0, end - MAX_VISIBLE_PAGES + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

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
  rowSelection: rowSelectionProp,
  onRowSelectionChange: onRowSelectionChangeProp,
  showColumnToggle = false,
  isLoading = false,
  isError = false,
  onRetry,
  errorTitle,
  errorDescription,
  emptyTitle = 'No results',
  emptyDescription,
  emptyAction,
}: DataTableProps<TData>) {
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const rowSelection = rowSelectionProp ?? internalRowSelection

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
    state: { sorting, pagination, rowSelection },
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
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      if (onRowSelectionChangeProp) onRowSelectionChangeProp(next)
      else setInternalRowSelection(next)
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
        {showColumnToggle && hideableColumns.length > 0 && (
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
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        )}
                        {sortDirection === 'desc' && (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground shrink-0">
            Page {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </p>
          <div className="flex flex-1 items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            {getVisiblePageIndices(pagination.pageIndex, table.getPageCount()).map((pageIndex) => (
              <Button
                key={pageIndex}
                variant={pageIndex === pagination.pageIndex ? 'default' : 'outline'}
                size="sm"
                className="w-8 px-0"
                aria-current={pageIndex === pagination.pageIndex ? 'page' : undefined}
                onClick={() => onPaginationChange({ ...pagination, pageIndex })}
              >
                {pageIndex + 1}
              </Button>
            ))}
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
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Per page</span>
            <Select
              items={PAGE_SIZE_ITEMS}
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                onPaginationChange({ pageIndex: 0, pageSize: Number(value) })
              }
            >
              <SelectTrigger className="w-[4.5rem]" size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
