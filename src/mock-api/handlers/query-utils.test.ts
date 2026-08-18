import { describe, expect, it } from 'vitest'
import {
  applyExactFilters,
  applySort,
  applyTextSearch,
  paginate,
  parsePageParams,
} from './query-utils'

interface Item extends Record<string, unknown> {
  id: string
  name: string
  status: string
  score: number
}

const ITEMS: Item[] = [
  { id: '1', name: 'Alpha Truck', status: 'available', score: 30 },
  { id: '2', name: 'Beta Van', status: 'in_use', score: 10 },
  { id: '3', name: 'Gamma Car', status: 'available', score: 20 },
]

describe('parsePageParams', () => {
  it('defaults to page 1 and pageSize 20', () => {
    expect(parsePageParams(new URL('http://x/api/items'))).toEqual({ page: 1, pageSize: 20 })
  })

  it('reads page and pageSize from the query string', () => {
    expect(parsePageParams(new URL('http://x/api/items?page=3&pageSize=5'))).toEqual({
      page: 3,
      pageSize: 5,
    })
  })

  it('clamps invalid values to 1', () => {
    expect(parsePageParams(new URL('http://x/api/items?page=0&pageSize=-5'))).toEqual({
      page: 1,
      pageSize: 1,
    })
  })
})

describe('paginate', () => {
  it('slices items and reports totals', () => {
    const result = paginate(ITEMS, { page: 1, pageSize: 2 })
    expect(result.data.map((i) => i.id)).toEqual(['1', '2'])
    expect(result.total).toBe(3)
    expect(result.totalPages).toBe(2)
  })

  it('returns the remainder on the last page', () => {
    const result = paginate(ITEMS, { page: 2, pageSize: 2 })
    expect(result.data.map((i) => i.id)).toEqual(['3'])
  })
})

describe('applyTextSearch', () => {
  it('is a no-op with no q param', () => {
    expect(applyTextSearch(ITEMS, new URL('http://x/api/items'), ['name'])).toHaveLength(3)
  })

  it('filters case-insensitively across the given fields', () => {
    const result = applyTextSearch(ITEMS, new URL('http://x/api/items?q=van'), ['name'])
    expect(result.map((i) => i.id)).toEqual(['2'])
  })
})

describe('applyExactFilters', () => {
  it('filters on each present query param', () => {
    const result = applyExactFilters(ITEMS, new URL('http://x/api/items?status=available'), [
      'status',
    ])
    expect(result.map((i) => i.id)).toEqual(['1', '3'])
  })

  it('ignores fields not present in the query string', () => {
    expect(applyExactFilters(ITEMS, new URL('http://x/api/items'), ['status'])).toHaveLength(3)
  })
})

describe('applySort', () => {
  it('sorts ascending by the given field', () => {
    const result = applySort(ITEMS, new URL('http://x/api/items?sort=score:asc'), ['score'])
    expect(result.map((i) => i.id)).toEqual(['2', '3', '1'])
  })

  it('sorts descending when direction is desc', () => {
    const result = applySort(ITEMS, new URL('http://x/api/items?sort=score:desc'), ['score'])
    expect(result.map((i) => i.id)).toEqual(['1', '3', '2'])
  })

  it('ignores sort fields not in the allow-list', () => {
    const result = applySort(ITEMS, new URL('http://x/api/items?sort=name:asc'), ['score'])
    expect(result.map((i) => i.id)).toEqual(['1', '2', '3'])
  })
})
