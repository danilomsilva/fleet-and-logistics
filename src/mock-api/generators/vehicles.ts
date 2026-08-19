import { faker } from '@faker-js/faker'
import type { Vehicle } from '../schemas/vehicle'
import {
  vehicleMaintenanceStatusSchema,
  vehicleStatusSchema,
  vehicleTypeSchema,
} from '../schemas/vehicle'
import { irishGeoPoint } from './geo'

export function generateVehicles(count: number): Vehicle[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `VH-${String(i + 1).padStart(3, '0')}`
    const hasUpcomingService = faker.datatype.boolean({ probability: 0.85 })

    return {
      id,
      name: `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`,
      registration: faker.vehicle.vrm(),
      type: faker.helpers.arrayElement(vehicleTypeSchema.options),
      status: faker.helpers.arrayElement(vehicleStatusSchema.options),
      driverId: null,
      location: irishGeoPoint(),
      mileage: faker.number.int({ min: 1_000, max: 150_000 }),
      nextServiceDate: hasUpcomingService ? faker.date.soon({ days: 60 }).toISOString() : null,
      maintenanceStatus: faker.helpers.arrayElement(vehicleMaintenanceStatusSchema.options),
      lastUpdatedAt: faker.date.recent({ days: 7 }).toISOString(),
    }
  })
}
