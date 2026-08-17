import { faker } from '@faker-js/faker'
import { generateActivityEvents } from './generators/activity'
import { generateAlerts } from './generators/alerts'
import { generateDeliveries } from './generators/deliveries'
import { generateDrivers } from './generators/drivers'
import { generateMaintenanceRecords } from './generators/maintenance'
import { generateVehicles } from './generators/vehicles'

const DEFAULT_SEED = 20260817

const COUNTS = {
  vehicles: 24,
  drivers: 18,
  deliveries: 60,
  maintenanceRecords: 16,
  alerts: 20,
  activity: 50,
} as const

/** Assigns drivers to in-use vehicles, wiring both sides of the relationship. */
function assignDriversToVehicles(
  vehicles: ReturnType<typeof generateVehicles>,
  drivers: ReturnType<typeof generateDrivers>,
) {
  const assignablePool = drivers.filter((driver) => driver.status !== 'offline')
  let poolIndex = 0

  for (const vehicle of vehicles) {
    if (vehicle.status !== 'in_use') continue
    if (poolIndex >= assignablePool.length) break

    const driver = assignablePool[poolIndex]
    vehicle.driverId = driver.id
    driver.assignedVehicleId = vehicle.id
    poolIndex++
  }
}

export function createDb(seed: number = DEFAULT_SEED) {
  faker.seed(seed)

  const vehicles = generateVehicles(COUNTS.vehicles)
  const drivers = generateDrivers(COUNTS.drivers)
  assignDriversToVehicles(vehicles, drivers)

  const deliveries = generateDeliveries(COUNTS.deliveries, { vehicles, drivers })
  const maintenanceRecords = generateMaintenanceRecords(COUNTS.maintenanceRecords, { vehicles })
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
