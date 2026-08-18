import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { z, ZodObject, ZodRawShape } from 'zod'

/**
 * Syncs a filter object to the URL's search params, validated by a zod
 * schema. Every field should be `.optional()` (a param may be absent) with
 * a sensible `.default(...)` — zod fills in defaults on parse, so an empty
 * or malformed URL still yields a valid `filters` object.
 *
 * Required by spec section 6 ("Filters should be reflected in the URL so
 * the current view can be bookmarked/shared"), reused across Vehicles/
 * Drivers/Deliveries/Maintenance/Alerts for consistency.
 */
export function useUrlFilters<Shape extends ZodRawShape>(schema: ZodObject<Shape>) {
  const [searchParams, setSearchParams] = useSearchParams()
  type Filters = z.infer<typeof schema>

  const filters = useMemo<Filters>(() => {
    const raw: Record<string, string> = {}
    for (const key of Object.keys(schema.shape)) {
      const value = searchParams.get(key)
      if (value !== null) raw[key] = value
    }
    const result = schema.safeParse(raw)
    return result.success ? result.data : schema.parse({})
  }, [searchParams, schema])

  function setFilters(updates: Partial<Filters>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    }
    setSearchParams(next)
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams)
    for (const key of Object.keys(schema.shape)) {
      next.delete(key)
    }
    setSearchParams(next)
  }

  return { filters, setFilters, resetFilters }
}
