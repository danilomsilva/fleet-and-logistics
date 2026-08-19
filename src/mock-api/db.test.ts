import { describe, expect, it } from 'vitest'
import { createDb } from './db'

describe('createDb', () => {
  it('bidirectionally wires driver <-> vehicle assignment for every driver', () => {
    const db = createDb()

    expect(db.drivers.every((d) => d.assignedVehicleId !== null)).toBe(true)
    expect(db.vehicles.every((v) => v.driverId !== null)).toBe(true)

    for (const driver of db.drivers) {
      const vehicle = db.vehicles.find((v) => v.id === driver.assignedVehicleId)
      expect(vehicle).toBeDefined()
      expect(vehicle?.driverId).toBe(driver.id)
    }
  })

  it('is deterministic for the same seed (identity, relationships, and content — not wall-clock-derived timestamps)', () => {
    const a = createDb(42)
    const b = createDb(42)

    expect(a.vehicles.map((v) => v.id)).toEqual(b.vehicles.map((v) => v.id))
    expect(a.vehicles.map((v) => v.name)).toEqual(b.vehicles.map((v) => v.name))
    expect(a.vehicles.map((v) => v.driverId)).toEqual(b.vehicles.map((v) => v.driverId))

    const stableFields = (delivery: (typeof a.deliveries)[number]) => ({
      id: delivery.id,
      customer: delivery.customer,
      driverId: delivery.driverId,
      vehicleId: delivery.vehicleId,
      status: delivery.status,
      priority: delivery.priority,
    })
    expect(stableFields(a.deliveries[0])).toEqual(stableFields(b.deliveries[0]))
  })

  it('produces different data for different seeds', () => {
    const a = createDb(1)
    const b = createDb(2)
    expect(a.vehicles[0].registration).not.toBe(b.vehicles[0].registration)
  })
})
