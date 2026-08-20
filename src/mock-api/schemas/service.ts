import { z } from 'zod'

export const serviceTypeSchema = z.enum([
  'oil_change',
  'tire_rotation',
  'inspection',
  'brake_service',
  'repair',
])
export type ServiceType = z.infer<typeof serviceTypeSchema>

export const serviceStatusSchema = z.enum(['scheduled', 'due', 'in_progress', 'completed'])
export type ServiceStatus = z.infer<typeof serviceStatusSchema>

export const servicePrioritySchema = z.enum(['low', 'medium', 'high'])
export type ServicePriority = z.infer<typeof servicePrioritySchema>

export const serviceRecordSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  serviceType: serviceTypeSchema,
  status: serviceStatusSchema,
  priority: servicePrioritySchema,
  description: z.string(),
  scheduledDate: z.string().datetime(),
  completionDate: z.string().datetime().nullable(),
  mileage: z.number().nonnegative(),
  notes: z.string(),
})
export type ServiceRecord = z.infer<typeof serviceRecordSchema>

/** The user-editable subset of a service record, used for both create and edit. */
export const serviceInputSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  serviceType: serviceTypeSchema,
  priority: servicePrioritySchema,
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  mileage: z.number().nonnegative(),
  description: z.string().trim().min(1, 'Description is required'),
  notes: z.string(),
})
export type ServiceInput = z.infer<typeof serviceInputSchema>
