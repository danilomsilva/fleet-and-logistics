import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { VehicleFormDialog } from './VehicleFormDialog'

function renderDialog(vehicle?: (typeof db.vehicles)[number]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <VehicleFormDialog onOpenChange={() => {}} vehicle={vehicle} />
    </QueryClientProvider>,
  )
}

describe('VehicleFormDialog', () => {
  it('renders empty fields in create mode', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('renders prefilled fields in edit mode', () => {
    const target = db.vehicles[0]
    renderDialog(target)
    expect(screen.getByRole('heading', { name: `Edit ${target.name}` })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue(target.name)
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderDialog()
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
