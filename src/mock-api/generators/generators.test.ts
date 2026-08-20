import { beforeEach, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { generateVehicles } from './vehicles'
import { generateDrivers } from './drivers'
import { generateDeliveries } from './deliveries'
import { generateServiceRecords } from './services'
import { generateAlerts } from './alerts'
import { generateActivityEvents } from './activity'
import { vehicleStatusSchema } from '../schemas/vehicle'
import { driverShiftSchema, driverStatusSchema } from '../schemas/driver'

beforeEach(() => {
  faker.seed(1)
})

describe('generateVehicles', () => {
  it('produces the requested count with valid statuses and null driverId', () => {
    const vehicles = generateVehicles(10)
    expect(vehicles).toHaveLength(10)
    for (const vehicle of vehicles) {
      expect(vehicleStatusSchema.options).toContain(vehicle.status)
      expect(vehicle.driverId).toBeNull()
      expect(vehicle.id).toMatch(/^VH-\d{3}$/)
    }
  })
})

describe('generateDrivers', () => {
  it('produces the requested count with valid statuses and null assignedVehicleId', () => {
    const drivers = generateDrivers(10)
    expect(drivers).toHaveLength(10)
    for (const driver of drivers) {
      expect(driverStatusSchema.options).toContain(driver.status)
      expect(driver.assignedVehicleId).toBeNull()
      expect(driver.id).toMatch(/^DRV-\d{3}$/)
    }
  })

  it('always sets a valid shift, regardless of status', () => {
    const drivers = generateDrivers(50)
    for (const driver of drivers) {
      expect(driverShiftSchema.options).toContain(driver.availability.shift)
    }
  })
})

describe('generateDeliveries', () => {
  it('produces some unassigned deliveries and only references known drivers/vehicles', () => {
    const vehicles = generateVehicles(10)
    const drivers = generateDrivers(10)
    const deliveries = generateDeliveries(40, { vehicles, drivers })

    expect(deliveries).toHaveLength(40)
    expect(deliveries.some((d) => d.driverId === null)).toBe(true)
    expect(deliveries.every((d) => d.status === 'new' || (d.driverId && d.vehicleId))).toBe(true)

    for (const delivery of deliveries) {
      if (delivery.driverId) {
        expect(drivers.map((d) => d.id)).toContain(delivery.driverId)
      }
      if (delivery.vehicleId) {
        expect(vehicles.map((v) => v.id)).toContain(delivery.vehicleId)
      }
    }
  })

  it('never assigns an offline driver to a currently-active delivery', () => {
    const vehicles = generateVehicles(10)
    const drivers = generateDrivers(10)
    const deliveries = generateDeliveries(60, { vehicles, drivers })

    const activeStatuses = ['in_transit', 'delayed']
    const activeDeliveries = deliveries.filter((d) => activeStatuses.includes(d.status))
    expect(activeDeliveries.length).toBeGreaterThan(0)

    for (const delivery of activeDeliveries) {
      const driver = drivers.find((d) => d.id === delivery.driverId)
      expect(driver).toBeDefined()
      expect(driver?.status).not.toBe('offline')
    }
  })
})

describe('generateServiceRecords', () => {
  it('only references known vehicles and nulls completionDate unless completed', () => {
    const vehicles = generateVehicles(5)
    const records = generateServiceRecords(20, { vehicles })

    expect(records).toHaveLength(20)
    for (const record of records) {
      expect(vehicles.map((v) => v.id)).toContain(record.vehicleId)
      if (record.status === 'completed') {
        expect(record.completionDate).not.toBeNull()
      } else {
        expect(record.completionDate).toBeNull()
      }
    }
  })
})

describe('generateAlerts', () => {
  it('resolves a relatedEntity of the correct kind for every alert type', () => {
    const vehicles = generateVehicles(5)
    const drivers = generateDrivers(5)
    const deliveries = generateDeliveries(10, { vehicles, drivers })
    const serviceRecords = generateServiceRecords(5, { vehicles })
    const alerts = generateAlerts(
      { delivery: 10, fleet: 10 },
      { vehicles, drivers, deliveries, serviceRecords },
    )

    expect(alerts).toHaveLength(20)
    const expectedKind = {
      vehicle_service_due: 'service',
      delivery_delayed: 'delivery',
      assignment_conflict: 'delivery',
      driver_unavailable: 'driver',
      vehicle_offline: 'vehicle',
    } as const

    for (const alert of alerts) {
      expect(alert.relatedEntity.kind).toBe(expectedKind[alert.type])
    }
  })
})

describe('generateActivityEvents', () => {
  it('resolves a relatedEntity of the correct kind for every event type', () => {
    const vehicles = generateVehicles(5)
    const drivers = generateDrivers(5)
    const deliveries = generateDeliveries(10, { vehicles, drivers })
    const serviceRecords = generateServiceRecords(5, { vehicles })
    const alerts = generateAlerts(
      { delivery: 3, fleet: 2 },
      { vehicles, drivers, deliveries, serviceRecords },
    )
    const activity = generateActivityEvents(30, {
      vehicles,
      drivers,
      deliveries,
      serviceRecords,
      alerts,
    })

    // 30 random (non-delivery) events plus a deterministic per-delivery trail.
    expect(activity.length).toBeGreaterThan(30)
    for (const event of activity) {
      expect(event.type).toBeTruthy()
      expect(event.relatedEntity.id).toBeTruthy()
    }
  })

  it('gives every delivery a full history through to its current status', () => {
    const vehicles = generateVehicles(10)
    const drivers = generateDrivers(10)
    const deliveries = generateDeliveries(40, { vehicles, drivers })
    const serviceRecords = generateServiceRecords(5, { vehicles })
    const alerts = generateAlerts(
      { delivery: 3, fleet: 2 },
      { vehicles, drivers, deliveries, serviceRecords },
    )
    const activity = generateActivityEvents(0, {
      vehicles,
      drivers,
      deliveries,
      serviceRecords,
      alerts,
    })

    for (const delivery of deliveries) {
      const trail = activity.filter(
        (e) => e.relatedEntity.kind === 'delivery' && e.relatedEntity.id === delivery.id,
      )
      const types = trail.map((e) => e.type)

      expect(types).toContain('delivery_created')
      if (delivery.status !== 'new') expect(types).toContain('delivery_assigned')
      if (delivery.status === 'delivered') expect(types).toContain('delivery_delivered')
      if (delivery.status === 'delayed') expect(types).toContain('delivery_delayed')

      const timestamps = trail.map((e) => new Date(e.timestamp).getTime())
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b))
    }
  })
})
