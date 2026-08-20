import { describe, expect, it } from 'vitest'
import { getEntityPath } from './entity-routes'

describe('getEntityPath', () => {
  it.each([
    ['vehicle', 'VH-001', '/vehicles/VH-001'],
    ['driver', 'DRV-001', '/drivers/DRV-001'],
    ['delivery', 'DEL-1000', '/deliveries/DEL-1000'],
    ['service', 'SVC-001', '/services/SVC-001'],
  ] as const)('maps %s -> %s', (kind, id, expected) => {
    expect(getEntityPath({ kind, id })).toBe(expected)
  })

  it('routes alerts to the alerts list, not a per-alert detail page', () => {
    expect(getEntityPath({ kind: 'alert', id: 'ALT-001' })).toBe('/alerts')
  })
})
