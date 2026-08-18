import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Table, TableBody } from '@/components/ui/table'
import { TableRowSkeleton } from './TableRowSkeleton'

function renderInTable(columns: number, rows?: number) {
  return render(
    <Table>
      <TableBody>
        <TableRowSkeleton columns={columns} rows={rows} />
      </TableBody>
    </Table>,
  )
}

describe('TableRowSkeleton', () => {
  it('renders the default 5 rows', () => {
    const { container } = renderInTable(4)
    expect(container.querySelectorAll('tr')).toHaveLength(5)
  })

  it('renders the requested number of rows and columns', () => {
    const { container } = renderInTable(3, 2)
    const rows = container.querySelectorAll('tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].querySelectorAll('td')).toHaveLength(3)
  })

  it('hides the decorative rows from assistive tech', () => {
    const { container } = renderInTable(2, 1)
    expect(container.querySelector('tr')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderInTable(3)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
