import { faker } from '@faker-js/faker'
import { generateActivityEvents } from './generators/activity'
import { generateAlerts } from './generators/alerts'
import { generateDeliveries } from './generators/deliveries'
import { generateDrivers } from './generators/drivers'
import { generateMaintenanceRecords } from './generators/maintenance'
import { generateVehicles } from './generators/vehicles'
import { computeVehicleMaintenanceStatus } from './maintenance-status'

const DEFAULT_SEED = 20260817

const COUNTS = {
  vehicles: 10,
  drivers: 10,
  deliveries: 60,
  maintenanceRecords: 10,
  alerts: 20,
  activity: 50,
} as const

/**
 * Pairs every driver with a distinct vehicle 1:1, wiring both sides of the
 * relationship — every driver must have an assigned vehicle, which as a side
 * effect also covers in-use/maintenance vehicles needing a driver. Requires
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
  const maintenanceRecords = generateMaintenanceRecords(COUNTS.maintenanceRecords, { vehicles })
  for (const vehicle of vehicles) {
    vehicle.maintenanceStatus = computeVehicleMaintenanceStatus(vehicle)
  }
  const alerts = generateAlerts(COUNTS.alerts, {
    vehicles,
    drivers,
    deliveries,
    maintenanceRecords,
  })
  const activity = generateActivityEvents(COUNTS.activity, {
    vehicles,
    drivers,
    deliveries,
    maintenanceRecords,
    alerts,
  })

  return { vehicles, drivers, deliveries, maintenanceRecords, alerts, activity }
}

export type Db = ReturnType<typeof createDb>

/** Shared mutable in-memory store consumed by MSW handlers. */
export const db = createDb()
