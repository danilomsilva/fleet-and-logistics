import { z } from 'zod'
import { entityRefSchema } from './common'

export const alertTypeSchema = z.enum([
  'vehicle_maintenance_due',
  'delivery_delayed',
  'driver_unavailable',
  'vehicle_offline',
  'assignment_conflict',
])
export type AlertType = z.infer<typeof alertTypeSchema>

export const alertPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export type AlertPriority = z.infer<typeof alertPrioritySchema>

export const alertStatusSchema = z.enum(['active', 'acknowledged', 'resolved'])
export type AlertStatus = z.infer<typeof alertStatusSchema>

export const alertSchema = z.object({
  id: z.string(),
  type: alertTypeSchema,
  priority: alertPrioritySchema,
  status: alertStatusSchema,
  relatedEntity: entityRefSchema,
  message: z.string(),
  timestamp: z.string().datetime(),
})
export type Alert = z.infer<typeof alertSchema>
