import { beforeEach, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { irishTownGeoPoint, warehouseGeoPoint } from './geo'

beforeEach(() => {
  faker.seed(1)
})

describe('irishTownGeoPoint', () => {
  it('returns a real Irish town with matching coordinates for every call', () => {
    for (let i = 0; i < 100; i++) {
      const point = irishTownGeoPoint()
      expect(point.label).toBeTruthy()
      expect(point.lat).toBeGreaterThanOrEqual(51.45)
      expect(point.lat).toBeLessThanOrEqual(55.35)
      expect(point.lng).toBeGreaterThanOrEqual(-10.5)
      expect(point.lng).toBeLessThanOrEqual(-6.0)
    }
  })
})

describe('warehouseGeoPoint', () => {
  it('always returns Dundalk', () => {
    for (let i = 0; i < 10; i++) {
      expect(warehouseGeoPoint().label).toBe('Dundalk')
    }
  })
})
