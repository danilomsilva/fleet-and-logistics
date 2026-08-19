import { beforeEach, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { irishGeoPoint } from './geo'

beforeEach(() => {
  faker.seed(1)
})

describe('irishGeoPoint', () => {
  it('generates coordinates within Ireland for every call', () => {
    for (let i = 0; i < 100; i++) {
      const point = irishGeoPoint()
      expect(point.lat).toBeGreaterThanOrEqual(51.45)
      expect(point.lat).toBeLessThanOrEqual(55.35)
      expect(point.lng).toBeGreaterThanOrEqual(-10.5)
      expect(point.lng).toBeLessThanOrEqual(-6.0)
    }
  })
})
