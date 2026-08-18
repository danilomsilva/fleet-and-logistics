import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

export interface TableRowSkeletonProps {
  columns: number
  rows?: number
}

// aria-hidden: purely decorative placeholder rows, not real data. The
// consuming table (e.g. DataTable) is responsible for announcing the
// loading state itself (e.g. via aria-busy on the table container).
export function TableRowSkeleton({ columns, rows = 5 }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={rowIndex} aria-hidden="true">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <TableCell key={columnIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
