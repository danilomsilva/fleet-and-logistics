import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { z } from 'zod'
import { useUrlFilters } from './use-url-filters'

const testSchema = z.object({
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  q: z.string().optional().default(''),
})

function renderWithRouter(initialPath = '/') {
  return renderHook(() => useUrlFilters(testSchema), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    ),
  })
}

describe('useUrlFilters', () => {
  it('defaults to the schema defaults when the URL has no params', () => {
    const { result } = renderWithRouter('/')
    expect(result.current.filters).toEqual({ status: 'all', q: '' })
  })

  it('reads existing filters from the URL', () => {
    const { result } = renderWithRouter('/?status=active&q=truck')
    expect(result.current.filters).toEqual({ status: 'active', q: 'truck' })
  })

  it('falls back to defaults when a param fails validation', () => {
    const { result } = renderWithRouter('/?status=not-a-real-status')
    expect(result.current.filters).toEqual({ status: 'all', q: '' })
  })

  it('setFilters updates the URL and the returned filters', () => {
    const { result } = renderWithRouter('/')

    act(() => {
      result.current.setFilters({ status: 'active' })
    })

    expect(result.current.filters.status).toBe('active')
  })

  it('setFilters with an empty string removes that param', () => {
    const { result } = renderWithRouter('/?status=active&q=truck')

    act(() => {
      result.current.setFilters({ q: '' })
    })

    expect(result.current.filters).toEqual({ status: 'active', q: '' })
  })

  it('resetFilters clears all schema-related params', () => {
    const { result } = renderWithRouter('/?status=active&q=truck')

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters).toEqual({ status: 'all', q: '' })
  })
})
