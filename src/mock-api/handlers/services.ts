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
import type { ServiceRecord } from '../schemas/service'
import { serviceInputSchema, serviceStatusSchema } from '../schemas/service'
import { computeServiceRecordStatus, computeVehicleServiceStatus } from '../service-status'

function applyDateFilter(items: ServiceRecord[], url: URL): ServiceRecord[] {
  const date = url.searchParams.get('date')
  if (!date) return items
  return items.filter((item) => item.scheduledDate.startsWith(date))
}

function nextServiceId(): string {
  const max = db.serviceRecords.reduce((acc, m) => {
    const n = Number(m.id.replace('SVC-', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `SVC-${String(max + 1).padStart(3, '0')}`
}

export const serviceHandlers = [
  http.get('/api/services', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    let items: ServiceRecord[] = [...db.serviceRecords]
    items = applyTextSearch(items, url, ['description'])
    items = applyExactFilters(items, url, ['status', 'vehicleId', 'serviceType', 'priority'])
    items = applyDateFilter(items, url)
    items = applySort(items, url, ['scheduledDate', 'priority', 'mileage'])

    return HttpResponse.json(paginate(items, parsePageParams(url)))
  }),

  http.get('/api/services/:id', async ({ params }) => {
    await randomDelay()
    const record = db.serviceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Service record ${params.id} not found` },
        { status: 404 },
      )
    }
    return HttpResponse.json(record)
  }),

  http.post('/api/services', async ({ request }) => {
    await randomDelay()
    const body = await request.json()
    const result = serviceInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid service record', issues: result.error.issues },
        { status: 400 },
      )
    }

    const input = result.data
    const record: ServiceRecord = {
      id: nextServiceId(),
      vehicleId: input.vehicleId,
      serviceType: input.serviceType,
      status: 'scheduled',
      priority: input.priority,
      description: input.description,
      scheduledDate: input.scheduledDate,
      completionDate: null,
      mileage: input.mileage,
      notes: input.notes,
    }
    record.status = computeServiceRecordStatus(record)
    db.serviceRecords.push(record)

    return HttpResponse.json(record, { status: 201 })
  }),

  http.patch('/api/services/:id', async ({ params, request }) => {
    await randomDelay()
    const record = db.serviceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Service record ${params.id} not found` },
        { status: 404 },
      )
    }

    const body = await request.json()
    const result = serviceInputSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: 'Invalid service record', issues: result.error.issues },
        { status: 400 },
      )
    }

    Object.assign(record, result.data)
    record.status = computeServiceRecordStatus(record)

    return HttpResponse.json(record)
  }),

  http.delete('/api/services/:id', async ({ params }) => {
    await randomDelay()
    const index = db.serviceRecords.findIndex((m) => m.id === params.id)
    if (index === -1) {
      return HttpResponse.json(
        { message: `Service record ${params.id} not found` },
        { status: 404 },
      )
    }

    db.serviceRecords.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch('/api/services/:id/status', async ({ params, request }) => {
    await randomDelay()
    const record = db.serviceRecords.find((m) => m.id === params.id)
    if (!record) {
      return HttpResponse.json(
        { message: `Service record ${params.id} not found` },
        { status: 404 },
      )
    }

    const body = await request.json()
    const result = serviceStatusSchema.safeParse((body as { status?: unknown })?.status)
    if (!result.success) {
      return HttpResponse.json({ message: 'Invalid service status' }, { status: 400 })
    }

    const vehicle = db.vehicles.find((v) => v.id === record.vehicleId)
    if (result.data === 'in_progress' && vehicle && !vehicle.driverId) {
      return HttpResponse.json(
        { message: 'Assign a driver to this vehicle before starting service' },
        { status: 400 },
      )
    }

    record.status = result.data
    record.completionDate = result.data === 'completed' ? new Date().toISOString() : null

    if (vehicle) {
      if (result.data === 'in_progress') {
        vehicle.status = 'service'
      } else if (result.data === 'completed') {
        if (vehicle.status === 'service') vehicle.status = 'available'
        const nextServiceDate = new Date()
        nextServiceDate.setDate(nextServiceDate.getDate() + 90)
        vehicle.nextServiceDate = nextServiceDate.toISOString()
      }
      vehicle.serviceStatus = computeVehicleServiceStatus(vehicle)
    }

    return HttpResponse.json(record)
  }),
]
