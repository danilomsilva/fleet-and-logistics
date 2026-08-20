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
  deliveries: 25,
  serviceRecords: 10,
  alerts: { delivery: 5, fleet: 5 },
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

const MIN_AVAILABLE_DRIVERS = 3

/**
 * Driver status and vehicle status are otherwise independently randomized,
 * so a driver being 'available' doesn't mean their own vehicle is too — and
 * only that combination is actually assignable to a delivery. Forces at
 * least MIN_AVAILABLE_DRIVERS such pairs, skipping vehicles already flagged
 * broken/service so it doesn't undo that seeding.
 */
function ensureMinimumAvailableDrivers(
  vehicles: ReturnType<typeof generateVehicles>,
  drivers: ReturnType<typeof generateDrivers>,
) {
  const regularVehicleIds = new Set(
    vehicles.filter((v) => v.status === 'available' || v.status === 'in_use').map((v) => v.id),
  )
  const candidates = faker.helpers.shuffle(
    drivers.filter((d) => d.assignedVehicleId && regularVehicleIds.has(d.assignedVehicleId)),
  )
  for (const driver of candidates.slice(0, MIN_AVAILABLE_DRIVERS)) {
    driver.status = 'available'
    const vehicle = vehicles.find((v) => v.id === driver.assignedVehicleId)
    if (vehicle) vehicle.status = 'available'
  }
}

/**
 * A vehicle's 'in_use' status and its driver's 'driving' status are two sides
 * of the same fact, but both are independently randomized by the generators
 * above — this reconciles every pair afterwards, trusting the vehicle's
 * status (which carries the more deliberate seeding) as the source of truth.
 * Mirrors the same rule the mutation handlers enforce at runtime.
 */
function syncDrivingStatus(
  vehicles: ReturnType<typeof generateVehicles>,
  drivers: ReturnType<typeof generateDrivers>,
) {
  for (const vehicle of vehicles) {
    if (!vehicle.driverId) continue
    const driver = drivers.find((d) => d.id === vehicle.driverId)
    if (!driver) continue

    if (vehicle.status === 'in_use') {
      driver.status = 'driving'
    } else if (driver.status === 'driving') {
      driver.status = 'available'
    }
  }
}

export function createDb(seed: number = DEFAULT_SEED) {
  faker.seed(seed)

  const vehicles = generateVehicles(COUNTS.vehicles)
  const drivers = generateDrivers(COUNTS.drivers)
  assignDriversToVehicles(vehicles, drivers)
  ensureMinimumAvailableDrivers(vehicles, drivers)
  syncDrivingStatus(vehicles, drivers)

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
