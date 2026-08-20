import { z } from 'zod'
import { entityRefSchema } from './common'

export const alertTypeSchema = z.enum([
  'vehicle_service_due',
  'delivery_delayed',
  'driver_unavailable',
  'vehicle_offline',
  'assignment_conflict',
])
export type AlertType = z.infer<typeof alertTypeSchema>

export const alertStatusSchema = z.enum(['active', 'acknowledged', 'resolved'])
export type AlertStatus = z.infer<typeof alertStatusSchema>

export const alertSchema = z.object({
  id: z.string(),
  type: alertTypeSchema,
  status: alertStatusSchema,
  relatedEntity: entityRefSchema,
  message: z.string(),
  timestamp: z.string().datetime(),
})
export type Alert = z.infer<typeof alertSchema>
