import { faker } from '@faker-js/faker'
import type { Delivery, DeliveryStatus } from '../schemas/delivery'
import { deliveryPrioritySchema } from '../schemas/delivery'
import type { Driver } from '../schemas/driver'
import type { Vehicle } from '../schemas/vehicle'
import { vehicleTypeSchema } from '../schemas/vehicle'

const ASSIGNED_STATUSES: DeliveryStatus[] = ['assigned', 'in_transit', 'delivered', 'delayed']

export function generateDeliveries(
  count: number,
  { vehicles, drivers }: { vehicles: Vehicle[]; drivers: Driver[] },
): Delivery[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `DEL-${String(1000 + i)}`
    const isUnassigned = faker.datatype.boolean({ probability: 0.3 })
    const status: DeliveryStatus = isUnassigned
      ? 'pending'
      : faker.helpers.arrayElement<DeliveryStatus>([...ASSIGNED_STATUSES, 'cancelled'])

    const driver =
      !isUnassigned && status !== 'cancelled' ? faker.helpers.arrayElement(drivers) : null
    const vehicle =
      !isUnassigned && status !== 'cancelled' ? faker.helpers.arrayElement(vehicles) : null

    const scheduledTime = faker.date.soon({ days: 14 })

    return {
      id,
      customer: faker.person.fullName(),
      pickup: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        label: faker.location.streetAddress(),
      },
      destination: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        label: faker.location.streetAddress(),
      },
      driverId: driver?.id ?? null,
      vehicleId: vehicle?.id ?? null,
      requiredVehicleType: faker.helpers.arrayElement(vehicleTypeSchema.options),
      priority: faker.helpers.arrayElement(deliveryPrioritySchema.options),
      status,
      eta: status === 'in_transit' ? faker.date.soon({ days: 1 }).toISOString() : null,
      scheduledTime: scheduledTime.toISOString(),
      distanceKm: faker.number.float({ min: 1, max: 120, fractionDigits: 1 }),
      notes: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.sentence() : '',
    }
  })
}
