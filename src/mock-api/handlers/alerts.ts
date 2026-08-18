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
import type { Alert } from '../schemas/alert'
import { alertStatusSchema } from '../schemas/alert'

export const alertHandlers = [
  http.get('/api/alerts', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: Alert[] = [...db.alerts]
    items = applyTextSearch(items, url, ['message'])
    items = applyExactFilters(items, url, ['status', 'type', 'priority'])
    items = applySort(items, url, ['timestamp', 'priority'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.get('/api/alerts/:id', async ({ params }) => {
    await randomDelay()
    const alert = db.alerts.find((a) => a.id === params.id)
    if (!alert) {
      return HttpResponse.json({ message: `Alert ${params.id} not found` }, { status: 404 })
    }
    return HttpResponse.json(alert)
  }),

  // Stub: updates status only. Full acknowledge/resolve wiring lands in step 9.2.
  http.patch('/api/alerts/:id', async ({ params, request }) => {
    await randomDelay()
    const alert = db.alerts.find((a) => a.id === params.id)
    if (!alert) {
      return HttpResponse.json({ message: `Alert ${params.id} not found` }, { status: 404 })
    }

    const body = await request.json()
    const result = alertStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid alert status' }, { status: 400 })
    }

    alert.status = result.data
    return HttpResponse.json(alert)
  }),
]
