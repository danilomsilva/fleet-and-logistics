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

  it('closes the drawer when the viewport crosses into desktop width', () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined
    const originalMatchMedia = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          changeListener = listener
        },
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList

    try {
      useSidebarDrawerStore.setState({ isOpen: true })
      renderShell('/vehicles')

      expect(useSidebarDrawerStore.getState().isOpen).toBe(true)
      changeListener?.({ matches: true } as MediaQueryListEvent)
      expect(useSidebarDrawerStore.getState().isOpen).toBe(false)
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('has a skip link pointing at the focusable main content region', () => {
    renderShell('/vehicles')

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toHaveAttribute('href', '#main-content')

    const main = document.getElementById('main-content')
    expect(main).not.toBeNull()
    expect(main).toHaveAttribute('tabindex', '-1')
  })
})
