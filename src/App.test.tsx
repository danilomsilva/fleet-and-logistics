import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import App from './App'

describe('App', () => {
  it('renders the FleetOS heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'FleetOS' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
