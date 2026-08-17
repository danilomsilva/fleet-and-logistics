import { z } from 'zod'
import { geoPointSchema } from './common'

export const vehicleStatusSchema = z.enum(['available', 'in_use', 'maintenance', 'offline'])
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

export const vehicleTypeSchema = z.enum(['van', 'truck', 'car', 'motorcycle'])
export type VehicleType = z.infer<typeof vehicleTypeSchema>

export const vehicleMaintenanceStatusSchema = z.enum(['up_to_date', 'due_soon', 'overdue'])
export type VehicleMaintenanceStatus = z.infer<typeof vehicleMaintenanceStatusSchema>

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  registration: z.string(),
  type: vehicleTypeSchema,
  status: vehicleStatusSchema,
  driverId: z.string().nullable(),
  location: geoPointSchema,
  mileage: z.number().nonnegative(),
  nextServiceDate: z.string().datetime().nullable(),
  maintenanceStatus: vehicleMaintenanceStatusSchema,
  lastUpdatedAt: z.string().datetime(),
})
export type Vehicle = z.infer<typeof vehicleSchema>
