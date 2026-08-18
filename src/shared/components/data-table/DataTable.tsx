import { useTable, type ColumnDef, type RowData, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dataTableFeatures } from './data-table-features'

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
}

const ARIA_SORT = {
  asc: 'ascending',
  desc: 'descending',
} as const

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  sorting = [],
  onSortingChange,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    manualSorting: true,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange?.(next)
    },
  })

  return (
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
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
