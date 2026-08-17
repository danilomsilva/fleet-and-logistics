import { delay } from 'msw'

const DEFAULT_PAGE_SIZE = 20

export interface PageParams {
  page: number
  pageSize: number
}

export function parsePageParams(url: URL): PageParams {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(url.searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE)
  return { page, pageSize }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function paginate<T>(items: T[], { page, pageSize }: PageParams): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export function applyTextSearch<T extends Record<string, unknown>>(
  items: T[],
  url: URL,
  fields: (keyof T)[],
): T[] {
  const query = url.searchParams.get('q')?.trim().toLowerCase()
  if (!query) return items

  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? '')
        .toLowerCase()
        .includes(query),
    ),
  )
}

export function applyExactFilters<T extends Record<string, unknown>>(
  items: T[],
  url: URL,
  fields: (keyof T & string)[],
): T[] {
  return fields.reduce((acc, field) => {
    const value = url.searchParams.get(field)
    if (value === null) return acc
    return acc.filter((item) => String(item[field]) === value)
  }, items)
}

export function applySort<T extends Record<string, unknown>>(
  items: T[],
  url: URL,
  allowedFields: (keyof T & string)[],
): T[] {
  const sort = url.searchParams.get('sort')
  if (!sort) return items

  const [field, direction] = sort.split(':') as [string, 'asc' | 'desc' | undefined]
  if (!allowedFields.includes(field as keyof T & string)) return items

  const sorted = [...items].sort((a, b) => {
    const av = a[field as keyof T]
    const bv = b[field as keyof T]
    if (av === bv) return 0
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    return av > bv ? 1 : -1
  })

  return direction === 'desc' ? sorted.reverse() : sorted
}

/** Simulated network latency so loading states are real, not instant. */
export function randomDelay() {
  return delay(150 + Math.random() * 450)
}
