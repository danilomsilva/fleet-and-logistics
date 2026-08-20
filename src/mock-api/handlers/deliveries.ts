import { http, HttpResponse } from 'msw'
import { db } from '../db'
import { applyExactFilters, applySort, paginate, parsePageParams, randomDelay } from './query-utils'
import type { Delivery } from '../schemas/delivery'
import { deliveryInputSchema, deliveryStatusSchema } from '../schemas/delivery'
import { distanceKm, townGeoPoint } from '../generators/geo'

function applyDateFilter(items: Delivery[], url: URL): Delivery[] {
  const date = url.searchParams.get('date')
  if (!date) return items
  return items.filter((item) => item.scheduledTime.startsWith(date))
}

function nextDeliveryId(): string {
  const max = db.deliveries.reduce((acc, d) => {
    const n = Number(d.id.replace('DEL-', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 999)
  return `DEL-${max + 1}`
}

/** Combined free-text search across id, customer, and destination — a single
 * search box covers all three rather than splitting destination out into its
 * own filter. */
function applyDeliverySearch(items: Delivery[], url: URL): Delivery[] {
  const query = url.searchParams.get('q')?.trim().toLowerCase()
  if (!query) return items
  return items.filter((item) =>
    [item.id, item.customer, item.destination.label].some((field) =>
      field.toLowerCase().includes(query),
    ),
  )
}

export const deliveryHandlers = [
  http.get('/api/deliveries', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Delivery[] = [...db.deliveries]
    items = applyDeliverySearch(items, url)
    items = applyExactFilters(items, url, ['status', 'priority', 'driverId', 'vehicleId'])
    items = applyDateFilter(items, url)
    items = applySort(items, url, ['scheduledTime', 'priority', 'status', 'distanceKm'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.post('/api/deliveries', async ({ request }) => {
    await randomDelay()
    const body = await request.json()
    const result = deliveryInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid delivery', issues: result.error.issues },
        { status: 400 },
      )
    }

    const input = result.data
    const pickup = townGeoPoint(input.pickup)
    const destination = townGeoPoint(input.destination)
    if (!pickup || !destination) {
      return HttpResponse.json({ message: 'Unknown pickup or destination town' }, { status: 400 })
    }

    const delivery: Delivery = {
      id: nextDeliveryId(),
      customer: input.customer,
      pickup,
      destination,
      driverId: null,
      vehicleId: null,
      requiredVehicleType: input.requiredVehicleType,
      priority: input.priority,
      status: 'new',
      eta: null,
      scheduledTime: new Date(input.scheduledTime).toISOString(),
      distanceKm: distanceKm(pickup, destination),
      notes: input.notes,
    }
    db.deliveries.push(delivery)

    return HttpResponse.json(delivery, { status: 201 })
  }),

  http.get('/api/deliveries/:id', async ({ params }) => {
    await randomDelay()
    const delivery = db.deliveries.find((d) => d.id === params.id)
    if (!delivery) {
      return HttpResponse.json({ message: `Delivery ${params.id} not found` }, { status: 404 })
    }
    return HttpResponse.json(delivery)
  }),

  http.patch('/api/deliveries/:id/status', async ({ params, request }) => {
    await randomDelay()
    const delivery = db.deliveries.find((d) => d.id === params.id)
    if (!delivery) {
      return HttpResponse.json({ message: `Delivery ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = deliveryStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid delivery status' }, { status: 400 })
    }

    delivery.status = result.data

    // Free up the driver/vehicle once the delivery reaches a terminal state
    // (the driver<->vehicle pairing itself stays intact — they're still
    // that driver's regular vehicle, just no longer mid-delivery — only the
    // "actively engaged" status reverts), so they become selectable for the
    // next assignment again.
    if (result.data === 'delivered') {
      const driver = delivery.driverId ? db.drivers.find((d) => d.id === delivery.driverId) : null
      const vehicle = delivery.vehicleId
        ? db.vehicles.find((v) => v.id === delivery.vehicleId)
        : null
      if (driver?.status === 'driving') driver.status = 'available'
      if (vehicle?.status === 'in_use') vehicle.status = 'available'
    }

    return HttpResponse.json(delivery)
  }),
]
