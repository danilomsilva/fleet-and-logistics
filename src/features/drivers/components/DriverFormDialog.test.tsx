import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { DriverFormDialog } from './DriverFormDialog'

function renderDialog(driver?: (typeof db.drivers)[number]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <DriverFormDialog onOpenChange={() => {}} driver={driver} />
    </QueryClientProvider>,
  )
}

describe('DriverFormDialog', () => {
  it('renders empty fields in create mode', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: 'Add Driver' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('renders prefilled fields in edit mode', () => {
    const target = db.drivers[0]
    renderDialog(target)
    expect(screen.getByRole('heading', { name: `Edit ${target.name}` })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue(target.name)
  })

  it('locks status to Available in create mode, but lets it be changed when editing', () => {
    renderDialog()
    expect(screen.getByText(/New drivers start as Available/)).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Driver status' })).not.toBeInTheDocument()

    const target = db.drivers[0]
    renderDialog(target)
    expect(screen.getByRole('combobox', { name: 'Driver status' })).toBeInTheDocument()
  })

  it('does not require a vehicle to be assigned', () => {
    renderDialog()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Driver' } })
    expect(screen.getByRole('button', { name: 'Add Driver' })).toBeEnabled()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderDialog()
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
