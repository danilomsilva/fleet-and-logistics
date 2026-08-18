import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createColumnHelper } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { axe } from 'vitest-axe'
import { DataTable } from './DataTable'
import { dataTableFeatures } from './data-table-features'

interface Vehicle {
  id: string
  name: string
  mileage: number
}

const VEHICLES: Vehicle[] = [
  { id: 'VH-001', name: 'Ford Transit', mileage: 42000 },
  { id: 'VH-002', name: 'Toyota Hilux', mileage: 18000 },
]

const helper = createColumnHelper<typeof dataTableFeatures, Vehicle>()
const columns = [
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('mileage', { header: 'Mileage' }),
  helper.accessor('id', { header: 'ID', enableSorting: false }),
]

describe('DataTable', () => {
  it('renders headers and every row', () => {
    render(<DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />)

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByText('Ford Transit')).toBeInTheDocument()
    expect(screen.getByText('Toyota Hilux')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3) // 1 header + 2 data rows
  })

  it('renders a sort toggle only for sortable columns', () => {
    render(<DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />)

    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mileage/i })).toBeInTheDocument()
    // The ID column has enableSorting: false — its header has no button.
    const idHeader = screen.getByRole('columnheader', { name: 'ID' })
    expect(idHeader.querySelector('button')).not.toBeInTheDocument()
  })

  it('calls onSortingChange when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSortingChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        sorting={[]}
        onSortingChange={onSortingChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /name/i }))

    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
  })

  it('reflects the current sort via aria-sort', () => {
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        sorting={[{ id: 'mileage', desc: true }]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: /mileage/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'none')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})

describe('DataTable pagination', () => {
  it('renders no pagination controls when onPaginationChange is not provided', () => {
    render(<DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />)
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('shows the current page and total page count', () => {
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        pagination={{ pageIndex: 1, pageSize: 20 }}
        onPaginationChange={() => {}}
        rowCount={60}
      />,
    )
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last page', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        pagination={{ pageIndex: 0, pageSize: 20 }}
        onPaginationChange={() => {}}
        rowCount={40}
      />,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()

    rerender(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        pagination={{ pageIndex: 1, pageSize: 20 }}
        onPaginationChange={() => {}}
        rowCount={40}
      />,
    )
    expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onPaginationChange with the next page index when Next is clicked', async () => {
    const user = userEvent.setup()
    const onPaginationChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        pagination={{ pageIndex: 0, pageSize: 20 }}
        onPaginationChange={onPaginationChange}
        rowCount={60}
      />,
    )

    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 })
  })
})

describe('DataTable column visibility', () => {
  it('hides a column when it is toggled off, and shows it again when toggled back on', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />)

    expect(screen.getByRole('columnheader', { name: 'Mileage' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /columns/i }))
    const checkbox = await screen.findByRole('menuitemcheckbox', { name: 'Mileage' })
    await user.click(checkbox)

    expect(screen.queryByRole('columnheader', { name: 'Mileage' })).not.toBeInTheDocument()
    expect(screen.queryByText('42000')).not.toBeInTheDocument()

    // Selecting a checkbox item keeps the menu open (onSelect preventDefault),
    // so the same checkbox can be clicked again to toggle it back on.
    await user.click(checkbox)

    expect(screen.getByRole('columnheader', { name: 'Mileage' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations with the columns menu open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />,
    )

    await user.click(screen.getByRole('button', { name: /columns/i }))
    await screen.findByRole('menuitemcheckbox', { name: 'Mileage' })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})

describe('DataTable row selection', () => {
  const bulkActions = [
    { label: 'Delete', icon: Trash2, variant: 'destructive' as const, onClick: vi.fn() },
  ]

  it('renders no selection checkboxes when enableRowSelection is false', () => {
    render(<DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} />)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('renders a select-all checkbox and one per row when enabled', () => {
    render(
      <DataTable columns={columns} data={VEHICLES} getRowId={(v) => v.id} enableRowSelection />,
    )
    expect(screen.getByRole('checkbox', { name: /select all rows/i })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox', { name: /select row/i })).toHaveLength(2)
  })

  it('does not show the bulk-action bar until a row is selected', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        enableRowSelection
        bulkActions={bulkActions}
      />,
    )
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('checkbox', { name: /select row/i })[0])

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('selecting all rows checks the header checkbox and updates the count', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        enableRowSelection
        bulkActions={bulkActions}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: /select all rows/i }))

    expect(screen.getByText('2 selected')).toBeInTheDocument()
    for (const checkbox of screen.getAllByRole('checkbox', { name: /select row/i })) {
      expect(checkbox).toBeChecked()
    }
  })

  it('calls the bulk action with the selected row ids', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        enableRowSelection
        bulkActions={[{ label: 'Delete', onClick }]}
      />,
    )

    await user.click(screen.getAllByRole('checkbox', { name: /select row/i })[1])
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onClick).toHaveBeenCalledWith(['VH-002'])
  })

  it('has no detectable accessibility violations with selection enabled', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DataTable
        columns={columns}
        data={VEHICLES}
        getRowId={(v) => v.id}
        enableRowSelection
        bulkActions={bulkActions}
      />,
    )

    await user.click(screen.getAllByRole('checkbox', { name: /select row/i })[0])

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
