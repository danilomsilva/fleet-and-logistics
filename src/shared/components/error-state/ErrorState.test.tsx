import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders default title/description and a role="alert" region', () => {
    render(<ErrorState onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom title/description/retryLabel', () => {
    render(
      <ErrorState
        title="Couldn't load vehicles"
        description="Check your connection."
        retryLabel="Try again"
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText("Couldn't load vehicles")).toBeInTheDocument()
    expect(screen.getByText('Check your connection.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('calls onRetry when the retry button is pressed', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ErrorState onRetry={() => {}} />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
