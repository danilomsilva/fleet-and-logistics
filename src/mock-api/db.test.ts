import { describe, expect, it } from 'vitest'
import { createDb } from './db'

describe('createDb', () => {
  it('bidirectionally wires driver <-> vehicle assignment for in-use vehicles', () => {
    const db = createDb()

    const assignedVehicles = db.vehicles.filter((v) => v.driverId !== null)
    expect(assignedVehicles.length).toBeGreaterThan(0)

    for (const vehicle of assignedVehicles) {
      expect(vehicle.status).toBe('in_use')
      const driver = db.drivers.find((d) => d.id === vehicle.driverId)
      expect(driver).toBeDefined()
      expect(driver?.assignedVehicleId).toBe(vehicle.id)
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
    expect(a.vehicles[0].name).not.toBe(b.vehicles[0].name)
  })
})
