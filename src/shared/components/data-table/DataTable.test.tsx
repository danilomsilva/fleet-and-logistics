import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createColumnHelper } from '@tanstack/react-table'
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
