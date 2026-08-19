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

/** The user-editable subset of a maintenance record, used for both create and edit. */
export const maintenanceInputSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  maintenanceType: maintenanceTypeSchema,
  priority: maintenancePrioritySchema,
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  mileage: z.number().nonnegative(),
  description: z.string().trim().min(1, 'Description is required'),
  notes: z.string(),
})
export type MaintenanceInput = z.infer<typeof maintenanceInputSchema>
