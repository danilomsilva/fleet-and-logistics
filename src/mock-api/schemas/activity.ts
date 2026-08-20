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
  'vehicle_entered_service',
  'vehicle_exited_service',
  'driver_status_changed',
  'driver_completed_delivery',
  'service_scheduled',
  'service_started',
  'service_completed',
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
