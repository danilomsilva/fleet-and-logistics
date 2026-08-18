import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { axe } from 'vitest-axe'
import { Sidebar } from './Sidebar'
import { navItems } from './nav-items'

function renderSidebar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders a link for every nav item', () => {
    renderSidebar('/')
    for (const item of navItems) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }
  })

  it('marks the active route with aria-current', () => {
    renderSidebar('/vehicles')
    expect(screen.getByRole('link', { name: 'Vehicles' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('treats the dashboard link as exact-match only', () => {
    renderSidebar('/vehicles')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = renderSidebar('/')
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
