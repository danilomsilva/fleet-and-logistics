import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Topbar } from './Topbar'

describe('Topbar', () => {
  it('renders the app name', () => {
    render(<Topbar onMenuClick={() => {}} />)
    expect(screen.getByText('FleetOS')).toBeInTheDocument()
  })

  it('calls onMenuClick when the menu button is pressed', async () => {
    const user = userEvent.setup()
    const onMenuClick = vi.fn()
    render(<Topbar onMenuClick={onMenuClick} />)

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Topbar onMenuClick={() => {}} />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
