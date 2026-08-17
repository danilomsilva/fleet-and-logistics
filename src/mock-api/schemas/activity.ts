import { z } from 'zod'
import { entityRefSchema } from './common'

export const activityEventTypeSchema = z.enum([
  'delivery_created',
  'delivery_assigned',
  'delivery_started',
  'delivery_delivered',
  'delivery_delayed',
  'delivery_cancelled',
  'vehicle_status_changed',
  'vehicle_entered_maintenance',
  'vehicle_exited_maintenance',
  'driver_status_changed',
  'driver_completed_delivery',
  'maintenance_scheduled',
  'maintenance_started',
  'maintenance_completed',
  'alert_acknowledged',
  'alert_resolved',
])
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>

export const activityEventSchema = z.object({
  id: z.string(),
  type: activityEventTypeSchema,
  relatedEntity: entityRefSchema,
  description: z.string(),
  timestamp: z.string().datetime(),
})
export type ActivityEvent = z.infer<typeof activityEventSchema>
