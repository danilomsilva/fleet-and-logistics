import { faker } from '@faker-js/faker'
import type { Delivery, DeliveryStatus } from '../schemas/delivery'
import { deliveryPrioritySchema } from '../schemas/delivery'
import type { Driver } from '../schemas/driver'
import type { Vehicle } from '../schemas/vehicle'
import { irishTownGeoPoint } from './geo'

const ASSIGNED_STATUSES: DeliveryStatus[] = ['in_transit', 'delivered', 'delayed']
// "Currently happening" statuses — the assigned driver/vehicle should reflect
// their actual live status (an offline driver can't be mid-delivery). For
// 'delivered', any driver/vehicle is fine since it's a past, point-in-time event.
const ACTIVE_STATUSES: DeliveryStatus[] = ['in_transit', 'delayed']

function pickActiveDriver(drivers: Driver[]): Driver {
  const pool = drivers.filter((d) => d.status !== 'offline')
  return faker.helpers.arrayElement(pool.length > 0 ? pool : drivers)
}

function pickVehicleFor(driver: Driver, vehicles: Vehicle[]): Vehicle {
  const assigned = driver.assignedVehicleId
    ? vehicles.find((v) => v.id === driver.assignedVehicleId)
    : undefined
  if (assigned) return assigned

  const pool = vehicles.filter((v) => v.status !== 'service' && v.status !== 'broken')
  return faker.helpers.arrayElement(pool.length > 0 ? pool : vehicles)
}

export function generateDeliveries(
  count: number,
  { vehicles, drivers }: { vehicles: Vehicle[]; drivers: Driver[] },
): Delivery[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `DEL-${String(1000 + i)}`
    // 'new' is the only unassigned state — Dispatch exists to move
    // deliveries out of it. Every other status must carry a driver+vehicle.
    const isUnassigned = faker.datatype.boolean({ probability: 0.3 })
    const status: DeliveryStatus = isUnassigned
      ? 'new'
      : faker.helpers.arrayElement<DeliveryStatus>(ASSIGNED_STATUSES)

    const isActive = ACTIVE_STATUSES.includes(status)
    const driver = isUnassigned
      ? null
      : isActive
        ? pickActiveDriver(drivers)
        : faker.helpers.arrayElement(drivers)
    const vehicle = driver
      ? isActive
        ? pickVehicleFor(driver, vehicles)
        : faker.helpers.arrayElement(vehicles)
      : null

    const scheduledTime = faker.date.soon({ days: 14 })

    return {
      id,
      customer: faker.person.fullName(),
      pickup: irishTownGeoPoint(),
      destination: irishTownGeoPoint(),
      driverId: driver?.id ?? null,
      vehicleId: vehicle?.id ?? null,
      requiredVehicleType: 'van',
      priority: faker.helpers.arrayElement(deliveryPrioritySchema.options),
      status,
      eta: status === 'in_transit' ? faker.date.soon({ days: 1 }).toISOString() : null,
      scheduledTime: scheduledTime.toISOString(),
      distanceKm: faker.number.float({ min: 1, max: 120, fractionDigits: 1 }),
      notes: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.sentence() : '',
    }
  })
}
