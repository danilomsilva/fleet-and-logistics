import { z } from 'zod'
import { geoPointSchema } from './common'
import { vehicleTypeSchema } from './vehicle'

export const deliveryStatusSchema = z.enum([
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'delayed',
  'cancelled',
])
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>

export const deliveryPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export type DeliveryPriority = z.infer<typeof deliveryPrioritySchema>

export const deliverySchema = z.object({
  id: z.string(),
  customer: z.string(),
  pickup: geoPointSchema,
  destination: geoPointSchema,
  driverId: z.string().nullable(),
  vehicleId: z.string().nullable(),
  requiredVehicleType: vehicleTypeSchema,
  priority: deliveryPrioritySchema,
  status: deliveryStatusSchema,
  eta: z.string().datetime().nullable(),
  scheduledTime: z.string().datetime(),
  distanceKm: z.number().nonnegative(),
  notes: z.string(),
})
export type Delivery = z.infer<typeof deliverySchema>
