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
]
