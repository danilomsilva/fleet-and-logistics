import { z } from 'zod'

export const maintenanceTypeSchema = z.enum([
  'oil_change',
  'tire_rotation',
  'inspection',
  'brake_service',
  'repair',
])
export type MaintenanceType = z.infer<typeof maintenanceTypeSchema>

export const maintenanceStatusSchema = z.enum(['scheduled', 'due', 'in_progress', 'completed'])
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>

export const maintenancePrioritySchema = z.enum(['low', 'medium', 'high'])
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>

export const maintenanceRecordSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  maintenanceType: maintenanceTypeSchema,
  status: maintenanceStatusSchema,
  priority: maintenancePrioritySchema,
  description: z.string(),
  scheduledDate: z.string().datetime(),
  completionDate: z.string().datetime().nullable(),
  mileage: z.number().nonnegative(),
  notes: z.string(),
})
export type MaintenanceRecord = z.infer<typeof maintenanceRecordSchema>
