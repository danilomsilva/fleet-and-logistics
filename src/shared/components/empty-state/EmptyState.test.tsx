import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inbox } from 'lucide-react'
import { axe } from 'vitest-axe'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No deliveries" description="Try adjusting your filters." />)
    expect(screen.getByText('No deliveries')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
  })

  it('renders without a description or icon', () => {
    render(<EmptyState title="No deliveries" />)
    expect(screen.getByText('No deliveries')).toBeInTheDocument()
  })

  it('renders and triggers the action when provided', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EmptyState title="No deliveries" action={{ label: 'Clear filters', onClick }} />)

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <EmptyState
        icon={Inbox}
        title="No deliveries"
        description="Try adjusting your filters."
        action={{ label: 'Clear filters', onClick: () => {} }}
      />,
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
