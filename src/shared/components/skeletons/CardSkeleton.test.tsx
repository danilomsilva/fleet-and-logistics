import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { CardSkeleton } from './CardSkeleton'

describe('CardSkeleton', () => {
  it('exposes a status region with a default loading label', () => {
    render(<CardSkeleton />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('accepts a custom label', () => {
    render(<CardSkeleton label="Loading KPI" />)
    expect(screen.getByRole('status', { name: 'Loading KPI' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<CardSkeleton />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
