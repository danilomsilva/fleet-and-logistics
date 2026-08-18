import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  it('renders the app name', () => {
    render(<Topbar isOpen={false} onMenuClick={() => {}} />)
    expect(screen.getByText('FleetOS')).toBeInTheDocument()
  })

  it('calls onMenuClick when the menu button is pressed', async () => {
    const user = userEvent.setup()
    const onMenuClick = vi.fn()
    render(<Topbar isOpen={false} onMenuClick={onMenuClick} />)

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it('reflects isOpen via aria-expanded and points aria-controls at the drawer', () => {
    const { rerender } = render(<Topbar isOpen={false} onMenuClick={() => {}} />)
    const button = screen.getByRole('button', { name: /open navigation menu/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls', 'mobile-sidebar-drawer')

    rerender(<Topbar isOpen={true} onMenuClick={() => {}} />)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Topbar isOpen={false} onMenuClick={() => {}} />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
