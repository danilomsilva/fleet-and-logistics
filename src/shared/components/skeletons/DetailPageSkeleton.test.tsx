import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { DetailPageSkeleton } from './DetailPageSkeleton'

describe('DetailPageSkeleton', () => {
  it('exposes a status region with a default loading label', () => {
    render(<DetailPageSkeleton />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('accepts a custom label', () => {
    render(<DetailPageSkeleton label="Loading vehicle" />)
    expect(screen.getByRole('status', { name: 'Loading vehicle' })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<DetailPageSkeleton />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
