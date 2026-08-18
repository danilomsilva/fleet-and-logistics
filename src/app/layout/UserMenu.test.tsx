import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { UserMenu } from './UserMenu'

describe('UserMenu', () => {
  it('shows the current user name and role on the trigger', () => {
    render(<UserMenu />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Dispatch Manager')).toBeInTheDocument()
  })

  it('gives the trigger a concise accessible name', () => {
    render(<UserMenu />)
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
  })

  it('opens the menu with Profile, Settings, and Log out actions', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))

    expect(await screen.findByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<UserMenu />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
