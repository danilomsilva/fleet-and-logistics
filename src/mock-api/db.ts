import { faker } from '@faker-js/faker'
import { generateActivityEvents } from './generators/activity'
import { generateAlerts } from './generators/alerts'
import { generateDeliveries } from './generators/deliveries'
import { generateDrivers } from './generators/drivers'
import { generateServiceRecords } from './generators/services'
import { generateVehicles } from './generators/vehicles'
import { computeVehicleServiceStatus } from './service-status'

const DEFAULT_SEED = 20260817

const COUNTS = {
  vehicles: 10,
  drivers: 10,
  deliveries: 60,
  serviceRecords: 10,
  alerts: 20,
  activity: 50,
} as const

/**
 * Pairs every driver with a distinct vehicle 1:1, wiring both sides of the
 * relationship — every driver must have an assigned vehicle, which as a side
 * effect also covers in-use/service vehicles needing a driver. Requires
 * COUNTS.drivers === COUNTS.vehicles.
 */
function assignDriversToVehicles(
  vehicles: ReturnType<typeof generateVehicles>,
  drivers: ReturnType<typeof generateDrivers>,
) {
  const shuffledVehicles = faker.helpers.shuffle([...vehicles])
  drivers.forEach((driver, i) => {
    const vehicle = shuffledVehicles[i]
    driver.assignedVehicleId = vehicle.id
    vehicle.driverId = driver.id
  })
}

export function createDb(seed: number = DEFAULT_SEED) {
  faker.seed(seed)

  const vehicles = generateVehicles(COUNTS.vehicles)
  const drivers = generateDrivers(COUNTS.drivers)
  assignDriversToVehicles(vehicles, drivers)

  const deliveries = generateDeliveries(COUNTS.deliveries, { vehicles, drivers })
  const serviceRecords = generateServiceRecords(COUNTS.serviceRecords, { vehicles })
  for (const vehicle of vehicles) {
    vehicle.serviceStatus = computeVehicleServiceStatus(vehicle)
  }
  const alerts = generateAlerts(COUNTS.alerts, {
    vehicles,
    drivers,
    deliveries,
    serviceRecords,
  })
  const activity = generateActivityEvents(COUNTS.activity, {
    vehicles,
    drivers,
    deliveries,
    serviceRecords,
    alerts,
  })

  return { vehicles, drivers, deliveries, serviceRecords, alerts, activity }
}

export type Db = ReturnType<typeof createDb>

/** Shared mutable in-memory store consumed by MSW handlers. */
export const db = createDb()
