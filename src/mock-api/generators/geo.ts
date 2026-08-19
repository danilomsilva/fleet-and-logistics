import { faker } from '@faker-js/faker'
import type { GeoPoint } from '../schemas/common'

// Approximate bounding box for the island of Ireland, so every vehicle and
// delivery location on the Dispatch map falls within Ireland.
const IRELAND_BOUNDS = { latMin: 51.45, latMax: 55.35, lngMin: -10.5, lngMax: -6.0 }

export function irishGeoPoint(): GeoPoint {
  return {
    lat: faker.location.latitude({ min: IRELAND_BOUNDS.latMin, max: IRELAND_BOUNDS.latMax }),
    lng: faker.location.longitude({ min: IRELAND_BOUNDS.lngMin, max: IRELAND_BOUNDS.lngMax }),
    label: faker.location.streetAddress(),
  }
}
