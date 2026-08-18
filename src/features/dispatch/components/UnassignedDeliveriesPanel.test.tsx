import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { UnassignedDeliveriesPanel } from './UnassignedDeliveriesPanel'

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UnassignedDeliveriesPanel />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UnassignedDeliveriesPanel', () => {
  it('loads and lists pending deliveries with an Assign action', async () => {
    renderPanel()
    expect(await screen.findAllByRole('button', { name: 'Assign' })).not.toHaveLength(0)
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const { container } = renderPanel()
    await screen.findAllByRole('button', { name: 'Assign' })
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
