import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { randomDelay } from './query-utils'

interface AssignRequestBody {
  deliveryId?: unknown
  driverId?: unknown
  vehicleId?: unknown
}

// Stub: assigns driver/vehicle to a delivery. Full conflict-prevention wiring
// (checking driver/vehicle availability, moving between unassigned/active
// schedule) lands in step 10.10.
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

    return HttpResponse.json(delivery)
  }),
]
