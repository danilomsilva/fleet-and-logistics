import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { randomDelay } from './query-utils'

interface AssignRequestBody {
  deliveryId?: unknown
  driverId?: unknown
  vehicleId?: unknown
}

export const dispatchHandlers = [
  http.post('/api/dispatch/assign', async ({ request }) => {
    await randomDelay()
    const body = (await request.json()) as AssignRequestBody

    if (
      typeof body.deliveryId !== 'string' ||
      typeof body.driverId !== 'string' ||
      typeof body.vehicleId !== 'string'
    ) {
      return HttpResponse.json(
        { message: 'deliveryId, driverId, and vehicleId are required' },
        { status: 400 },
      )
    }

    const delivery = db.deliveries.find((d) => d.id === body.deliveryId)
    const driver = db.drivers.find((d) => d.id === body.driverId)
    const vehicle = db.vehicles.find((v) => v.id === body.vehicleId)

    if (!delivery || !driver || !vehicle) {
      return HttpResponse.json(
        { message: 'Delivery, driver, or vehicle not found' },
        { status: 404 },
      )
    }

    delivery.driverId = driver.id
    delivery.vehicleId = vehicle.id
    if (delivery.status === 'pending') {
      delivery.status = 'assigned'
    }

    // Keep the driver<->vehicle pairing consistent on both sides, freeing up
    // whichever vehicle/driver each was previously linked to. Without this,
    // the assignment only showed up on the delivery itself — the driver's
    // and vehicle's own detail pages still showed "unassigned", and the
    // driver stayed selectable as "available" for a second delivery at the
    // same time.
    if (driver.assignedVehicleId && driver.assignedVehicleId !== vehicle.id) {
      const previousVehicle = db.vehicles.find((v) => v.id === driver.assignedVehicleId)
      if (previousVehicle && previousVehicle.driverId === driver.id) {
        previousVehicle.driverId = null
      }
    }
    if (vehicle.driverId && vehicle.driverId !== driver.id) {
      const previousDriver = db.drivers.find((d) => d.id === vehicle.driverId)
      if (previousDriver && previousDriver.assignedVehicleId === vehicle.id) {
        previousDriver.assignedVehicleId = null
      }
    }
    driver.assignedVehicleId = vehicle.id
    vehicle.driverId = driver.id
    driver.status = 'driving'
    vehicle.status = 'in_use'

    return HttpResponse.json(delivery)
  }),
]
