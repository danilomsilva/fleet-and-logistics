import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'
import { Topbar } from './Topbar'
import { useSidebarDrawerStore } from './sidebar-store'

function renderShell() {
  return render(
    <MemoryRouter>
      <Topbar onMenuClick={() => useSidebarDrawerStore.getState().toggle()} />
      <MobileSidebarDrawer />
    </MemoryRouter>,
  )
}

describe('MobileSidebarDrawer + Topbar wiring', () => {
  beforeEach(() => {
    useSidebarDrawerStore.setState({ isOpen: false })
  })

  it('is closed by default', () => {
    renderShell()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('opens the drawer and shows nav links when the Topbar menu button is clicked', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))

    expect(await screen.findByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(useSidebarDrawerStore.getState().isOpen).toBe(true)
  })

  it('closes the drawer via its close button', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await screen.findByRole('link', { name: 'Dashboard' })

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(useSidebarDrawerStore.getState().isOpen).toBe(false)
  })

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup()
    const { container } = renderShell()

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))
    await screen.findByRole('link', { name: 'Dashboard' })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
