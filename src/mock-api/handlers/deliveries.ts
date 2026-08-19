import { http, HttpResponse } from 'msw'
import { db } from '../db'
import {
  applyExactFilters,
  applySort,
  applyTextSearch,
  paginate,
  parsePageParams,
  randomDelay,
} from './query-utils'
import type { Delivery } from '../schemas/delivery'
import { deliveryStatusSchema } from '../schemas/delivery'

function applyDateFilter(items: Delivery[], url: URL): Delivery[] {
  const date = url.searchParams.get('date')
  if (!date) return items
  return items.filter((item) => item.scheduledTime.startsWith(date))
}

function applyDestinationFilter(items: Delivery[], url: URL): Delivery[] {
  const destination = url.searchParams.get('destination')?.trim().toLowerCase()
  if (!destination) return items
  return items.filter((item) => item.destination.label.toLowerCase().includes(destination))
}

export const deliveryHandlers = [
  http.get('/api/deliveries', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Delivery[] = [...db.deliveries]
    items = applyTextSearch(items, url, ['id', 'customer'])
    items = applyExactFilters(items, url, ['status', 'priority', 'driverId', 'vehicleId'])
    items = applyDateFilter(items, url)
    items = applyDestinationFilter(items, url)
    items = applySort(items, url, ['scheduledTime', 'priority', 'status', 'distanceKm'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
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
    if (result.data === 'delivered' || result.data === 'cancelled') {
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
