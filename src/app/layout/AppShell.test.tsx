import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { axe } from 'vitest-axe'
import { AppShell } from './AppShell'
import { useSidebarDrawerStore } from './sidebar-store'

function renderShell(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="vehicles" element={<h1>Vehicles content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  beforeEach(() => {
    useSidebarDrawerStore.setState({ isOpen: false })
  })

  it('renders the Sidebar nav, Topbar, and the matched route via Outlet', () => {
    renderShell('/vehicles')

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vehicles content' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderShell('/vehicles')
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
